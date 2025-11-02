/**
 * LoadingCard Component
 * Skeleton loader for metric cards
 */

export function LoadingCard() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-32 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}