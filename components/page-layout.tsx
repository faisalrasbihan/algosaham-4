import * as React from "react"

import { cn } from "@/lib/utils"

type PageContainerProps = React.HTMLAttributes<HTMLDivElement>

export const pageContainerClassName =
  "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"

export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(pageContainerClassName, className)}
      {...props}
    />
  )
}

type PageHeaderProps = {
  /** @deprecated Kept temporarily while older routes migrate to the simpler header. */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  aside?: React.ReactNode
  compact?: boolean
  align?: "left" | "center"
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  aside,
  compact = false,
  align = "center",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("border-b border-border/60 bg-background", className)}>
      <PageContainer className={cn(compact ? "py-8" : "py-10 sm:py-14")}>
        <div
          className={cn(
            "grid gap-6",
            aside && "lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-end",
          )}
        >
          <div
            className={cn(
              "max-w-3xl",
              align === "center" && "mx-auto w-full text-center",
            )}
          >
            <h1
              className={cn(
                "text-balance font-heading font-semibold tracking-tight text-foreground",
                compact
                  ? "text-3xl leading-tight sm:text-[2.5rem]"
                  : "text-3xl leading-tight sm:text-4xl lg:text-5xl",
              )}
            >
              {title}
            </h1>
            {description ? (
              <div
                className={cn(
                  "mt-3 max-w-3xl text-base leading-7 text-muted-foreground",
                  align === "center" && "mx-auto",
                )}
              >
                {description}
              </div>
            ) : null}
            {actions ? (
              <div
                className={cn(
                  "mt-6 flex flex-wrap items-center gap-3",
                  align === "center" && "justify-center",
                )}
              >
                {actions}
              </div>
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
  /** @deprecated Kept temporarily while older routes migrate to the simpler header. */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  aside?: React.ReactNode
  align?: "left" | "center"
  className?: string
}

export function SectionHeader({
  id,
  title,
  description,
  aside,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-4",
        align === "center"
          ? "items-center text-center"
          : "justify-between lg:flex-row lg:items-end",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        <h2
          id={id}
          className="font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground first-letter:uppercase sm:text-3xl"
        >
          {title}
        </h2>
        {description ? (
          <div
            className={cn(
              "mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base",
              align === "center" && "mx-auto",
            )}
          >
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
