import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';

const TYPE_COLORS = {
  Komoditas: '#f59e0b', Provinsi: '#14b8a6', Kota: '#14b8a6',
  Cuaca: '#06b6d4', 'Penyakit/Hama': '#ef4444', 'Pupuk/Pestisida': '#10b981',
  Organisasi: '#6366f1', Teknologi: '#8b5cf6', Ukuran: '#a855f7',
  Tanggal: '#ec4899', Persentase: '#f472b6', Entity: '#6b7280',
  Kondisi: '#84cc16', default: '#6b7280',
};

const KnowledgeGraph = ({ data, onNodeClick, height = 500 }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const elements = useMemo(() => {
    if (!data) return [];
    const nodes = (data.nodes || []).map(n => ({
      data: { id: n.id, label: n.label, type: n.type, count: n.count, sessionCount: n.sessionCount },
      classes: n.type,
    }));
    const edges = (data.edges || []).map((e, i) => ({
      data: { id: `e${i}`, source: e.source, target: e.target, label: e.label, weight: e.weight },
    }));
    return [...nodes, ...edges];
  }, [data]);

  useEffect(() => {
    if (!containerRef.current || elements.length === 0) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        { selector: 'node', style: { 'background-color': '#6366f1', label: 'data(label)', 'text-valign': 'bottom', 'text-halign': 'center', 'font-size': '10px', 'font-weight': 'bold', color: '#e5e7eb', 'text-outline-width': 2, 'text-outline-color': '#1a1a2e', width: 'mapData(count, 0, 10, 30, 70)', height: 'mapData(count, 0, 10, 30, 70)' } },
        ...Object.entries(TYPE_COLORS).map(([type, color]) => ({ selector: `.${type}`, style: { 'background-color': color } })),
        { selector: 'edge', style: { width: 1.5, 'line-color': '#4b5563', 'target-arrow-color': '#4b5563', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'arrow-scale': 0.7, label: 'data(label)', 'font-size': '8px', color: '#9ca3af', 'text-background-color': '#1a1a2e', 'text-background-opacity': 0.8, 'text-background-padding': '2px', 'text-margin-y': '-4px' } },
        { selector: ':selected', style: { 'border-color': '#a78bfa', 'border-width': 3, 'shadow-blur': 15, 'shadow-color': '#a78bfa', 'shadow-opacity': 0.5 } },
        { selector: '.highlighted', style: { 'border-color': '#fbbf24', 'border-width': 3 } },
      ],
      layout: { name: 'cose', nodeRepulsion: () => 8000, idealEdgeLength: () => 120, padding: 30 },
      userZoomingEnabled: true, userPanningEnabled: true, boxSelectionEnabled: false,
      autoungrabify: false, autounselectify: false,
      minZoom: 0.3, maxZoom: 3,
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode({ id: node.id(), label: node.data('label'), type: node.data('type'), count: node.data('count') });
      if (onNodeClick) onNodeClick(node.data());
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) cyRef.current.destroy();
    };
  }, [elements, onNodeClick]);

  const handleSearch = useCallback(() => {
    if (!cyRef.current || !searchQuery) return;
    const lower = searchQuery.toLowerCase();
    cyRef.current.nodes().removeClass('highlighted');
    cyRef.current.nodes().filter(n => n.data('label').toLowerCase().includes(lower)).addClass('highlighted');
    const first = cyRef.current.nodes('.highlighted').first();
    if (first.length) {
      cyRef.current.animate({ center: { eles: first }, zoom: 2 }, { duration: 500 });
    }
  }, [searchQuery]);

  const handleFilterByType = useCallback((type) => {
    if (!cyRef.current) return;
    if (!type) {
      cyRef.current.nodes().show();
      cyRef.current.edges().show();
      return;
    }
    cyRef.current.nodes().hide();
    cyRef.current.edges().hide();
    const visible = cyRef.current.nodes(`.${type}`);
    visible.show();
    visible.connectedEdges().show();
    cyRef.current.fit(visible, 50);
  }, []);

  const handleReset = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().removeClass('highlighted');
    cyRef.current.nodes().show();
    cyRef.current.edges().show();
    cyRef.current.fit(undefined, 50);
    setSelectedNode(null);
  }, []);

  if (!data || elements.length === 0) {
    return <div className="flex items-center justify-center h-[300px] bg-surface/60 backdrop-blur-xl rounded-3xl border border-border/30 shadow-lg text-muted text-sm">Belum ada data knowledge graph. Proses NLP terlebih dahulu.</div>;
  }

  const nodeTypes = [...new Set((data.nodes || []).map(n => n.type))];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap bg-surface/60 backdrop-blur-xl p-4 rounded-3xl border border-border/30 shadow-lg">
        <div className="flex items-center gap-1.5 bg-background/60 border border-border/50 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Cari node..." className="bg-transparent text-xs font-bold text-foreground outline-none flex-1 placeholder:text-muted/40" />
          <button onClick={handleSearch} className="text-primary text-xs font-bold">Cari</button>
        </div>
        <select onChange={e => handleFilterByType(e.target.value)} defaultValue=""
          className="bg-background/60 border border-border/50 text-foreground rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer">
          <option value="">Semua Tipe</option>
          {nodeTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={handleReset} className="px-3 py-1.5 bg-background/60 border border-border/50 text-foreground rounded-lg text-xs font-bold hover:bg-background/80 transition-colors">Reset</button>
        <span className="text-[10px] text-muted font-semibold">{data.nodes?.length || 0} node · {data.edges?.length || 0} edge</span>
      </div>

      <div ref={containerRef} style={{ height: `${height}px` }} className="bg-surface/10 backdrop-blur-xl rounded-3xl border border-border/30 shadow-lg overflow-hidden" />

      {selectedNode && (
        <div className="bg-surface/60 backdrop-blur-xl rounded-2xl border border-border/30 shadow-lg p-4 text-xs">
          <p className="font-bold text-foreground">{selectedNode.label}</p>
          <p className="text-muted">Tipe: {selectedNode.type} · Kemunculan: {selectedNode.count}</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
