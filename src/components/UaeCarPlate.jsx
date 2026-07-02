/** Parse plate string e.g. "A 57123" → { code: "A", number: "57123" } */
export function parsePlate(plate) {
  const match = plate.trim().match(/^([A-Za-z]+)\s*(\d+)$/)
  if (match) return { code: match[1].toUpperCase(), number: match[2] }
  return { code: '', number: plate }
}

export default function UaeCarPlate({ plate, emirate = 'Dubai', compact = false, className = '' }) {
  const { code, number } = parsePlate(plate)

  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-md border border-gray-300 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] shrink-0 ${
        compact ? 'h-7 min-w-[108px]' : 'h-9 min-w-[140px]'
      } ${className}`}
      role="img"
      aria-label={`${emirate} plate ${code} ${number}`}
    >
      <div className="flex flex-col items-center justify-center bg-[#C8102E] text-white shrink-0 w-7 px-0.5">
        <span className="text-[6px] font-bold leading-none tracking-tight opacity-90">UAE</span>
        <span className={`font-bold leading-none mt-0.5 ${compact ? 'text-[7px]' : 'text-[8px]'}`}>
          {emirate.slice(0, 3).toUpperCase()}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center gap-1 px-2 bg-gradient-to-b from-white to-gray-50 min-w-0">
        {code && (
          <span
            className={`font-black text-gray-900 leading-none shrink-0 ${
              compact ? 'text-[13px]' : 'text-base'
            }`}
          >
            {code}
          </span>
        )}
        <span
          className={`font-black text-gray-900 tracking-wide leading-none ${
            compact ? 'text-[13px]' : 'text-base'
          }`}
        >
          {number}
        </span>
      </div>
    </div>
  )
}
