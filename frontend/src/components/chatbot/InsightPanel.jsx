import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, BarChart3, Smile, Info } from 'lucide-react';

const TYPE_ICONS = { metric: BarChart3, trend: TrendingUp, warning: AlertTriangle, sentiment: Smile, activity: Info, topic: Lightbulb, commodity: Info, location: Info, intent: Info, comparison: TrendingUp };
const TYPE_COLORS = { metric: 'from-blue-400 to-blue-600', trend: 'from-emerald-400 to-emerald-600', warning: 'from-red-400 to-red-600', sentiment: 'from-purple-400 to-purple-600', activity: 'from-cyan-400 to-cyan-600', topic: 'from-amber-400 to-amber-600', commodity: 'from-orange-400 to-orange-600', location: 'from-teal-400 to-teal-600', intent: 'from-violet-400 to-violet-600', comparison: 'from-pink-400 to-pink-600' };

const InsightPanel = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-foreground/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Lightbulb className="w-8 h-8 text-muted/30 mb-2" />
        <p className="text-sm text-muted font-medium">Belum ada insight yang tersedia.</p>
        <p className="text-[10px] text-muted/50">Proses NLP untuk menghasilkan insight otomatis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, i) => {
        const Icon = TYPE_ICONS[insight.type] || Lightbulb;
        const color = TYPE_COLORS[insight.type] || 'from-gray-400 to-gray-600';
        return (
          <div key={i} className="flex items-start gap-3 bg-surface/30 backdrop-blur-sm rounded-xl border border-border/20 p-4 hover:bg-surface/50 transition-colors">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground leading-relaxed">{insight.text}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted/50 mt-1 block">{insight.type}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InsightPanel;
