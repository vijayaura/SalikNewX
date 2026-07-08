import { USER, SUPPORT } from './data'

const firstName = USER.name.split(' ')[0]

export const COPY = {
  plans: 'Pick the cover that works for you — tap to select.',
  confirm: 'Please review your details below — confirm when everything looks good.',
  policy: `You're all set, ${firstName}! Your policy is active.`,
  support: `Need help? Call ${SUPPORT.phone} or email ${SUPPORT.email}`,
  user: {
    plan: (name) => `${name} — let's go!`,
    addons: (count) => {
      if (count === 0) return 'No add-ons — on to the next step'
      if (count === 1) return '1 cover selected — on to the next step'
      return `${count} covers selected — on to the next step`
    },
    verify: 'Documents verified',
  },
  buttons: {
    continue: 'Continue',
    verify: 'Issue my policy',
    downloadQuote: 'Download Quote',
    proceedToPayment: 'Proceed to Payment',
    reviewDetails: 'Review your details',
  },
  cards: {
    confirmTitle: 'Your Insurance Summary',
    carModel: 'Your Car Model',
    yourDetails: 'Your Details',
    policyDetails: 'Policy Details',
    yourPlan: 'Your Plan',
    premiumNote: 'Any claims in the past 2 years? This may affect your premium.',
    terms: 'I hereby accept all the Terms & Conditions.',
    verifyInfo: 'By continuing, you verify that the provided information is accurate.',
    needSupport: 'Need Support?',
    summary: 'Your quote breakdown',
    policyReady: 'Policy ready',
    policySub: "Download it below — you're covered.",
  },
}
