import FlowIntro from './FlowIntro'

export default function MobileFrame({ children }) {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden flex bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[520px] h-[520px] rounded-full bg-liva-orange/[0.09] blur-[110px]" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-sky-500/[0.06] blur-[90px]" />
      </div>

      <aside className="relative hidden lg:flex lg:w-1/2 items-center justify-center">
        <FlowIntro />
      </aside>

      <div className="relative w-full lg:w-1/2 flex items-center justify-center lg:justify-start lg:pl-10 xl:pl-16 p-3 sm:p-6 min-h-0">
        <div className="relative w-full max-w-[390px] flex flex-col shrink-0">
          <div
            className="relative flex flex-col w-full overflow-hidden rounded-[2.75rem] bg-gray-950 p-[10px] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_32px_64px_-12px_rgba(0,0,0,0.6),0_0_120px_-20px_rgba(240,90,40,0.15)]"
            style={{ height: 'min(844px, calc(100dvh - 48px))' }}
          >
            <div className="absolute left-0 top-28 w-[3px] h-8 rounded-r-sm bg-gray-700/80 z-20" aria-hidden />
            <div className="absolute left-0 top-40 w-[3px] h-12 rounded-r-sm bg-gray-700/80 z-20" aria-hidden />
            <div className="absolute right-0 top-36 w-[3px] h-16 rounded-l-sm bg-gray-700/80 z-20" aria-hidden />

            <div className="relative flex flex-col flex-1 min-h-0 rounded-[2.25rem] overflow-hidden bg-white ring-1 ring-black/5">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-[100px] h-[28px] bg-gray-950 rounded-full flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-800 ring-1 ring-gray-700" />
                <div className="w-10 h-2.5 rounded-full bg-gray-900" />
              </div>

              {children}
            </div>
          </div>

          <div className="flex justify-center mt-2 shrink-0">
            <div className="w-28 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  )
}
