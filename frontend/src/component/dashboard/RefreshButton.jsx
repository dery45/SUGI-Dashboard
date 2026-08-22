import React from 'react';
import { RefreshCw } from 'lucide-react';

const RefreshButton = ({ onClick, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 bg-background/60 border border-border/50 text-foreground rounded-xl text-xs font-bold hover:bg-background/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Memuat...' : 'Refresh'}
    </button>
  );
};

export default RefreshButton;
