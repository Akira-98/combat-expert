export function BootSplash() {
  return (
    <div className="app-theme min-h-dvh overflow-hidden bg-[#070b12] text-white">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-3 pb-8 pt-0 md:px-4 xl:px-0">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-10%] top-[-8rem] h-64 w-64 rounded-full bg-[#bfdbfe]/8 blur-3xl" />
          <div className="absolute right-[-6%] top-24 h-72 w-72 rounded-full bg-[#f59e0b]/10 blur-3xl" />
          <div className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-[#22d3ee]/8 blur-3xl" />
        </div>

        <header
          className="sticky top-0 z-10 border-b border-slate-900/70 bg-[#070b12]/95 px-3 pb-0 backdrop-blur md:px-4 md:pb-0 xl:px-0"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 4px)' }}
        >
          <div className="section-shell flex min-h-[68px] items-center justify-between gap-2.5 bg-transparent px-2.5 py-1.5 md:gap-4 md:p-4">
            <div className="min-w-0 self-center py-0 md:py-0.5">
              <div className="ui-text-strong ui-mma-logo whitespace-nowrap pt-0.5 text-[22px] leading-[1.18] md:pt-0 md:text-[27px] md:leading-[1.15]">
                Combat Expert
              </div>
            </div>
            <div className="h-8 w-24 animate-pulse rounded-full border border-white/10 bg-white/8 md:h-10 md:w-32" />
          </div>
        </header>

        <div className="hidden px-3 md:block md:px-4 xl:px-0">
          <div className="h-px bg-white/10" />
        </div>

        <main className="relative mt-0 grid flex-1 items-start gap-3 px-0 md:grid-cols-[240px_minmax(0,1fr)_316px] md:gap-4 md:px-0">
          <aside className="hidden min-h-[calc(100dvh-8rem)] md:block md:border-r md:border-[color:var(--app-border)] md:bg-[color:var(--app-surface)]">
            <div className="grid h-full grid-rows-[auto_1fr_auto]">
              <div className="flex items-center gap-2 border-b border-[color:var(--app-border)] px-4 py-4">
                <div className="h-5 w-24 animate-pulse rounded bg-white/12" />
              </div>
              <div className="min-h-0 px-4 py-4">
                <div className="card-surface-soft card-shell h-full w-full animate-pulse" />
              </div>
              <div className="grid gap-2 border-t border-[color:var(--app-border)] px-4 py-4">
                <div className="h-10 animate-pulse rounded-lg bg-white/8" />
                <div className="h-10 animate-pulse rounded-lg bg-white/8" />
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="grid gap-3 px-3 pt-4 md:px-0 md:pt-6">
              <div className="flex items-end justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
                  <div className="h-10 w-56 animate-pulse rounded bg-white/14 md:w-72" />
                </div>
                <div className="hidden h-10 w-32 animate-pulse rounded-full bg-white/10 md:block" />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="card-surface-soft card-shell h-40 animate-pulse" />
                <div className="card-surface-soft card-shell h-40 animate-pulse" />
                <div className="card-surface-soft card-shell hidden h-40 animate-pulse xl:block" />
              </div>

              <div className="card-surface-soft card-shell p-3 md:p-4">
                <div className="mb-3 h-5 w-40 animate-pulse rounded bg-white/12" />
                <div className="grid gap-2.5">
                  <div className="h-18 animate-pulse rounded-xl bg-white/8" />
                  <div className="h-18 animate-pulse rounded-xl bg-white/8" />
                  <div className="h-18 animate-pulse rounded-xl bg-white/8" />
                  <div className="h-18 animate-pulse rounded-xl bg-white/8" />
                </div>
              </div>
            </div>
          </section>

          <aside className="hidden min-h-[calc(100dvh-8rem)] md:block">
            <div className="card-surface-soft card-shell-xl sticky top-24 h-[calc(100dvh-8.5rem)] animate-pulse" />
          </aside>
        </main>
      </div>
    </div>
  )
}
