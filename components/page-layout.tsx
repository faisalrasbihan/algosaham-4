import * as React from "react"

import { cn } from "@/lib/utils"

type PageContainerProps = React.HTMLAttributes<HTMLDivElement>

export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  )
}

type PageHeaderProps = {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  aside?: React.ReactNode
  compact?: boolean
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  aside,
  compact = false,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("bg-background", className)}>
      <PageContainer className={cn(compact ? "py-8" : "py-10 sm:py-12")}>
        <div
          className={cn(
            "grid gap-6",
            aside && "lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-end",
          )}
        >
          <div className="max-w-3xl">
            {eyebrow ? (
              <div className="mb-3 font-ibm-plex-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ochre">
                {eyebrow}
              </div>
            ) : null}
            <h1
              className={cn(
                "text-balance font-sans font-bold tracking-[-0.035em] text-foreground",
                compact
                  ? "text-3xl leading-tight sm:text-4xl"
                  : "text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]",
              )}
            >
              {title}
            </h1>
            {description ? (
              <div className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                {description}
              </div>
            ) : null}
            {actions ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>
          {aside ? <div>{aside}</div> : null}
        </div>
      </PageContainer>
    </header>
  )
}

type SectionHeaderProps = {
  id?: string
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  aside?: React.ReactNode
  className?: string
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  aside,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="mb-2 font-ibm-plex-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ochre">
            {eyebrow}
          </div>
        ) : null}
        <h2
          id={id}
          className="flex items-start gap-2 font-ibm-plex-mono text-xl font-bold leading-8 tracking-[-0.025em] text-foreground sm:text-2xl"
        >
          <span className="select-none text-ochre" aria-hidden="true">
            |
          </span>
          <span>{title}</span>
        </h2>
        {description ? (
          <div className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  )
}

type PageSectionProps = React.ComponentPropsWithoutRef<"section"> & {
  contained?: boolean
}

export function PageSection({
  className,
  contained = true,
  children,
  ...props
}: PageSectionProps) {
  if (!contained) {
    return (
      <section className={cn("py-10 sm:py-12", className)} {...props}>
        {children}
      </section>
    )
  }

  return (
    <section className={cn("py-10 sm:py-12", className)} {...props}>
      <PageContainer>{children}</PageContainer>
    </section>
  )
}

export const Surface = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
))
Surface.displayName = "Surface"
