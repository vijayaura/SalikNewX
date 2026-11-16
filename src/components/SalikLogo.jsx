import salikLogo from '../assets/salik-logo.png'

const sizes = {
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-11',
}

export default function SalikLogo({ size = 'md', className = '' }) {
  return (
    <img
      src={salikLogo}
      alt="Salik"
      draggable={false}
      className={`block w-auto max-w-[140px] object-contain object-left ${sizes[size]} ${className}`}
    />
  )
}