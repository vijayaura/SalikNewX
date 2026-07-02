import insterLogo from '../assets/inster-logo.png'

export default function PoweredByInster() {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-gray-500 whitespace-nowrap">
        Powered by
      </span>
      <img
        src={insterLogo}
        alt="Aura"
        draggable={false}
        className="h-4 w-auto object-contain opacity-70 mix-blend-multiply"
      />
    </div>
  )
}
