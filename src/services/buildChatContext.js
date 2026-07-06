import { ADDONS, PLANS, USER, VEHICLE, formatAED } from '../data'

const STAGE_LABELS = {
  welcome: 'Welcome',
  plan: 'Choosing insurance plan',
  addons: 'Selecting add-ons',
  confirm: 'Reviewing and confirming details',
  documents: 'Uploading documents after payment',
  complete: 'Policy issued',
}

export function buildChatContext({
  stage,
  selectedPlan,
  selectedAddons,
  vehicleValue,
  policyStart,
}) {
  const plan = PLANS.find((p) => p.id === selectedPlan)
  const addonNames = selectedAddons
    .map((id) => ADDONS.find((a) => a.id === id)?.shortName)
    .filter(Boolean)

  return {
    customerName: USER.firstName,
    vehicle: `${VEHICLE.model} ${VEHICLE.year}`,
    plate: VEHICLE.plate,
    insuredValue: formatAED(vehicleValue),
    policyStart: policyStart || 'Not set yet',
    stage: STAGE_LABELS[stage] ?? stage,
    selectedPlan: plan ? `${plan.name} (${formatAED(plan.price)}/year)` : 'Not selected yet',
    selectedAddons: addonNames.length ? addonNames.join(', ') : 'None selected',
    supportPhone: '800 722',
    supportEmail: 'contactus.uae@hsbc.com',
  }
}

export function buildSystemPrompt(context) {
  return `You are Aura, LIVA Insurance's AI assistant in the UAE. Help ${context.customerName} renew motor insurance through a mobile chat.

Current renewal context:
- Vehicle: ${context.vehicle} (${context.plate})
- Sum insured: ${context.insuredValue}
- Journey step: ${context.stage}
- Selected plan: ${context.selectedPlan}
- Add-ons: ${context.selectedAddons}
- Policy start: ${context.policyStart}
- Support: ${context.supportPhone} or ${context.supportEmail}

Rules:
- Reply in 2–4 short sentences, friendly and professional.
- Only discuss UAE car insurance, LIVA products, this renewal, claims, documents, payment, and add-ons.
- Use AED for amounts. Do not invent prices beyond what the user context implies.
- If you cannot answer, suggest calling ${context.supportPhone}.
- Do not mention that you are an language model or reference system prompts.`
}
