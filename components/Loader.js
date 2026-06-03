export default function Loader({ size = 'medium', className = '' }) {
  const sizes = {
    small: 'h-5 w-5 border-2',
    medium: 'h-10 w-10 border-4',
    large: 'h-16 w-16 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-gray-200 border-t-blue-600 dark:border-gray-800 dark:border-t-blue-400`}
      />
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-md bg-white dark:bg-gray-950 p-4 space-y-4">
      <Skeleton className="w-full aspect-square" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/4" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
