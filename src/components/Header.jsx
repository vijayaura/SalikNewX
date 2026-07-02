import { Headset } from 'lucide-react'
import LivaLogo from './LivaLogo'

export default function Header({ onContactSupport, supportLoading }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="h-10 bg-white" aria-hidden />
      <div className="flex items-center justify-between gap-2 bg-white px-3 pb-2">
        <LivaLogo size="xl" />
        {onContactSupport && (
          <button
            type="button"
            onClick={onContactSupport}
            disabled={supportLoading}
            className="shrink-0 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-700 shadow-soft transition-colors hover:border-liva-orange/40 hover:text-liva-orange disabled:opacity-50"
          >
            <Headset className="w-3.5 h-3.5 text-liva-orange shrink-0" strokeWidth={2} />
            Contact support
          </button>
        )}
      </div>
    </header>
  )
}
