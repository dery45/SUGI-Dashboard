const relationExtractor = require('./relations');
const preprocessor = require('./preprocessor');
const entityExtractor = require('./entities');

class KnowledgeGraph {
  build(documents) {
    const nodes = new Map();
    const edges = [];
    let allRelations = [];

    for (const doc of documents) {
      if (!doc.summary) continue;
      const entities = entityExtractor.extract(doc.summary);
      for (const e of entities) {
        const key = `${e.type}:${e.value}`;
        if (!nodes.has(key)) {
          nodes.set(key, {
            id: key,
            label: e.value,
            type: e.type,
            count: 0,
            sessions: new Set(),
          });
        }
        nodes.get(key).count += e.count;
        nodes.get(key).sessions.add(doc.session_id);
      }

      const sentences = doc.summary.split(/[.!?]+/).filter(s => s.trim().length > 15);
      const relations = relationExtractor.extract(sentences, entities);
      allRelations = allRelations.concat(relations);
    }

    for (const r of allRelations) {
      const srcKey = this._findNodeKey(nodes, r.source);
      const tgtKey = this._findNodeKey(nodes, r.target);
      if (srcKey && tgtKey && srcKey !== tgtKey) {
        const existing = edges.find(e =>
          e.source === srcKey && e.target === tgtKey && e.label === r.label
        );
        if (existing) {
          existing.weight += r.count;
          existing.weight = Math.min(existing.weight, 10);
        } else {
          edges.push({
            source: srcKey,
            target: tgtKey,
            label: r.label,
            weight: Math.min(r.count, 10),
            sourceType: r.sourceType,
            targetType: r.targetType,
          });
        }
      }
    }

    const nodeTypes = [...new Set(Array.from(nodes.values()).map(n => n.type))];
    const relationTypes = [...new Set(edges.map(e => e.label))];

    return {
      nodes: Array.from(nodes.values()).map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        count: n.count,
        sessionCount: n.sessions.size,
      })),
      edges,
      stats: {
        totalNodes: nodes.size,
        totalEdges: edges.length,
        nodeTypes,
        relationTypes,
        density: nodes.size > 0 ? (2 * edges.length) / (nodes.size * (nodes.size - 1)) : 0,
      },
    };
  }

  search(knowledgeGraph, query) {
    const lower = query.toLowerCase();
    const matchingNodes = knowledgeGraph.nodes.filter(n =>
      n.label.toLowerCase().includes(lower) || n.type.toLowerCase().includes(lower)
    );
    const matchingNodeIds = new Set(matchingNodes.map(n => n.id));
    const matchingEdges = knowledgeGraph.edges.filter(e =>
      matchingNodeIds.has(e.source) || matchingNodeIds.has(e.target) ||
      e.label.toLowerCase().includes(lower)
    );
    return { nodes: matchingNodes, edges: matchingEdges };
  }

  filterByType(knowledgeGraph, nodeType, relationType) {
    let nodes = knowledgeGraph.nodes;
    let edges = knowledgeGraph.edges;

    if (nodeType) nodes = nodes.filter(n => n.type === nodeType);
    if (relationType) edges = edges.filter(e => e.label === relationType);

    const nodeIds = new Set(nodes.map(n => n.id));
    edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    const edgeNodeIds = new Set();
    edges.forEach(e => { edgeNodeIds.add(e.source); edgeNodeIds.add(e.target); });
    nodes = nodes.filter(n => edgeNodeIds.has(n.id));

    return { nodes, edges };
  }

  getStats(knowledgeGraph) {
    return knowledgeGraph.stats;
  }

  _findNodeKey(nodes, label) {
    const lower = label.toLowerCase();
    for (const [key, node] of nodes) {
      if (node.label.toLowerCase() === lower) return key;
    }
    for (const [key, node] of nodes) {
      if (node.label.toLowerCase().includes(lower) || lower.includes(node.label.toLowerCase())) return key;
    }
    return null;
  }
}

module.exports = new KnowledgeGraph();
