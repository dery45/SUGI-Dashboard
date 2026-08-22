import React from 'react';

const SkeletonLine = ({ width }) => (
  <div className={`h-3 bg-border/40 rounded-full animate-pulse ${width || 'w-full'}`} />
);

const LoadingSkeleton = ({ variant, count }) => {
  const items = Array.from({ length: count || 1 });

  if (variant === 'card' || variant === 'chart') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {items.map((_, i) => (
          <div key={i} className="bg-surface/60 backdrop-blur-xl p-6 rounded-3xl border border-border/30">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-lg bg-border/40 animate-pulse" />
              <SkeletonLine width="w-48" />
            </div>
            <div className="space-y-3">
              <div className="h-[200px] bg-border/20 rounded-2xl animate-pulse" />
              <div className="flex gap-2">
                <SkeletonLine width="w-16" />
                <SkeletonLine width="w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'kpi') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((_, i) => (
          <div key={i} className="bg-surface/60 backdrop-blur-xl p-7 rounded-3xl border border-border/30">
            <div className="flex items-start justify-between mb-5">
              <SkeletonLine width="w-24" />
              <div className="w-9 h-9 rounded-xl bg-border/40 animate-pulse" />
            </div>
            <SkeletonLine width="w-32" />
            <div className="mt-2">
              <SkeletonLine width="w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'map') {
    return (
      <div className="bg-surface/60 backdrop-blur-xl p-6 rounded-3xl border border-border/30">
        <div className="flex items-center justify-between mb-4">
          <SkeletonLine width="w-40" />
          <SkeletonLine width="w-32" />
        </div>
        <div className="h-[480px] bg-border/20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="bg-surface/60 backdrop-blur-xl p-6 rounded-3xl border border-border/30">
        <div className="flex items-center justify-between mb-4">
          <SkeletonLine width="w-36" />
          <SkeletonLine width="w-24" />
        </div>
        <div className="space-y-2">
          <div className="flex gap-4 p-3">
            {[...Array(4)].map((_, i) => <SkeletonLine key={i} width="w-1/4" />)}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-3 border-t border-border/20">
              {[...Array(4)].map((_, j) => <SkeletonLine key={j} width="w-1/4" />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((_, i) => (
        <div key={i} className="bg-surface/60 backdrop-blur-xl p-6 rounded-3xl border border-border/30">
          <SkeletonLine width="w-3/4" />
          <div className="mt-3 space-y-2">
            <SkeletonLine />
            <SkeletonLine width="w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
