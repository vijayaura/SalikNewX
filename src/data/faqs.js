import { SUPPORT, formatAED } from '../data'

export const FAQS = [
  {
    id: 'comprehensive',
    keywords: ['comprehensive', 'agency', 'non-agency', 'full cover', 'what is covered', 'coverage', 'cover include'],
    question: 'What does Comprehensive cover?',
    answer:
      'Agency Comprehensive covers repairs at authorized dealers with genuine OEM parts. Non-Agency Comprehensive lets you repair at any garage and includes theft & fire. Both cover own damage, third party liability, and natural calamities.',
  },
  {
    id: 'third-party',
    keywords: ['third party', 'third-party', 'difference', 'compare plans', 'liability only', 'by law'],
    question: 'What is Third Party cover?',
    answer:
      'Third Party is the legal minimum — it covers damage or injury you cause to others, not your own vehicle. Agency and Non-Agency Comprehensive also protect your car. Optional upgrades are available on comprehensive plans only.',
  },
  {
    id: 'addons',
    keywords: ['addon', 'add-on', 'upgrade', 'optional', 'extra cover', 'off road', 'gcc', 'rent a car', 'ncd'],
    question: 'What are optional upgrades?',
    answer:
      `Optional upgrades are available on comprehensive plans only: GCC territory extension (${formatAED(500)}), NCD Protection (${formatAED(250)}), Premium Rent A Car (${formatAED(200)}), and Off Road cover (${formatAED(250)}).`,
  },
  {
    id: 'documents',
    keywords: ['document', 'upload', 'emirates id', 'driving license', 'license', 'id card', 'papers'],
    question: 'What documents do I need?',
    answer:
      'You need a valid Emirates ID and UAE driving license. These can be pulled securely from your profile or uploaded during the journey.',
  },
  {
    id: 'payment',
    keywords: ['pay', 'payment', 'card', 'how to pay', 'price', 'cost', 'vat', 'total'],
    question: 'How does payment work?',
    answer:
      'Payment is made by saved card at checkout. The total includes your plan, selected add-ons, and 5% VAT. You will see the full breakdown before you pay.',
  },
  {
    id: 'claims',
    keywords: ['claim', 'accident', 'report', 'damage', 'file a claim'],
    question: 'How do I make a claim?',
    answer:
      'Report the incident within 24 hours by calling 800 722 or through the LIVA app. Have your policy number, driving license, and police report (if applicable) ready.',
  },
  {
    id: 'policy-period',
    keywords: ['how long', 'valid', 'expiry', 'duration', 'policy period', 'renew'],
    question: 'How long is my policy valid?',
    answer:
      'Car insurance policies are valid for 12 months from the start date shown in your summary. You will be notified before renewal is due.',
  },
  {
    id: 'ncd',
    keywords: ['ncd', 'no claims', 'discount', 'no claim discount'],
    question: 'What is No Claims Discount?',
    answer:
      'No Claims Discount (NCD) reduces your premium when you have not made claims. Our NCD Protection add-on keeps your discount even if you make one claim.',
  },
  {
    id: 'support',
    keywords: ['contact', 'support', 'help', 'phone', 'email', 'call', 'customer service'],
    question: 'How can I contact support?',
    answer:
      `Call ${SUPPORT.phone} or email ${SUPPORT.email}. Our team is available to help with quotes, claims, and policy questions.`,
  },
  {
    id: 'vehicle-value',
    keywords: ['vehicle value', 'car value', 'valuation', 'land cruiser', '160'],
    question: 'How is my vehicle value calculated?',
    answer:
      `Vehicle value is based on your car model, year, and current market valuation. Your Toyota Land Cruiser 2022 is valued at ${formatAED(160400)} for this quote.`,
  },
]

export const FAQ_FALLBACK =
  'I can help with plans, add-ons, documents, payment, claims, and support. Try asking about Comprehensive cover, optional upgrades, or how to make a claim.'

export const FAQ_SUGGESTIONS = [
  'What does Comprehensive cover?',
  'What is Third Party cover?',
  'How do I make a claim?',
]
