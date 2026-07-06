export function getProceedCta({ stage, redoFlow }) {
  if (stage === 'welcome' || stage === 'complete') return null

  if (redoFlow) {
    if (redoFlow.step === 'plan') {
      return { label: 'Proceed to select your plan', target: 'redo', action: 'scroll' }
    }
    if (redoFlow.step === 'addons') {
      return { label: 'Proceed to add-ons', target: 'redo', action: 'scroll' }
    }
    if (redoFlow.step === 'confirm') {
      return { label: 'Proceed to review details', target: 'redo', action: 'scroll' }
    }
  }

  if (stage === 'plan') {
    return { label: 'Proceed to select your plan', target: 'plan', action: 'scroll' }
  }
  if (stage === 'addons') {
    return { label: 'Proceed to add-ons', target: 'addons', action: 'scroll' }
  }
  if (stage === 'confirm') {
    return { label: 'Proceed to review details', target: 'confirm', action: 'scroll' }
  }
  if (stage === 'documents') {
    return { label: 'Proceed to upload documents', target: 'docs', action: 'scroll' }
  }

  return null
}

export function getPendingStep({ stage, redoFlow }) {
  if (redoFlow) return redoFlow.step
  if (stage === 'plan') return 'plan'
  if (stage === 'addons') return 'addons'
  if (stage === 'confirm') return 'confirm'
  if (stage === 'documents') return 'docs'
  return null
}

export function getAlreadyOnStepReply(step) {
  if (step === 'plan') {
    return "You're already on plan selection — tap the proceed badge below to continue here."
  }
  if (step === 'addons') {
    return "You're already on add-ons — tap the proceed badge below to continue here."
  }
  return "You're already on that step."
}

export function resolveRevisionIntent(revision, { stage, redoFlow, selectedPlan }) {
  if (!revision) return { action: null }

  const onPlan = (stage === 'plan' && !redoFlow) || redoFlow?.step === 'plan'
  const onAddons = (stage === 'addons' && !redoFlow) || redoFlow?.step === 'addons'

  if (revision === 'plan' && onPlan) {
    return { action: 'already', step: 'plan' }
  }

  if (revision === 'addons' && onAddons) {
    return { action: 'already', step: 'addons' }
  }

  if (revision === 'addons' && stage === 'plan' && !selectedPlan && !redoFlow) {
    return {
      action: 'needs',
      message: 'Pick a plan first — use the plan cards above, then we can move to add-ons.',
    }
  }

  if (['documents', 'complete'].includes(stage)) {
    return {
      action: 'blocked',
      message: 'Your policy is already in progress — contact support on 800 722 if you need changes.',
    }
  }

  if (
    revision === 'plan' &&
    ((['addons', 'confirm'].includes(stage) && !redoFlow) || (redoFlow && redoFlow.step !== 'plan'))
  ) {
    return { action: 'redo', type: 'plan' }
  }

  if (revision === 'addons' && (stage === 'confirm' || redoFlow?.step === 'confirm')) {
    return { action: 'redo', type: 'addons' }
  }

  return { action: null }
}
