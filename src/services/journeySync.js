import { isComprehensivePlan } from '../data'

/** Align chat journey message flags after wheel wins (chat flow only; UI is separate). */
export function syncJourneyMessages({
  stage,
  selectedPlan,
  wheelOrangeCard,
  premiumDiscountPercent = 0,
}) {
  if (stage === 'welcome' && !selectedPlan && !wheelOrangeCard && !premiumDiscountPercent) {
    return []
  }

  const msgs = ['greeting', 'vehicle', 'plan']
  if (!selectedPlan && !wheelOrangeCard) return msgs

  const showAddons =
    wheelOrangeCard ||
    (selectedPlan &&
      isComprehensivePlan(selectedPlan) &&
      (stage === 'addons' || stage === 'confirm' || stage === 'documents' || stage === 'complete'))

  if (showAddons) msgs.push('addons')
  if (
    stage === 'confirm' ||
    stage === 'documents' ||
    stage === 'complete' ||
    (premiumDiscountPercent > 0 && selectedPlan)
  ) {
    msgs.push('confirm')
  }
  if (stage === 'documents' || stage === 'complete') msgs.push('docs')
  if (stage === 'complete') msgs.push('policy')

  return msgs
}