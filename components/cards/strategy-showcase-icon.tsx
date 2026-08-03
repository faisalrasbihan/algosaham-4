import { cn } from "@/lib/utils"

interface StrategyShowcaseIconProps {
  strategyId: string
  strategyName: string
  variant?: number
  className?: string
}

function getIconVariant(value: string) {
  let seed = 0

  for (let index = 0; index < value.length; index += 1) {
    seed = (seed * 31 + value.charCodeAt(index)) >>> 0
  }

  return seed % 7
}

export function StrategyShowcaseIcon({
  strategyId,
  strategyName,
  variant: requestedVariant,
  className,
}: StrategyShowcaseIconProps) {
  const variant = requestedVariant === undefined
    ? getIconVariant(`${strategyId}-${strategyName}`)
    : ((requestedVariant % 7) + 7) % 7

  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#ead8c6] bg-gradient-to-br from-[#fbf5ef] via-[#f6e8dc] to-[#edd3bb] shadow-sm",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="h-full w-full" fill="none">
        {variant === 0 && (
          <>
            <circle cx="10" cy="10" r="5.5" fill="#edb27a" />
            <circle cx="20.5" cy="13.5" r="6.5" fill="#d07225" fillOpacity="0.88" />
            <circle cx="12" cy="22" r="5" fill="#9d5420" fillOpacity="0.8" />
            <circle cx="19" cy="12" r="2.2" fill="#fff8f1" fillOpacity="0.8" />
          </>
        )}

        {variant === 1 && (
          <>
            <path d="M5 10.5C9 5.2 14.5 5.2 18.5 10.5C22 15 25 14.4 27 11.5" stroke="#d07225" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M5 21.5C9 16.2 14.5 16.2 18.5 21.5C22 26 25 25.4 27 22.5" stroke="#a95b20" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="16" cy="16" r="3.2" fill="#f5c79c" />
          </>
        )}

        {variant === 2 && (
          <>
            <rect x="4" y="8" width="19" height="7" rx="3.5" transform="rotate(-18 4 8)" fill="#e7a15f" />
            <rect x="9" y="17" width="19" height="7" rx="3.5" transform="rotate(-18 9 17)" fill="#b86121" />
            <circle cx="23" cy="8" r="3.4" fill="#fff7ef" fillOpacity="0.9" />
          </>
        )}

        {variant === 3 && (
          <>
            <path d="M7 23V17H12V12H18V7H25" stroke="#d07225" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 25H25" stroke="#9d5420" strokeWidth="3" strokeLinecap="round" opacity="0.72" />
            <circle cx="23.5" cy="7" r="3" fill="#f5c79c" />
          </>
        )}

        {variant === 4 && (
          <>
            <circle cx="9" cy="9" r="4" fill="#d07225" />
            <circle cx="22.5" cy="10.5" r="5.5" fill="#e9a565" />
            <circle cx="10.5" cy="22.5" r="5.5" fill="#b86121" />
            <circle cx="22" cy="22" r="4" fill="#f1c191" />
            <path d="M11.5 11.5L19 19" stroke="#fff9f3" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          </>
        )}

        {variant === 5 && (
          <>
            <path d="M7 9H15C19.5 9 23 12.5 23 17V23" stroke="#d07225" strokeWidth="5" strokeLinecap="round" />
            <path d="M7 23V18C7 14.7 9.7 12 13 12H25" stroke="#a95b20" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
            <circle cx="23" cy="9" r="3" fill="#f2bd89" />
          </>
        )}

        {variant === 6 && (
          <>
            <path d="M6 21C9 21 9 11 13 11C17 11 16 23 21 23C24 23 24.5 17 26 14" stroke="#b86121" strokeWidth="4" strokeLinecap="round" />
            <circle cx="7" cy="10" r="4" fill="#e9a565" />
            <circle cx="23" cy="9" r="5" fill="#d07225" fillOpacity="0.82" />
            <circle cx="23" cy="9" r="2" fill="#fff8f1" fillOpacity="0.9" />
          </>
        )}
      </svg>
    </span>
  )
}
