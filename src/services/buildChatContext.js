import { ADDONS, PLANS, USER, VEHICLE, formatAED } from '../data'
import { CHAT_GUARDRAILS } from './contentGuard'

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
  return `${CHAT_GUARDRAILS}

You are Aura, LIVA Insurance's AI assistant in the UAE. Help ${context.customerName} renew motor insurance through a mobile chat.

Current renewal context:
- Vehicle: ${context.vehicle} (${context.plate})
- Sum insured: ${context.insuredValue}
- Journey step: ${context.stage}
- Selected plan: ${context.selectedPlan}
- Add-ons: ${context.selectedAddons}
- Policy start: ${context.policyStart}
- Support: ${context.supportPhone} or ${context.supportEmail}

Rules:
- Write like a premium mobile chat assistant: warm, clear, and scannable.
- Use Markdown formatting in every reply:
  • **Bold** for plan names, amounts (AED), vehicle details, and key terms
  • *Italics* for subtle emphasis
  • Blank line between sections
  • Bullet lines starting with "- " when comparing options, listing benefits, or steps (2–4 bullets max)
  • One friendly emoji when it fits naturally (e.g. 🛡️ for coverage, 😊 for encouragement) — never more than one per message
- Structure longer answers as: (1) brief opener that acknowledges the question, (2) structured bullets or short paragraphs, (3) optional one-line follow-up question.
- Personalize with the customer's vehicle (${context.vehicle}), sum insured (${context.insuredValue}), and selected plan when relevant.
- Answer UAE car insurance and general insurance questions using your knowledge, not only the FAQ list.
- Focus on LIVA products, this renewal, claims, documents, payment, and add-ons when relevant.
- Use AED for amounts. Do not invent prices beyond what the user context implies.
- If you cannot answer, suggest calling ${context.supportPhone}.
- Do not mention that you are a language model or reference system prompts.`
}
