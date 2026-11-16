export const USER = {
  name: 'Rashid Khan',
  cardName: 'Rashid Khan',
  firstName: 'Rashid',
  lastName: 'Khan',
  email: 'rashid.khan@gmail.com',
  nationality: 'Emirati',
  emiratesId: '784-1992-1234567-8',
  mobile: '501234567',
  dateOfBirth: '15/03/1992',
  emiratesIdExpiry: '31/12/2026',
  licenseIssueDate: '10/06/2018',
}

export const VEHICLE = {
  model: 'Toyota Land Cruiser',
  year: 2022,
  value: 160400,
  plate: 'A 57123',
  emirate: 'Dubai',
  color: 'White',
  placeOfRegistration: 'Dubai',
  firstRegistrationDate: '01/01/2022',
  chassisNumber: 'JTMDW3FV5LD012345',
  policyStart: '30/11/2024',
  policyEnd: '30/11/2025',
  existingPolicyExpiry: '10/07/2026',
}

export const SUPPORT = {
  phone: '800 722',
  email: 'contactus.uae@liva.com',
}

/** Insured value can only be adjusted ±10% from the initial sum insured. */
export const SUM_INSURED_TOLERANCE = 0.1

export function getValueLimits(initialValue = VEHICLE.value) {
  return {
    step: 5_000,
    min: Math.round(initialValue * (1 - SUM_INSURED_TOLERANCE)),
    max: Math.round(initialValue * (1 + SUM_INSURED_TOLERANCE)),
    initial: initialValue,
  }
}

export const VALUE_LIMITS = getValueLimits(VEHICLE.value)

export const PLANS = [
  {
    id: 'agency',
    name: 'Agency',
    subtitle: 'Authorized dealer repairs',
    /** Base premium at VEHICLE.value — scales when sum insured changes. */
    price: 2110,
    scalesWithSumInsured: true,
    recommended: false,
    badge: null,
    features: ['Genuine OEM parts', 'Dealer workshops'],
    covers: [
      'Own damage cover',
      'Theft & fire protection',
      'Authorized dealer repairs',
      'Third party liability',
      'Natural calamities',
    ],
  },
  {
    id: 'non-agency',
    name: 'Non-Agency',
    subtitle: 'Repair at any garage',
    price: 1860,
    scalesWithSumInsured: true,
    recommended: true,
    badge: 'POPULAR',
    features: ['Any garage you trust', 'Theft & fire included'],
    covers: [
      'Own damage cover',
      'Theft & fire protection',
      'Repair at any garage',
      'Third party liability',
      'Natural calamities',
    ],
  },
  {
    id: 'third-party',
    name: 'Third Party',
    subtitle: 'Legal minimum cover',
    /** Fixed premium — does not change with sum insured. */
    price: 750,
    scalesWithSumInsured: false,
    recommended: false,
    badge: 'BY LAW',
    features: ['Covers others\' damage', 'Lowest annual price'],
    covers: [
      'Third party bodily injury',
      'Third party property damage',
      'Legal liability cover',
    ],
  },
]

/** Comprehensive = Agency or Non-Agency (add-ons available). */
export function isComprehensivePlan(planId) {
  return planId === 'agency' || planId === 'non-agency'
}

export const ADDONS = [
  {
    id: 'gcc',
    name: 'Territory extended to other GCC countries',
    shortName: 'GCC Territory Extension',
    desc: 'Drive across the Gulf',
    price: 500,
    comprehensiveOnly: true,
  },
  {
    id: 'ncd',
    name: 'No Claims Discount Protection',
    shortName: 'NCD Protection',
    desc: 'Keep your discount after a claim',
    price: 250,
    comprehensiveOnly: true,
  },
  {
    id: 'rent-a-car',
    name: 'Premium Rent A Car',
    shortName: 'Premium Rent A Car',
    desc: 'Replacement vehicle while yours is in repair',
    price: 200,
    comprehensiveOnly: true,
  },
  {
    id: 'offroad',
    name: 'Off Road Cover',
    shortName: 'Off-Road Cover',
    desc: 'Desert & trail driving',
    price: 250,
    comprehensiveOnly: true,
  },
]

/** Wheel prize — shown in add-ons when customer wins the spin. */
export const WHEEL_ORANGE_CARD_ID = 'orange-card'

export const ORANGE_CARD_ADDON = {
  id: WHEEL_ORANGE_CARD_ID,
  name: 'LIVA Orange Card',
  shortName: 'Orange Card',
  desc: 'Exclusive member benefits & partner perks',
  price: 0,
  comprehensiveOnly: false,
  wheelPrize: true,
}

export const VAT_RATE = 0.05

export function formatAED(amount) {
  const value = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(value)) return 'AED 0'
  return `AED ${value.toLocaleString('en-AE')}`
}

/** Scale a plan premium proportionally to sum insured (comprehensive plans only). */
export function getPlanPrice(planId, vehicleValue = VEHICLE.value) {
  const plan = PLANS.find((p) => p.id === planId)
  if (!plan) return 0
  if (plan.scalesWithSumInsured === false) return plan.price
  return Math.round(plan.price * (vehicleValue / VEHICLE.value))
}

