import type { ReactNode } from 'react'

const DESKTOP_RAIL_TOP_OFFSET_CLASS = 'md:top-[69px]'
const DESKTOP_RAIL_HEIGHT_CLASS = 'md:h-[calc(100dvh-69px)]'

type DesktopStickyRailProps = {
  children: ReactNode
  className?: string
}

type DesktopStickyPanelProps = {
  children: ReactNode
  className?: string
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function DesktopStickyRail({ children, className }: DesktopStickyRailProps) {
  return (
    <aside className="hidden md:block md:w-[240px]">
      <div
        className={joinClasses(
          'md:fixed md:left-0 md:block md:w-[240px] md:overflow-hidden',
          DESKTOP_RAIL_TOP_OFFSET_CLASS,
          DESKTOP_RAIL_HEIGHT_CLASS,
          className,
        )}
      >
        {children}
      </div>
    </aside>
  )
}

export function DesktopStickyPanel({ children, className }: DesktopStickyPanelProps) {
  return (
    <aside
      className={joinClasses(
        'hidden md:sticky md:block md:self-start md:justify-self-stretch',
        DESKTOP_RAIL_TOP_OFFSET_CLASS,
        className,
      )}
    >
      <section className="card-surface md:w-full md:overflow-hidden md:border md:border-[color:var(--app-border)]">
        {children}
      </section>
    </aside>
  )
}
