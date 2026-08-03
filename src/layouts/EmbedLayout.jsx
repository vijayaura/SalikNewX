import { useSearchParams } from 'react-router-dom'
import PhoneShell from '../components/PhoneShell'

/**
 * /chat layout for host-app embedding.
 * ?embed=1 — bare chat UI (iframe-friendly, no phone bezel)
 * default — centered phone mockup without marketing sidebar
 */
export default function EmbedLayout({ children }) {
  const [searchParams] = useSearchParams()
  const bare = searchParams.get('embed') === '1'

  if (bare) {
    return (
      <div className="embed-root h-[100dvh] w-full overflow-hidden bg-white">
        {children}
      </div>
    )
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-3 sm:p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[520px] h-[520px] rounded-full bg-liva-orange/[0.09] blur-[110px]" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-sky-500/[0.06] blur-[90px]" />
      </div>
      <PhoneShell className="relative z-10">{children}</PhoneShell>
    </div>
  )
}
