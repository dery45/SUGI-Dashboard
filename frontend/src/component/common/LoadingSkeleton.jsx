function LoadingSkeleton({ variant = 'kpi', count = 4 }) {
  const variants = {
    kpi: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-20 w-full" />
        ))}
      </div>
    ),
    map: (
      <div className="animate-pulse bg-gray-200 rounded-3xl h-[400px] w-full" />
    ),
    chart: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-3xl h-64 w-full" />
        ))}
      </div>
    ),
    table: (
      <div className="animate-pulse bg-gray-200 rounded-xl h-96 w-full" />
    ),
  };
  return variants[variant] || variants.kpi;
}

export default LoadingSkeleton;