import { Card, CardContent } from "@/components/ui/card"

export function StrategyCardSkeleton() {
  return (
    <div className="py-4">
      <Card className="w-[340px] md:w-[380px] min-h-[400px] snap-start shrink-0 animate-pulse">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Header skeleton */}
            <div className="space-y-2">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-shimmer bg-[length:200%_100%]" />
              </div>
            </div>

            {/* Return highlight skeleton */}
            <div className="border-t border-b border-border py-4">
              <div className="text-center space-y-2">
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 mx-auto animate-shimmer bg-[length:200%_100%]" />
                <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 mx-auto animate-shimmer bg-[length:200%_100%]" />
              </div>
            </div>

            {/* Metrics skeleton */}
            <div className="space-y-3 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center space-y-2">
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 mx-auto animate-shimmer bg-[length:200%_100%]" />
                </div>
                <div className="text-center space-y-2">
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 mx-auto animate-shimmer bg-[length:200%_100%]" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center space-y-2">
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-12 mx-auto animate-shimmer bg-[length:200%_100%]" />
                </div>
                <div className="text-center space-y-2">
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-12 mx-auto animate-shimmer bg-[length:200%_100%]" />
                </div>
                <div className="text-center space-y-2">
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-12 mx-auto animate-shimmer bg-[length:200%_100%]" />
                </div>
              </div>
            </div>

            {/* Button skeleton */}
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] mt-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

