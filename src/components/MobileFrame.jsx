import FlowIntro from './FlowIntro'
import PhoneShell from './PhoneShell'

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
        <PhoneShell>{children}</PhoneShell>
      </div>
    </div>
  )
}
