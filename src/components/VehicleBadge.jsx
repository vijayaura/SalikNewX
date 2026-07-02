import ToyotaLogo from './ToyotaLogo'

const BADGE_HEIGHT = 'h-8'
const STRIP_WIDTH = 'w-7'

export default function VehicleBadge({ model, year, compact = false }) {
  const shortModel = model.replace(/^Toyota\s+/i, '')

  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-md border border-gray-300 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] w-full min-w-0 ${BADGE_HEIGHT}`}
      role="img"
      aria-label={`Toyota ${shortModel} ${year}`}
    >
      <div
        className={`flex items-center justify-center bg-white border-r border-gray-200 shrink-0 ${STRIP_WIDTH}`}
      >
        <ToyotaLogo className="w-[22px] h-[22px]" />
      </div>

      <div className="flex flex-1 items-center min-w-0 px-2 bg-gradient-to-b from-white to-gray-50">
        <p
          className={`font-semibold text-gray-900 leading-none truncate w-full ${
            compact ? 'text-[11px]' : 'text-xs'
          }`}
        >
          {compact ? (
            <>
              {shortModel}{' '}
              <span className="text-gray-500 font-medium">'{String(year).slice(-2)}</span>
            </>
          ) : (
            <>
              {model}{' '}
              <span className="text-gray-500 font-medium">{year}</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export { BADGE_HEIGHT, STRIP_WIDTH }
