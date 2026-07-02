import toyotaLogo from '../assets/toyota-logo.png'

export default function ToyotaLogo({ className = 'w-5 h-5' }) {
  return (
    <img
      src={toyotaLogo}
      alt=""
      draggable={false}
      className={`block object-contain bg-transparent ${className}`}
    />
  )
}
