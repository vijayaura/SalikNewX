import { Car, CreditCard, Globe2, Mountain, ShieldCheck } from 'lucide-react'

export const ADDON_ICONS = {
  gcc: { Icon: Globe2, bg: 'bg-teal-500', light: 'bg-teal-50' },
  ncd: { Icon: ShieldCheck, bg: 'bg-emerald-500', light: 'bg-emerald-50' },
  'rent-a-car': { Icon: Car, bg: 'bg-blue-500', light: 'bg-blue-50' },
  offroad: { Icon: Mountain, bg: 'bg-orange-600', light: 'bg-orange-50' },
  'orange-card': { Icon: CreditCard, bg: 'bg-liva-orange', light: 'bg-liva-orange/10' },
}

export default function AddonIcon({ id, selected, compact = false }) {
  const config = ADDON_ICONS[id] ?? { Icon: Car, bg: 'bg-gray-500', light: 'bg-gray-50' }
  const { Icon, bg, light } = config
  const box = compact ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-xl'

  return (
    <div
      className={`flex shrink-0 items-center justify-center transition-colors ${box} ${
        selected ? bg : light
      }`}
    >
      <Icon
        className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${selected ? 'text-white' : 'text-gray-600'}`}
        strokeWidth={2}
      />
    </div>
  )
}