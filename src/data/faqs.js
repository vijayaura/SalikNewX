import { SUPPORT } from '../data'

export const FAQS = [
  {
    id: 'comprehensive',
    keywords: ['comprehensive', 'full cover', 'what is covered', 'coverage', 'cover include'],
    question: 'What does Comprehensive cover?',
    answer:
      'Comprehensive covers own damage, theft, fire, natural calamities, third party liability, and personal accident benefits. It is our most complete plan for your vehicle.',
  },
  {
    id: 'third-party',
    keywords: ['third party', 'third-party', 'difference', 'compare plans', 'liability only'],
    question: 'What is Third Party Liability?',
    answer:
      'Third Party Liability covers damage or injury you cause to others. It does not cover damage to your own vehicle. Comprehensive includes third party cover plus protection for your car.',
  },
  {
    id: 'addons',
    keywords: ['addon', 'add-on', 'upgrade', 'optional', 'extra cover', 'off road', 'gcc', 'breakdown'],
    question: 'What are optional upgrades?',
    answer:
      'Upgrades include Personal Accident (driver & passengers), No Claims Discount protection, 24h breakdown recovery, GCC territory extension, and Off Road cover. Each add-on is 60 AED.',
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
      'Vehicle value is based on your car model, year, and current market valuation. Your Toyota Land Cruiser 2022 is valued at 160,400 AED for this quote.',
  },
]

export const FAQ_FALLBACK =
  'I can help with plans, add-ons, documents, payment, claims, and support. Try asking about Comprehensive cover, optional upgrades, or how to make a claim.'

export const FAQ_SUGGESTIONS = [
  'What does Comprehensive cover?',
  'What documents do I need?',
  'How do I make a claim?',
]
