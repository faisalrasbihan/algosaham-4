import { Card, CardContent } from "@/components/ui/card"

export function StrategyCardSkeleton({ type = "regular" }: { type?: "subscribed" | "regular" | "showcase" }) {
  if (type === "showcase") {
    return (
      <div className="py-4">
        <Card
          className="w-[calc(100vw-3rem)] max-w-[520px] min-h-[280px] shrink-0 overflow-hidden border animate-pulse sm:min-w-[520px]"
          style={{
            borderColor: "rgba(191, 160, 74, 0.32)",
            backgroundImage: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,248,243,0.98) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(212,175,55,0.08)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(191,160,74,0.45), transparent)" }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 h-32 w-32"
            style={{ background: "radial-gradient(circle at top right, rgba(212,175,55,0.14), transparent 68%)" }}
          />
          <CardContent className="relative z-10 p-4 sm:p-5">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 pr-8 sm:pr-10">
                  <div className="mb-2 h-2.5 w-20 rounded bg-muted/70" />
                  <div className="h-5 w-40 rounded bg-muted/80" />
                </div>
                <div className="h-8 w-8 rounded-md bg-[#d4af37]/70 shadow-sm" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-12 rounded bg-muted/60" />
                  <div className="h-8 w-28 rounded bg-muted/80 sm:h-9 sm:w-32" />
                </div>
                <div className="flex h-10 w-full max-w-[148px] items-end gap-0.5 self-start sm:h-12 sm:w-[134px] sm:self-auto">
                  {[35, 48, 40, 58, 62, 45, 74, 52, 68, 84, 64, 92].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-emerald-400/45"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-start">
                <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-16 rounded bg-muted/60" />
                      <div className="h-4 w-12 rounded bg-muted/80" />
                    </div>
                  ))}
                </div>
                <div className="flex-shrink-0 space-y-2">
                  <div className="h-3 w-28 rounded bg-muted/60" />
                  <div className="grid grid-cols-6 gap-1">
                    {[
                      "bg-emerald-200",
                      "bg-emerald-300",
                      "bg-slate-200",
                      "bg-red-200",
                      "bg-emerald-200",
                      "bg-slate-200",
                      "bg-emerald-300",
                      "bg-emerald-200",
                      "bg-red-200",
                      "bg-slate-200",
                      "bg-emerald-200",
                      "bg-emerald-300",
                    ].map((color, i) => (
                      <div key={i} className={`h-4 w-4 rounded-sm sm:h-5 sm:w-5 ${color}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="h-8 w-full rounded-md border border-[rgba(191,160,74,0.32)] bg-white/80" />
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
