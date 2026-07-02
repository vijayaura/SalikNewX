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

export const VALUE_LIMITS = {
  step: 5_000,
  min: 80_000,
  max: 350_000,
}

export const PLANS = [
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    price: 1200,
    recommended: true,
    features: ['Full damage cover', 'Theft protection', 'Natural calamities'],
    covers: [
      'Own damage cover',
      'Theft & fire protection',
      'Natural calamities',
      'Third party liability',
      'Personal accident benefit',
    ],
  },
  {
    id: 'third-party',
    name: 'Third Party Liability',
    price: 1000,
    recommended: false,
    features: ['Legal liability', 'Third-party damage', 'Basic protection'],
    covers: [
      'Third party bodily injury',
      'Third party property damage',
      'Legal liability cover',
    ],
  },
]

export const ADDONS = [
  {
    id: 'driver-pa',
    name: 'Personal Accident — Driver',
    shortName: 'Driver PA',
    desc: 'Medical & death benefit for you',
    price: 60,
  },
  {
    id: 'passenger-pa',
    name: 'Personal Accident Passengers',
    shortName: 'Passenger PA',
    desc: 'Cover for everyone in the car',
    price: 60,
  },
  {
    id: 'ncd',
    name: 'No Claims Discount Protection',
    shortName: 'NCD Protection',
    desc: 'Keep your discount after a claim',
    price: 60,
  },
  {
    id: 'breakdown',
    name: '24h Accident & Breakdown Recovery',
    shortName: 'Breakdown Recovery',
    desc: 'Roadside help, anytime',
    price: 60,
  },
  {
    id: 'gcc',
    name: 'GCC Territory Extension',
    shortName: 'GCC Extension',
    desc: 'Drive across the Gulf',
    price: 60,
  },
  {
    id: 'offroad',
    name: 'Off Road Cover',
    shortName: 'Off-Road Cover',
    desc: 'Desert & trail driving',
    price: 60,
  },
]

export const VAT_RATE = 0.05

export function formatAED(amount) {
  return `${amount.toLocaleString('en-AE')} AED`
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

export function calculateTotal(planPrice, addonIds) {
  const addonsTotal = ADDONS.filter((a) => addonIds.includes(a.id)).reduce(
    (sum, a) => sum + a.price,
    0,
  )
  const subtotal = planPrice + addonsTotal
  const vat = Math.round(subtotal * VAT_RATE)
  return { subtotal, vat, total: subtotal + vat, addonsTotal }
}

export const CROSS_SELL = [
  { id: 'home', name: 'Home Insurance', icon: '🏠' },
  { id: 'travel', name: 'Travel Insurance', icon: '✈️' },
  { id: 'personal', name: 'Personal Insurance', icon: '👤' },
]