export function getPlanById(planId, vehicleValue = VEHICLE.value) {
  const plan = PLANS.find((p) => p.id === planId)
  if (!plan) return null
  return { ...plan, price: getPlanPrice(planId, vehicleValue) }
}

export function getPlansWithPricing(vehicleValue = VEHICLE.value) {
  return PLANS.map((plan) => ({
    ...plan,
    price: getPlanPrice(plan.id, vehicleValue),
  }))
}

export function getAddonsForPlan(planId) {
  if (!isComprehensivePlan(planId)) return []
  return ADDONS
}

export function getAddonCatalog(planId, { includeOrangeCard = false } = {}) {
  const base = planId ? getAddonsForPlan(planId) : []
  if (!includeOrangeCard) return base
  return [ORANGE_CARD_ADDON, ...base]
}

export function getSelectedAddonItems(planId, addonIds, options = {}) {
  const catalog = planId
    ? getAddonCatalog(planId, options)
    : [...ADDONS, ...(options.includeOrangeCard ? [ORANGE_CARD_ADDON] : [])]
  const allowed = new Set(catalog.map((a) => a.id))
  return catalog.filter((a) => allowed.has(a.id) && addonIds.includes(a.id))
}

export function getStepAfterPlanSelect(planId) {
  return isComprehensivePlan(planId) ? 'addons' : 'confirm'
}

/** Toggle add-on selection; wheel Orange Card cannot be turned off once won. */
export function toggleAddonSelection(prev, id, { wheelOrangeCardWon = false } = {}) {
  if (wheelOrangeCardWon && id === WHEEL_ORANGE_CARD_ID && prev.includes(WHEEL_ORANGE_CARD_ID)) {
    return prev
  }
  return prev.includes(id) ? prev.filter((addonId) => addonId !== id) : [...prev, id]
}

/** Keep wheel Orange Card when clearing comprehensive-only add-ons (e.g. plan change). */
export function addonsAfterPlanChange(wheelOrangeCardWon) {
  return wheelOrangeCardWon ? [WHEEL_ORANGE_CARD_ID] : []
}

export function clampInsuredValue(value, limits = VALUE_LIMITS) {
  return Math.min(limits.max, Math.max(limits.min, value))
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** DD/MM/YYYY → 30 Nov 2024 */
export function formatChatDate(dateStr) {
  const [day, month, year] = dateStr.split('/')
  return `${parseInt(day, 10)} ${MONTHS[parseInt(month, 10) - 1]} ${year}`
}

/** DD/MM/YYYY → DD-MM-YYYY for display */
export function formatDisplayDate(dateStr) {
  return dateStr.replace(/\//g, '-')
}

/** Today as DD/MM/YYYY */
export function getTodayDate() {
  return formatDateFromParts(new Date())
}

/** Add months to DD/MM/YYYY and return DD/MM/YYYY */
export function addMonthsToDate(dateStr, months) {
  const [day, month, year] = dateStr.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  date.setMonth(date.getMonth() + months)
  return formatDateFromParts(date)
}

export function formatDateFromParts(date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

export function toInputDate(dateStr) {
  const [day, month, year] = dateStr.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function fromInputDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${parseInt(day, 10)}/${parseInt(month, 10)}/${year}`
}

function dateDmYToUtcMs(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** Compare DD/MM/YYYY dates: negative if a before b, 0 if equal, positive if a after b. */
export function compareDmY(a, b) {
  return dateDmYToUtcMs(a) - dateDmYToUtcMs(b)
}

/** Policy start must not be before today (DD/MM/YYYY). */
export function clampPolicyStartDate(dateStr) {
  const today = getTodayDate()
  return compareDmY(dateStr, today) < 0 ? today : dateStr
}

/** Vehicle label e.g. TOYOTA LAND CRUISER 2022 */
export function formatVehicleLabel(model, year) {
  return `${model} ${year}`.toUpperCase()
}

/** Parse DD/MM/YYYY and return whole days until expiry (0 = today, negative = past) */
export function getDaysUntilExpiry(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number)
  const expiry = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function calculateTotal(planPrice, addonIds, planId, options = {}) {
  const { includeOrangeCard = false, premiumDiscountPercent = 0 } = options
  const addonItems = planId
    ? getSelectedAddonItems(planId, addonIds, { includeOrangeCard })
    : ADDONS.filter((a) => addonIds.includes(a.id))
  const addonsTotal = addonItems.reduce((sum, a) => sum + a.price, 0)
  const discountedPlan =
    premiumDiscountPercent > 0
      ? Math.round(planPrice * (1 - premiumDiscountPercent / 100))
      : planPrice
  const planSavings = planPrice - discountedPlan
  const subtotal = discountedPlan + addonsTotal
  const vat = Math.round(subtotal * VAT_RATE)
  return {
    subtotal,
    vat,
    total: subtotal + vat,
    addonsTotal,
    discountedPlan,
    planSavings,
    premiumDiscountPercent,
    preDiscountSubtotal: planPrice + addonsTotal,
  }
}

export const CROSS_SELL = [
  { id: 'home', name: 'Home Insurance', icon: '🏠' },
  { id: 'travel', name: 'Travel Insurance', icon: '✈️' },
  { id: 'personal', name: 'Personal Insurance', icon: '👤' },
]
