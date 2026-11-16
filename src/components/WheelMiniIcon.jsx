/** Tiny wheel glyph for spin prompts */
export default function WheelMiniIcon({ className = 'h-3 w-3' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 8V2.2M8 8l5.2 3M8 8 2.8 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="8" cy="8" r="1.6" fill="currentColor" />
    </svg>
  )
}