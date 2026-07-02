import livaLogo from '../assets/liva-logo.png'

const sizes = {
  sm: 'h-4',
  md: 'h-6',
  lg: 'h-7',
  xl: 'h-9',
}

export default function LivaLogo({ size = 'md', className = '' }) {
  return (
    <img
      src={livaLogo}
      alt="LIVA Insurance"
      draggable={false}
      className={`block w-auto object-contain bg-transparent ${sizes[size]} ${className}`}
    />
  )
}

export function LivaAvatar({ className = '' }) {
  return (
    <div
      className={`shrink-0 w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-soft ${className}`}
      aria-label="LIVA Insurance"
    >
      <img
        src={livaLogo}
        alt=""
        draggable={false}
        className="w-[18px] h-[18px] object-contain"
      />
    </div>
  )
}
