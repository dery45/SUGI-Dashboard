import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-2xl bg-rose-500/10 mb-4">
        <AlertTriangle className="w-10 h-10 text-rose-400" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">Terjadi Kesalahan</h3>
      <p className="text-sm text-muted-foreground/60 max-w-sm mb-4">
        {message || 'Gagal memuat data. Silakan coba lagi.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Coba Lagi
        </button>
      )}
    </div>
  );
};

export default ErrorState;
