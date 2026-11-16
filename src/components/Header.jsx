import { Headset } from 'lucide-react'
import LivaLogo from './LivaLogo'
import FlowModeToggle from './FlowModeToggle'

export default function Header({
  onContactSupport,
  supportLoading,
  flowMode = 'chat',
  onFlowModeChange,
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="h-10 bg-white" aria-hidden />
      <div className="flex items-center justify-between gap-2 bg-white px-3 pb-2 pt-0.5">
        <LivaLogo size="md" className="shrink-0" />

        <div className="flex shrink-0 items-center gap-1.5">
          {onFlowModeChange && <FlowModeToggle value={flowMode} onChange={onFlowModeChange} />}

          {onContactSupport ? (
            <button
              type="button"
              onClick={onContactSupport}
              disabled={supportLoading}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-700 shadow-soft transition-colors hover:border-liva-orange/40 hover:text-liva-orange disabled:opacity-50"
            >
              <Headset className="h-3.5 w-3.5 shrink-0 text-liva-orange" strokeWidth={2} />
              <span className="hidden min-[360px]:inline">Support</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}