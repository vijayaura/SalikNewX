/** Phone mockup bezel — inner white screen only, no marketing sidebar. */
export default function PhoneShell({
  children,
  className = '',
  compact = false,
  withLaneTitle = false,
  fillRemaining = false,
}) {
  const shellHeight = compact
    ? withLaneTitle
      ? 'min(520px, calc(100dvh - 11rem))'
      : 'min(720px, calc(100dvh - 120px))'
    : withLaneTitle
      ? 'min(600px, calc(100dvh - 11rem))'
      : 'min(844px, calc(100dvh - 48px))'

  const wrapperClass = fillRemaining
    ? 'relative flex min-h-0 w-full max-w-[390px] flex-1 flex-col'
    : 'relative flex w-full max-w-[390px] shrink-0 flex-col'

  return (
    <div className={`${wrapperClass} ${className}`.trim()}>
      <div
        className={`relative flex w-full flex-col overflow-hidden rounded-[2.75rem] bg-gray-950 p-[10px] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_32px_64px_-12px_rgba(0,0,0,0.6),0_0_120px_-20px_rgba(240,90,40,0.15)] ${
          fillRemaining ? 'min-h-0 flex-1' : ''
        }`}
        style={fillRemaining ? undefined : { height: shellHeight }}
      >
        <div className="absolute left-0 top-28 z-20 h-8 w-[3px] rounded-r-sm bg-gray-700/80" aria-hidden />
        <div className="absolute left-0 top-40 z-20 h-12 w-[3px] rounded-r-sm bg-gray-700/80" aria-hidden />
        <div className="absolute right-0 top-36 z-20 h-16 w-[3px] rounded-l-sm bg-gray-700/80" aria-hidden />

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2.25rem] bg-white ring-1 ring-black/5">
          <div className="absolute top-2 left-1/2 z-50 flex h-[28px] w-[100px] -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-gray-950">
            <div className="h-2 w-2 rounded-full bg-gray-800 ring-1 ring-gray-700" />
            <div className="h-2.5 w-10 rounded-full bg-gray-900" />
          </div>

          {children}
        </div>
      </div>

      {compact || fillRemaining ? null : (
        <div className="mt-2 flex shrink-0 justify-center">
          <div className="h-1 w-28 rounded-full bg-white/20" />
        </div>
      )}
    </div>
  )
}