import { Card, CardContent } from "@/components/ui/card"

export function StrategyCardSkeleton({ type = "regular" }: { type?: "subscribed" | "regular" | "showcase" }) {
  if (type === "showcase") {
    return (
      <div className="py-4">
        <Card className="min-w-[520px] min-h-[280px] shrink-0 animate-pulse border border-border bg-gradient-to-br from-amber-50/20 to-card">
          <CardContent className="p-5 h-full flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Header skeleton */}
              <div className="flex items-start justify-between">
                <div className="h-5 bg-gradient-to-r from-muted to-muted/50 rounded w-1/3" />
                <div className="h-5 w-16 bg-gradient-to-r from-amber-100/50 to-amber-100/30 rounded" />
              </div>

              {/* Return skeleton */}
              <div className="flex items-center justify-between pt-2 pb-1">
                <div className="space-y-2">
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-16" />
                  <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded w-24" />
                </div>
                <div className="h-12 w-[134px] bg-gradient-to-r from-muted to-muted/50 rounded" />
              </div>

              {/* Metrics skeleton */}
              <div className="flex items-start gap-4 pt-1">
                <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-16" />
                      <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-12" />
                    </div>
                  ))}
                </div>
                <div className="flex-shrink-0 space-y-2">
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-24" />
                  <div className="grid grid-cols-6 gap-1 w-[150px]">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="w-5 h-5 rounded-sm bg-gradient-to-r from-muted to-muted/50" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="pt-2">
                <div className="h-8 w-full rounded bg-gradient-to-r from-muted to-muted/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-4">
      <Card className="w-80 min-h-[380px] shrink-0 animate-pulse border border-border">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="space-y-3 flex-1 flex flex-col">
            {/* Header skeleton */}
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gradient-to-r from-muted to-muted/50 rounded w-3/4" />
                <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-full" />
                <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-5/6" />
                {type === "subscribed" && (
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-1/2 mt-2" />
                )}
              </div>
            </div>

            {type === "subscribed" && (
              <div className="flex items-center justify-between py-2 border-t border-border mt-1">
                <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-20" />
                <div className="flex -space-x-2 py-1 px-1">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-muted to-muted/50 border-2 border-background" />
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-muted to-muted/50 border-2 border-background" />
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-muted to-muted/50 border-2 border-background" />
                </div>
              </div>
            )}

            {/* Return skeleton */}
            <div className="border-t border-b border-border py-3">
              {type === "regular" ? (
                <div className="text-center space-y-2">
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-16 mx-auto" />
                  <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded w-24 mx-auto" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-32" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center space-y-1">
                      <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-20 mx-auto" />
                      <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded w-16 mx-auto" />
                    </div>
                    <div className="text-center space-y-1">
                      <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-24 mx-auto" />
                      <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded w-16 mx-auto" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metrics skeleton */}
            <div className="space-y-3 flex-1 font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center space-y-2 mt-1">
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded mx-auto w-20" />
                  <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-12 mx-auto" />
                </div>
                <div className="text-center space-y-2 mt-1">
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded mx-auto w-20" />
                  <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-12 mx-auto" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center space-y-2">
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-12 mx-auto" />
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-10 mx-auto" />
                </div>
                <div className="text-center space-y-2">
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-12 mx-auto" />
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-6 mx-auto" />
                </div>
                <div className="text-center space-y-2">
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-12 mx-auto" />
                  <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-6 mx-auto" />
                </div>
              </div>
            </div>

            {/* Date skeleton */}
            <div className="pt-2 border-t border-border flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-muted to-muted/50" />
              <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-40" />
            </div>

            {/* Actions skeleton */}
            <div className={`flex items-center gap-2 ${type === 'subscribed' ? 'pt-1' : 'pt-2 border-t border-border'}`}>
              {type === "subscribed" ? (
                <div className="h-9 w-full rounded bg-gradient-to-r from-muted to-muted/50" />
              ) : (
                <>
                  <div className="h-9 w-1/4 rounded bg-gradient-to-r from-muted to-muted/50" />
                  <div className="h-9 w-1/4 rounded bg-gradient-to-r from-muted to-muted/50" />
                  <div className="h-9 w-1/4 rounded bg-gradient-to-r from-muted to-muted/50" />
                  <div className="h-9 w-1/4 rounded bg-gradient-to-r from-muted to-muted/50" />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

