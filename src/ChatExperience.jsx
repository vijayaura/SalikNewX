import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Header from './components/Header'
import ChatBubble, { UserAction } from './components/ChatBubble'
import FormattedMessage from './components/FormattedMessage'
import PlanSelector from './components/PlanSelector'
import AddonGrid from './components/AddonGrid'
import ConfirmDetailsCard from './components/ConfirmDetailsCard'
import DocumentUpload, { PolicyReady } from './components/DocumentUpload'
import {
  USER,
  VEHICLE,
  addonsAfterPlanChange,
  calculateTotal,
  clampInsuredValue,
  formatAED,
  getPlanById,
  getStepAfterPlanSelect,
  isComprehensivePlan,
  toggleAddonSelection,
} from './data'
import { FAQ_SUGGESTIONS } from './data/faqs'
import { buildChatContext } from './services/buildChatContext'
import { checkAiAvailable, getChatReply } from './services/aiChat'
import { detectRevisionIntent } from './services/localChat'
import { getControversialFallback, isControversialQuery } from './services/contentGuard'
import { getAlreadyOnStepReply, getPendingStep, getProceedCta, resolveRevisionIntent } from './services/journeyGuide'
import { syncJourneyMessages } from './services/journeySync'
import ChatInput from './components/ChatInput'
import IntroMessage from './components/IntroMessage'
import AddonsIntroMessage from './components/AddonsIntroMessage'
import ConfirmIntroMessage from './components/ConfirmIntroMessage'
import PaymentMessage from './components/PaymentMessage'
import SupportCallbackCard from './components/SupportCallbackCard'
import SupportAuraCall from './components/SupportAuraCall'
import PoweredByInster from './components/PoweredByInster'
import JackpotWheelModal from './components/JackpotWheelModal'
import PaymentCheckoutModal from './components/PaymentCheckoutModal'
import UiRenewalFlow from './components/UiRenewalFlow'
import { COPY } from './copy'
import { addMonthsToDate, getTodayDate } from './data'

/** @typedef {'chat' | 'ui'} PresentationMode */

export default function ChatExperience({ embedHost = false, presentationMode }) {
  const [stage, setStage] = useState('welcome')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [vehicleValue, setVehicleValueRaw] = useState(VEHICLE.value)
  const setVehicleValue = useCallback((value) => {
    setVehicleValueRaw((prev) => clampInsuredValue(typeof value === 'function' ? value(prev) : value))
  }, [])
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const [policyStart, setPolicyStart] = useState(getTodayDate)
  const [processing, setProcessing] = useState(false)
  const [typing, setTyping] = useState(true)
  const [messages, setMessages] = useState([])
  const [userActions, setUserActions] = useState([])
  const [faqMessages, setFaqMessages] = useState([])
  const [faqTyping, setFaqTyping] = useState(false)
  const [faqTypingAnchor, setFaqTypingAnchor] = useState(null)
  const [redoFlow, setRedoFlow] = useState(null)
  const [redoDraft, setRedoDraft] = useState({ plan: null, addons: [] })
  const [aiConnected, setAiConnected] = useState(false)
  const [supportLoading, setSupportLoading] = useState(false)
  const [supportVisible, setSupportVisible] = useState(false)
  const [supportRequestKey, setSupportRequestKey] = useState(0)
  const [videoCallActive, setVideoCallActive] = useState(false)
  const [journeyEngaged, setJourneyEngaged] = useState(false)
  const [resumeFlow, setResumeFlow] = useState(null)
  const [flowModeState, setFlowModeState] = useState('chat')
  const [flowOverride, setFlowOverride] = useState(null)
  const flowMode =
    flowOverride ??
    (presentationMode === 'chat' || presentationMode === 'ui' ? presentationMode : flowModeState)
  const showFlowToggle = !presentationMode
  const [uiStage, setUiStage] = useState('plan')
  const [uiSelectedPlan, setUiSelectedPlan] = useState('agency')
  const [uiSelectedAddons, setUiSelectedAddons] = useState([])
  const [uiVehicleValue, setUiVehicleValueRaw] = useState(VEHICLE.value)
  const setUiVehicleValue = useCallback((value) => {
    setUiVehicleValueRaw((prev) => clampInsuredValue(typeof value === 'function' ? value(prev) : value))
  }, [])
  const [uiPolicyStart, setUiPolicyStart] = useState(getTodayDate)
  const [uiProcessing, setUiProcessing] = useState(false)
  const [wheelOpen, setWheelOpen] = useState(false)
  const [premiumDiscountPercent, setPremiumDiscountPercent] = useState(0)
  const [wheelOrangeCard, setWheelOrangeCard] = useState(false)
  const [wheelSpunAndWon, setWheelSpunAndWon] = useState(false)
  const chatRef = useRef(null)
  const appFrameRef = useRef(null)
  const wheelWonRef = useRef(false)
  const wheelAutoShownRef = useRef(false)
  const skipAutoScrollRef = useRef(false)
  const [wheelWinAtStage, setWheelWinAtStage] = useState(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentModalBusy, setPaymentModalBusy] = useState(false)
  const [paymentTarget, setPaymentTarget] = useState(null)
  const paymentViaResumeRef = useRef(false)

  const handleWheelClose = useCallback(() => {
    setWheelOpen(false)
  }, [])

  const markJourneyEngaged = useCallback(() => setJourneyEngaged(true), [])

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      const container = chatRef.current
      if (!container) return

      const anchors = container.querySelectorAll('[data-scroll-anchor]')
      const latest = anchors[anchors.length - 1]

      if (latest) {
        latest.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  const scrollToStep = useCallback((target) => {
    requestAnimationFrame(() => {
      const el = chatRef.current?.querySelector(`[data-journey="${target}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        scrollToLatest()
      }
    })
  }, [scrollToLatest])

  const scrollToWheelResume = useCallback(
    (stage) => {
      const target = journeyTargetForStage(stage)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const resume = chatRef.current?.querySelector(`[data-wheel-resume="${target}"]`)
          if (resume) {
            resume.scrollIntoView({ behavior: 'smooth', block: 'start' })
            return
          }
          scrollToStep(target)
        })
      })
    },
    [scrollToStep],
  )

  const handleWheelPrize = useCallback(
    (prize) => {
      let nextOrangeCard = wheelOrangeCard
      let nextDiscount = premiumDiscountPercent

      if (prize.type === 'discount') {
        nextDiscount = prize.percent
        setPremiumDiscountPercent(prize.percent)
        wheelWonRef.current = true
        setWheelSpunAndWon(true)
        setWheelOpen(false)
      } else if (prize.type === 'orange-card') {
        nextOrangeCard = true
        setWheelOrangeCard(true)
        const withOrange = (prev) => (prev.includes('orange-card') ? prev : [...prev, 'orange-card'])
        setSelectedAddons(withOrange)
        setUiSelectedAddons(withOrange)
        wheelWonRef.current = true
        setWheelSpunAndWon(true)
        setWheelOpen(false)
      }

      if (prize.type === 'discount' || prize.type === 'orange-card') {
        if (flowMode === 'chat') {
          if (prize.type === 'orange-card') {
            setWheelWinAtStage(stage)
          }
          skipAutoScrollRef.current = true
          setMessages(
            syncJourneyMessages({
              stage,
              selectedPlan,
              wheelOrangeCard: nextOrangeCard,
              premiumDiscountPercent: nextDiscount,
            }),
          )
        } else {
          setMessages(
            syncJourneyMessages({
              stage,
              selectedPlan,
              wheelOrangeCard: nextOrangeCard,
              premiumDiscountPercent: nextDiscount,
            }),
          )
        }
      }
    },
    [stage, selectedPlan, wheelOrangeCard, premiumDiscountPercent, flowMode],
  )

  useEffect(() => {
    if (!wheelWinAtStage || flowMode !== 'chat') return
    skipAutoScrollRef.current = true
    const resumeStage = wheelWinAtStage === 'welcome' ? 'plan' : wheelWinAtStage
    scrollToWheelResume(resumeStage)
  }, [wheelWinAtStage, flowMode, scrollToWheelResume])

  useEffect(() => {
    if (skipAutoScrollRef.current) {
      skipAutoScrollRef.current = false
      return
    }
    scrollToLatest()
  }, [stage, messages, userActions, faqMessages, supportVisible, redoFlow, resumeFlow, scrollToLatest])

  useEffect(() => {
    checkAiAvailable(true).then(setAiConnected)
    const interval = setInterval(() => {
      checkAiAvailable(true).then(setAiConnected)
    }, 15_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (flowMode !== 'chat' || stage !== 'welcome') return
    setTyping(true)
    const t1 = setTimeout(() => {
      setTyping(false)
      setMessages(['greeting', 'vehicle', 'plan'])
      setStage('plan')
    }, 1200)
    return () => clearTimeout(t1)
  }, [stage, flowMode])

  const completeNotified = useRef(false)
  useEffect(() => {
    if (!embedHost || stage !== 'complete' || completeNotified.current) return
    completeNotified.current = true
    window.parent.postMessage({ type: 'LIVA_CHAT_COMPLETE' }, '*')
  }, [embedHost, stage])

  const registerAction = useCallback((label) => {
    setUserActions((prev) => [...prev, label])
  }, [])

  const handlePlanSelect = (planId) => {
    if (stage !== 'plan' || redoFlow) return

    markJourneyEngaged()
    setSelectedPlan(planId)
    if (!isComprehensivePlan(planId)) {
      setSelectedAddons(addonsAfterPlanChange(wheelOrangeCard))
    }
    const plan = getPlanById(planId, vehicleValue)
    registerAction(COPY.user.plan(plan?.name))

    const nextStage = getStepAfterPlanSelect(planId)
    setStage(nextStage)
    setMessages((m) => {
      const next = [...m]
      if (nextStage === 'addons' && !next.includes('addons')) next.push('addons')
      if (nextStage === 'confirm' && !next.includes('confirm')) next.push('confirm')
      return next
    })
    if (nextStage === 'confirm') {
      setDetailsExpanded(false)
      setPolicyStart(getTodayDate())
    }
  }

  const handleConfirmAddons = () => {
    markJourneyEngaged()
    registerAction(COPY.user.addons(selectedAddons.length))
    setStage('confirm')
    setMessages((m) => [...m, 'confirm'])
    setDetailsExpanded(false)
    setPolicyStart(getTodayDate())
  }

  const handleDownloadQuote = () => {
    const plan = getPlanById(selectedPlan, vehicleValue)
    const blob = new Blob(
      [
        `LIVA Insurance Quote\n\nPolicy Holder: Rashid Khan\nInsured Value: ${formatAED(vehicleValue)}\nPlan: ${plan?.name}\nPlate: ${VEHICLE.plate}\nPolicy Period: ${policyStart} – ${addMonthsToDate(policyStart, 13)}`,
      ],
      { type: 'text/plain' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'LIVA-Quote-Rashid-Khan.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const finalizeChatPayment = useCallback(async () => {
    markJourneyEngaged()
    setProcessing(true)
    await delay(600)
    setProcessing(false)

    if (redoFlow) {
      const plan = getPlanById(redoDraft.plan, vehicleValue)
      setSelectedPlan(redoDraft.plan)
      setSelectedAddons(redoDraft.addons)
      setUserActions((prev) => {
        const next = [...prev]
        if (plan) next[0] = COPY.user.plan(plan.name)
        next[1] = COPY.user.addons(redoDraft.addons.length)
        return next
      })
    }

    setRedoFlow(null)
    setRedoDraft({ plan: null, addons: [] })
    setStage('documents')
    setMessages((m) => (m.includes('docs') ? m : [...m, 'docs']))
  }, [redoFlow, redoDraft, vehicleValue])

  const getChatPaymentAmount = useCallback(() => {
    const planId = redoFlow ? redoDraft.plan : selectedPlan
    if (!planId) return 0
    const plan = getPlanById(planId, vehicleValue)
    const addons = redoFlow ? redoDraft.addons : selectedAddons
    return calculateTotal(plan?.price ?? 0, addons, planId, {
      includeOrangeCard: wheelOrangeCard,
      premiumDiscountPercent,
    }).total
  }, [
    redoFlow,
    redoDraft,
    selectedPlan,
    selectedAddons,
    vehicleValue,
    wheelOrangeCard,
    premiumDiscountPercent,
  ])

  const getUiPaymentAmount = useCallback(() => {
    if (!uiSelectedPlan) return 0
    const plan = getPlanById(uiSelectedPlan, uiVehicleValue)
    return calculateTotal(plan?.price ?? 0, uiSelectedAddons, uiSelectedPlan, {
      includeOrangeCard: wheelOrangeCard,
      premiumDiscountPercent,
    }).total
  }, [uiSelectedPlan, uiSelectedAddons, uiVehicleValue, wheelOrangeCard, premiumDiscountPercent])

  const openChatPaymentModal = useCallback(
    (viaResume = false) => {
      if (stage !== 'confirm' && !redoFlow) return
      paymentViaResumeRef.current = viaResume
      setPaymentTarget('chat')
      setPaymentModalOpen(true)
    },
    [stage, redoFlow],
  )

  const handlePay = () => {
    openChatPaymentModal(false)
  }

  const startRedo = (type) => {
    if (['documents', 'complete'].includes(stage)) return

    const frozen = { plan: selectedPlan, addons: selectedAddons }

    if (type === 'plan') {
      setRedoFlow({ step: 'plan', frozen })
      setRedoDraft({ plan: null, addons: [] })
      return
    }

    if (type === 'addons' && selectedPlan && isComprehensivePlan(selectedPlan)) {
      setRedoFlow({ step: 'addons', frozen })
      setRedoDraft({ plan: selectedPlan, addons: [] })
    }
  }

  const handleRedoPlanSelect = (planId) => {
    markJourneyEngaged()
    const plan = getPlanById(planId, vehicleValue)
    const nextStep = getStepAfterPlanSelect(planId)
    setRedoDraft({ plan: planId, addons: [] })
    setRedoFlow((prev) => ({ ...prev, step: nextStep }))
    if (plan) {
      setUserActions((prev) => {
        const next = [...prev]
        next[0] = COPY.user.plan(plan.name)
        if (nextStep === 'confirm') {
          next[1] = COPY.user.addons(0)
        }
        return next.length ? next : [COPY.user.plan(plan.name)]
      })
    }
    if (nextStep === 'confirm') {
      setDetailsExpanded(false)
      setPolicyStart(getTodayDate())
    }
  }

  const handleRedoToggleAddon = (id) => {
    markJourneyEngaged()
    setRedoDraft((prev) => ({
      ...prev,
      addons: toggleAddonSelection(prev.addons, id, { wheelOrangeCardWon: wheelOrangeCard }),
    }))
  }

  const handleRedoConfirmAddons = () => {
    markJourneyEngaged()
    setUserActions((prev) => {
      const next = [...prev]
      next[1] = COPY.user.addons(redoDraft.addons.length)
      return next
    })
    setDetailsExpanded(false)
    setPolicyStart(getTodayDate())
    setRedoFlow((prev) => ({ ...prev, step: 'confirm' }))
  }

  const handleVerify = async () => {
    markJourneyEngaged()
    setProcessing(true)
    await delay(2000)
    setProcessing(false)
    setStage('complete')
    setMessages((m) => [...m, 'policy'])
  }

  const toggleAddon = (id) => {
    if (stage !== 'addons') return
    markJourneyEngaged()
    setSelectedAddons((prev) =>
      toggleAddonSelection(prev, id, { wheelOrangeCardWon: wheelOrangeCard }),
    )
  }

  const addonGridProps = {
    wheelOrangeCard,
  }
  const confirmWheelProps = {
    wheelOrangeCard,
    premiumDiscountPercent,
  }

  const handleDownload = () => {
    const blob = new Blob(
      ['LIVA Car Insurance Policy\n\nPolicy Holder: Rashid Khan\nVehicle: Toyota Land Cruiser 2022\nCoverage: Comprehensive'],
      { type: 'text/plain' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'LIVA-Policy-Rashid-Khan.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  const presentResumeStep = useCallback((step) => {
    setResumeFlow({ step, key: Date.now() })
    markJourneyEngaged()
  }, [markJourneyEngaged])

  const handlePaymentModalPay = useCallback(async () => {
    setPaymentModalBusy(true)
    await delay(1600)
    setPaymentModalBusy(false)
    setPaymentModalOpen(false)

    if (paymentTarget === 'ui') {
      setUiProcessing(true)
      await delay(500)
      setUiProcessing(false)
      setUiStage('documents')
    } else if (paymentTarget === 'chat') {
      const viaResume = paymentViaResumeRef.current
      await finalizeChatPayment()
      paymentViaResumeRef.current = false
      if (viaResume) {
        presentResumeStep('docs')
      }
    }

    setPaymentTarget(null)
  }, [paymentTarget, finalizeChatPayment, presentResumeStep])

  const presentPendingStep = useCallback(() => {
    const step = getPendingStep({ stage, redoFlow })
    if (!step) return
    presentResumeStep(step)
  }, [stage, redoFlow, presentResumeStep])

  const handleResumePlanSelect = (planId) => {
    const nextStep = getStepAfterPlanSelect(planId)
    if (redoFlow) {
      handleRedoPlanSelect(planId)
      presentResumeStep(nextStep)
      return
    }
    setSelectedPlan(planId)
    if (!isComprehensivePlan(planId)) {
      setSelectedAddons(addonsAfterPlanChange(wheelOrangeCard))
    }
    const plan = getPlanById(planId, vehicleValue)
    registerAction(COPY.user.plan(plan?.name))
    setStage(nextStep)
    setMessages((m) => {
      const next = [...m]
      if (nextStep === 'addons' && !next.includes('addons')) next.push('addons')
      if (nextStep === 'confirm' && !next.includes('confirm')) next.push('confirm')
      return next
    })
    if (nextStep === 'confirm') {
      setDetailsExpanded(false)
      setPolicyStart(getTodayDate())
    }
    presentResumeStep(nextStep)
  }

  const handleResumeConfirmAddons = () => {
    if (redoFlow) {
      handleRedoConfirmAddons()
      presentResumeStep('confirm')
      return
    }
    registerAction(COPY.user.addons(selectedAddons.length))
    setStage('confirm')
    setMessages((m) => [...m, 'confirm'])
    setDetailsExpanded(false)
    setPolicyStart(getTodayDate())
    presentResumeStep('confirm')
  }

  const handleResumeToggleAddon = (id) => {
    markJourneyEngaged()
    if (redoFlow) {
      handleRedoToggleAddon(id)
      return
    }
    toggleAddon(id)
  }

  const handleResumePay = () => {
    openChatPaymentModal(true)
  }

  const handleResumeVerify = async () => {
    markJourneyEngaged()
    setProcessing(true)
    await delay(2000)
    setProcessing(false)
    setStage('complete')
    setMessages((m) => [...m, 'policy'])
    setResumeFlow(null)
  }

  const handleFlowModeChange = useCallback(
    (mode) => {
      if (presentationMode) return
      setFlowOverride(null)
      setFlowModeState(mode)
      if (mode === 'chat' && !redoFlow) {
        setJourneyEngaged(false)
        requestAnimationFrame(() => scrollToLatest())
      }
    },
    [presentationMode, redoFlow, scrollToLatest],
  )

  const handleUiSelectPlan = (planId) => {
    setUiSelectedPlan(planId)
    if (!isComprehensivePlan(planId)) {
      setUiSelectedAddons(addonsAfterPlanChange(wheelOrangeCard))
    }
  }

  const handleUiToggleAddon = (id) => {
    setUiSelectedAddons((prev) =>
      toggleAddonSelection(prev, id, { wheelOrangeCardWon: wheelOrangeCard }),
    )
  }

  const handleUiDownloadQuote = () => {
    const plan = getPlanById(uiSelectedPlan, uiVehicleValue)
    const blob = new Blob(
      [
        `LIVA Insurance Quote\n\nPolicy Holder: Rashid Khan\nInsured Value: ${formatAED(uiVehicleValue)}\nPlan: ${plan?.name}\nPlate: ${VEHICLE.plate}\nPolicy Period: ${uiPolicyStart} – ${addMonthsToDate(uiPolicyStart, 13)}`,
      ],
      { type: 'text/plain' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'LIVA-Quote-Rashid-Khan.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUiAgreePay = () => {
    if (!uiSelectedPlan) return
    setPaymentTarget('ui')
    setPaymentModalOpen(true)
  }

  const handleUiVerify = async () => {
    setUiProcessing(true)
    await delay(2000)
    setUiProcessing(false)
    setUiStage('complete')
  }

  const handleSupport = async () => {
    if (supportLoading) return
    if (flowMode === 'ui') {
      if (!presentationMode) setFlowModeState('chat')
    } else if (!redoFlow) {
      setJourneyEngaged(false)
    }
    setSupportLoading(true)
    setSupportVisible(false)
    scrollToLatest()
    await delay(700)
    setSupportLoading(false)
    setSupportRequestKey((k) => k + 1)
    setSupportVisible(true)
    scrollToLatest()
  }

  const handleUiSupportBack = () => {
    if (supportLoading) return
    setSupportVisible(false)
    setSupportLoading(false)
    setFaqTyping(false)
    setFaqTypingAnchor((anchor) => (anchor === 'support' ? null : anchor))
    setFaqMessages((prev) => prev.filter((m) => m.afterStep !== 'support'))
  }

  const handleFaqSend = async (query) => {
    if (flowMode === 'chat' && !redoFlow) setJourneyEngaged(false)
    const anchor =
      flowMode === 'ui' || supportVisible || supportLoading
        ? 'support'
        : stageToAnchor(stage)
    const id = Date.now()
    const history = faqMessages
    const revision = detectRevisionIntent(query)

    setFaqMessages((prev) => [...prev, { id, role: 'user', text: query, afterStep: anchor }])

    if (flowMode === 'chat') {
      const resolution = resolveRevisionIntent(revision, { stage, redoFlow, selectedPlan })

      if (resolution.action === 'already') {
        setFaqMessages((prev) => [
          ...prev,
          {
            id: id + 1,
            role: 'ai',
            text: resolution.message || getAlreadyOnStepReply(resolution.step),
            afterStep: anchor,
          },
        ])
        scrollToLatest()
        return
      }

      if (resolution.action === 'needs' || resolution.action === 'blocked') {
        setFaqMessages((prev) => [
          ...prev,
          { id: id + 1, role: 'ai', text: resolution.message, afterStep: anchor },
        ])
        return
      }

      if (resolution.action === 'redo') {
        startRedo(resolution.type)
        if (resolution.message) {
          setFaqMessages((prev) => [
            ...prev,
            { id: id + 1, role: 'ai', text: resolution.message, afterStep: anchor },
          ])
        }
        markJourneyEngaged()
        scrollToLatest()
        return
      }
    }

    const context = buildChatContext({
      stage: flowMode === 'ui' ? uiStage : stage,
      selectedPlan: flowMode === 'ui' ? uiSelectedPlan : selectedPlan,
      selectedAddons: flowMode === 'ui' ? uiSelectedAddons : selectedAddons,
      vehicleValue: flowMode === 'ui' ? uiVehicleValue : vehicleValue,
      policyStart: flowMode === 'ui' ? uiPolicyStart : policyStart,
    })

    if (isControversialQuery(query)) {
      setFaqMessages((prev) => [
        ...prev,
        { id: id + 1, role: 'ai', text: getControversialFallback(context), afterStep: anchor, source: 'guard' },
      ])
      scrollToLatest()
      return
    }

    setFaqTyping(true)
    setFaqTypingAnchor(anchor)

    const { text, source } = await getChatReply(query, { history, context })

    if (source === 'ai') {
      setAiConnected(true)
    } else if (source === 'error') {
      setAiConnected(false)
    }

    setFaqTyping(false)
    setFaqTypingAnchor(null)
    setFaqMessages((prev) => [...prev, { id: id + 1, role: 'ai', text, afterStep: anchor, source }])
  }

  const hasSupportThread = faqMessages.some((m) => m.afterStep === 'support')
  const uiSupportActive =
    flowMode === 'ui' && (supportLoading || supportVisible || hasSupportThread)
  const supportPlanHint =
    flowMode === 'ui'
      ? uiSelectedPlan
        ? getPlanById(uiSelectedPlan, uiVehicleValue)?.name
        : undefined
      : selectedPlan
        ? getPlanById(selectedPlan, vehicleValue)?.name
        : undefined

  const proceedCta = getProceedCta({ stage, redoFlow })
  const hasChatted = faqMessages.some((m) => m.role === 'user')
  const divertedFromJourney = hasChatted || supportVisible || supportLoading
  const journeyPaused = flowMode === 'chat' && divertedFromJourney
  const chatDiverted = journeyPaused && !journeyEngaged
  const showProceedBadge = flowMode === 'chat' && Boolean(proceedCta && chatDiverted)
  const resumeLocked = chatDiverted && !!resumeFlow

  const planLocked = stage !== 'plan' || !!redoFlow || journeyPaused
  const addonsLocked = stage !== 'addons' || !!redoFlow || journeyPaused
  const confirmLocked = !!redoFlow || journeyPaused
  const docsLocked = chatDiverted
  const redoLocked = chatDiverted && !!redoFlow
  const journeyLocked = !!redoFlow
  const frozenPlan = redoFlow?.frozen.plan ?? selectedPlan
  const frozenAddons = redoFlow?.frozen.addons ?? selectedAddons
  const activePlanId = redoFlow ? redoDraft.plan : selectedPlan
  const activeAddons = redoFlow ? redoDraft.addons : selectedAddons
  const highlightPlan = (stage === 'plan' && !redoFlow) || redoFlow?.step === 'plan'
  const highlightAddons = (stage === 'addons' && !redoFlow) || redoFlow?.step === 'addons'
  const highlightConfirm = (stage === 'confirm' && !redoFlow) || redoFlow?.step === 'confirm'
  const highlightDocs = stage === 'documents' && !redoFlow && !docsLocked

  const wheelArchivePlan = wheelArchivesStep(wheelWinAtStage, 'plan')
  const wheelArchiveAddons = wheelArchivesStep(wheelWinAtStage, 'addons')
  const wheelArchiveConfirm = wheelArchivesStep(wheelWinAtStage, 'confirm')
  const wheelArchiveDocs = wheelArchivesStep(wheelWinAtStage, 'documents')

  const handleProceed = () => {
    if (!proceedCta) return
    presentPendingStep()
  }

  const atOrPastPaymentStep =
    flowMode === 'ui'
      ? uiStage === 'documents' || uiStage === 'complete'
      : stage === 'confirm' || stage === 'documents' || stage === 'complete'

  const wheelEligible =
    !wheelSpunAndWon &&
    !atOrPastPaymentStep &&
    !videoCallActive &&
    !paymentModalOpen

  useEffect(() => {
    if (!wheelEligible || wheelAutoShownRef.current) return

    const timer = window.setTimeout(() => {
      if (wheelSpunAndWon || atOrPastPaymentStep || videoCallActive || paymentModalOpen) return
      wheelAutoShownRef.current = true
      setWheelOpen(true)
    }, 20_000)

    return () => window.clearTimeout(timer)
  }, [wheelEligible, wheelSpunAndWon, atOrPastPaymentStep, videoCallActive, paymentModalOpen])

  const supportFaqSection = (
    <div className="space-y-3" data-scroll-anchor>
      {supportLoading && (
        <ChatBubble role="ai">
          <TypingDots />
        </ChatBubble>
      )}
      <AnimatePresence>
        {supportVisible && (
          <motion.div
            key="support-callback"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={uiSupportActive ? undefined : 'ml-9'}
          >
            <SupportCallbackCard
              key={supportRequestKey}
              onClose={() => setSupportVisible(false)}
              onTeamsCallNow={() => {
                setSupportVisible(false)
                setVideoCallActive(true)
              }}
              planHint={supportPlanHint}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <FaqThread
        messages={faqMessages}
        anchor="support"
        typing={faqTyping}
        activeAnchor={faqTypingAnchor}
      />
    </div>
  )

  return (
      <div
        ref={appFrameRef}
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white"
      >
        <JackpotWheelModal open={wheelOpen} onClose={handleWheelClose} onPrize={handleWheelPrize} />
        <PaymentCheckoutModal
          open={paymentModalOpen}
          onClose={() => !paymentModalBusy && setPaymentModalOpen(false)}
          amount={paymentTarget === 'ui' ? getUiPaymentAmount() : getChatPaymentAmount()}
          customerName={USER.firstName}
          processing={paymentModalBusy}
          onPay={handlePaymentModalPay}
        />
        {videoCallActive && (
          <SupportAuraCall
            onEndCall={() => {
              setVideoCallActive(false)
              setSupportVisible(false)
            }}
          />
        )}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col pb-2">
      <Header
        flowMode={flowMode}
        onFlowModeChange={showFlowToggle ? handleFlowModeChange : undefined}
        onContactSupport={handleSupport}
        supportLoading={supportLoading}
      />

      {flowMode === 'ui' && !uiSupportActive && (
        <UiRenewalFlow
          stage={uiStage}
          vehicleValue={uiVehicleValue}
          onVehicleValueChange={setUiVehicleValue}
          selectedPlan={uiSelectedPlan}
          onSelectPlan={handleUiSelectPlan}
          selectedAddons={uiSelectedAddons}
          onToggleAddon={handleUiToggleAddon}
          policyStart={uiPolicyStart}
          onPolicyStartChange={setUiPolicyStart}
          onDownloadQuote={handleUiDownloadQuote}
          onAgreePay={handleUiAgreePay}
          onVerifyDocs={handleUiVerify}
          onDownloadPolicy={handleDownload}
          processing={uiProcessing}
          wheelOrangeCard={wheelOrangeCard}
          premiumDiscountPercent={premiumDiscountPercent}
        />
      )}

      {flowMode === 'ui' && uiSupportActive && (
        <main
          ref={chatRef}
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-2"
        >
          <button
            type="button"
            onClick={handleUiSupportBack}
            disabled={supportLoading}
            className="mb-3 inline-flex items-center gap-0.5 rounded-full py-1 pr-2 text-xs font-semibold text-gray-600 transition-colors hover:text-liva-orange disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
            Go back
          </button>
          <div className="relative z-10 pb-6">{supportFaqSection}</div>
        </main>
      )}

      {flowMode === 'chat' && (
      <main ref={chatRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-8 pt-1">
        <div className="relative z-10 space-y-3 pb-6">
        <LockedSection locked={journeyLocked || wheelArchivePlan}>
          <ChatBubble role="ai" delay={0}>
            {typing ? (
              <TypingDots />
            ) : (
              <IntroMessage value={vehicleValue} onValueChange={setVehicleValue} />
            )}
          </ChatBubble>
        </LockedSection>

        <FaqThread
          messages={faqMessages}
          anchor="intro"
          typing={faqTyping}
          activeAnchor={faqTypingAnchor}
        />

        <AnimatePresence>
          {messages.includes('plan') && resumeFlow?.step !== 'plan' && (
            <motion.div
              key="plan"
              {...(wheelArchivePlan ? {} : { 'data-journey': 'plan' })}
              data-scroll-anchor
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <LockedSection locked={planLocked || wheelArchivePlan}>
                <div>
                  <PlanSelector
                    selectedPlan={frozenPlan}
                    onSelect={handlePlanSelect}
                    disabled={planLocked || wheelArchivePlan}
                    highlightNext={highlightPlan && !planLocked && !wheelArchivePlan}
                    vehicleValue={vehicleValue}
                  />
                </div>
              </LockedSection>
              {wheelArchivePlan && (
                <div data-wheel-resume="plan" data-journey="plan" data-scroll-anchor className="space-y-2">
                  <WheelWinNotice show />
                  <PlanSelector
                    selectedPlan={frozenPlan}
                    onSelect={handlePlanSelect}
                    disabled={planLocked}
                    highlightNext={highlightPlan && !planLocked}
                    vehicleValue={vehicleValue}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <FaqThread
          messages={faqMessages}
          anchor="plan"
          typing={faqTyping}
          activeAnchor={faqTypingAnchor}
        />

        <AnimatePresence>
          {messages.includes('addons') &&
            (wheelOrangeCard || (frozenPlan && isComprehensivePlan(frozenPlan))) &&
            resumeFlow?.step !== 'addons' && (
            <motion.div
              key="addons"
              {...(wheelArchiveAddons ? {} : { 'data-journey': 'addons' })}
              data-scroll-anchor
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <LockedSection locked={journeyLocked || wheelArchiveAddons}>
                <UserAction delay={0}>{userActions[0]}</UserAction>
              </LockedSection>
              <LockedSection locked={addonsLocked || wheelArchiveAddons}>
                <ChatBubble role="ai">
                  <AddonsIntroMessage />
                </ChatBubble>
                <div className="ml-9">
                  <AddonGrid
                    planId={frozenPlan}
                    selectedAddons={frozenAddons}
                    onToggle={toggleAddon}
                    disabled={addonsLocked || wheelArchiveAddons}
                    onContinue={
                      stage === 'addons' && !redoFlow && !wheelArchiveAddons
                        ? handleConfirmAddons
                        : undefined
                    }
                    highlightNext={highlightAddons && !addonsLocked && !wheelArchiveAddons}
                    {...addonGridProps}
                  />
                </div>
              </LockedSection>
              {wheelArchiveAddons && (
                <div data-wheel-resume="addons" data-journey="addons" data-scroll-anchor className="space-y-2">
                  <WheelWinNotice show />
                  <ChatBubble role="ai">
                    <AddonsIntroMessage />
                  </ChatBubble>
                  <div className="ml-9">
                    <AddonGrid
                      planId={frozenPlan}
                      selectedAddons={frozenAddons}
                      onToggle={toggleAddon}
                      disabled={addonsLocked}
                      onContinue={stage === 'addons' && !redoFlow ? handleConfirmAddons : undefined}
                      highlightNext={highlightAddons && !addonsLocked}
                      {...addonGridProps}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <FaqThread
          messages={faqMessages}
          anchor="addons"
          typing={faqTyping}
          activeAnchor={faqTypingAnchor}
        />

        <AnimatePresence>
          {(messages.includes('confirm') || premiumDiscountPercent > 0) &&
            selectedPlan &&
            resumeFlow?.step !== 'confirm' && (
            <motion.div
              key="confirm"
              {...(wheelArchiveConfirm ? {} : { 'data-journey': 'confirm' })}
              data-scroll-anchor
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <LockedSection locked={confirmLocked || wheelArchiveConfirm}>
                <UserAction delay={0}>{userActions[1] ?? userActions[0]}</UserAction>
                <ChatBubble role="ai">
                  <ConfirmIntroMessage />
                </ChatBubble>
                <div className="ml-9">
                  <ConfirmDetailsCard
                    planId={selectedPlan}
                    selectedAddons={selectedAddons}
                    vehicleValue={vehicleValue}
                    policyStart={policyStart}
                    onPolicyStartChange={setPolicyStart}
                    detailsExpanded={detailsExpanded}
                    onToggleDetails={() => setDetailsExpanded((open) => !open)}
                    onDownloadQuote={handleDownloadQuote}
                    onProceed={handlePay}
                    processing={processing && stage === 'confirm' && !redoFlow}
                    highlightNext={highlightConfirm && !confirmLocked && !wheelArchiveConfirm}
                    {...confirmWheelProps}
                  />
                </div>
              </LockedSection>
              {wheelArchiveConfirm && (
                <div data-wheel-resume="confirm" data-journey="confirm" data-scroll-anchor className="space-y-2">
                  <WheelWinNotice show />
                  <ChatBubble role="ai">
                    <ConfirmIntroMessage />
                  </ChatBubble>
                  <div className="ml-9">
                    <ConfirmDetailsCard
                      planId={selectedPlan}
                      selectedAddons={selectedAddons}
                      vehicleValue={vehicleValue}
                      policyStart={policyStart}
                      onPolicyStartChange={setPolicyStart}
                      detailsExpanded={detailsExpanded}
                      onToggleDetails={() => setDetailsExpanded((open) => !open)}
                      onDownloadQuote={handleDownloadQuote}
                      onProceed={handlePay}
                      processing={processing && stage === 'confirm' && !redoFlow}
                      highlightNext={highlightConfirm && !confirmLocked}
                      {...confirmWheelProps}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <FaqThread
          messages={faqMessages}
          anchor="confirm"
          typing={faqTyping}
          activeAnchor={faqTypingAnchor}
        />

        <AnimatePresence>
          {messages.includes('docs') && resumeFlow?.step !== 'docs' && (
            <motion.div
              key="docs"
              {...(wheelArchiveDocs ? {} : { 'data-journey': 'docs' })}
              data-scroll-anchor
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <ChatBubble role="ai">
                <PaymentMessage />
              </ChatBubble>
              <div className="ml-9">
                <LockedSection locked={docsLocked || wheelArchiveDocs}>
                  <DocumentUpload
                    uploaded={stage === 'complete'}
                    uploading={processing && stage === 'documents'}
                    onVerify={
                      stage === 'documents' && !docsLocked && !wheelArchiveDocs
                        ? handleVerify
                        : undefined
                    }
                    highlightNext={highlightDocs && !wheelArchiveDocs}
                  />
                </LockedSection>
              </div>
              {wheelArchiveDocs && (
                <div data-wheel-resume="docs" data-journey="docs" data-scroll-anchor className="space-y-2">
                  <WheelWinNotice show />
                  <div className="ml-9">
                  <DocumentUpload
                    uploaded={stage === 'complete'}
                    uploading={processing && stage === 'documents'}
                    onVerify={stage === 'documents' && !docsLocked ? handleVerify : undefined}
                    highlightNext={highlightDocs}
                  />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <FaqThread
          messages={faqMessages}
          anchor="docs"
          typing={faqTyping}
          activeAnchor={faqTypingAnchor}
        />

        <AnimatePresence>
          {messages.includes('policy') && (
            <motion.div key="policy" data-journey="policy" data-scroll-anchor initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <ChatBubble role="ai">{COPY.policy}</ChatBubble>
              <div className="ml-9">
                <PolicyReady onDownload={handleDownload} />
              </div>
              <ChatBubble role="ai" delay={0.2}>
                <span className="text-[12px] text-gray-500">{COPY.support}</span>
              </ChatBubble>
            </motion.div>
          )}
        </AnimatePresence>

        <FaqThread
          messages={faqMessages}
          anchor="policy"
          typing={faqTyping}
          activeAnchor={faqTypingAnchor}
        />

        <AnimatePresence>
          {redoFlow && (
            <motion.div
              key={`redo-${redoFlow.step}`}
              data-journey="redo"
              data-scroll-anchor
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              {redoFlow.step === 'plan' && (
                <>
                  <ChatBubble role="ai">
                    <IntroMessage value={vehicleValue} onValueChange={setVehicleValue} />
                  </ChatBubble>
                  <div>
                    <PlanSelector
                      selectedPlan={activePlanId}
                      onSelect={handleRedoPlanSelect}
                      disabled={redoLocked}
                      highlightNext={highlightPlan && !redoLocked}
                      vehicleValue={vehicleValue}
                    />
                  </div>
                </>
              )}

              {redoFlow.step === 'addons' &&
                (isComprehensivePlan(activePlanId) || wheelOrangeCard) && (
                <>
                  <ChatBubble role="ai">
                    <AddonsIntroMessage />
                  </ChatBubble>
                  <div className="ml-9">
                    <AddonGrid
                      planId={activePlanId}
                      selectedAddons={activeAddons}
                      onToggle={handleRedoToggleAddon}
                      disabled={redoLocked}
                      onContinue={redoLocked ? undefined : handleRedoConfirmAddons}
                      highlightNext={highlightAddons && !redoLocked}
                      {...addonGridProps}
                    />
                  </div>
                </>
              )}

              {redoFlow.step === 'confirm' && (
                <>
                  <ChatBubble role="ai">
                    <ConfirmIntroMessage />
                  </ChatBubble>
                  <div className="ml-9">
                    <ConfirmDetailsCard
                      planId={activePlanId}
                      selectedAddons={activeAddons}
                      vehicleValue={vehicleValue}
                      policyStart={policyStart}
                      onPolicyStartChange={setPolicyStart}
                      detailsExpanded={detailsExpanded}
                      onToggleDetails={() => setDetailsExpanded((open) => !open)}
                      onDownloadQuote={handleDownloadQuote}
                      onProceed={handlePay}
                      processing={processing}
                      highlightNext={highlightConfirm && !redoLocked}
                      {...confirmWheelProps}
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {resumeFlow && (
            <motion.div
              key={`resume-${resumeFlow.key}`}
              data-journey="resume"
              data-scroll-anchor
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-2"
            >
              {resumeFlow.step === 'plan' && (
                <div>
                  <PlanSelector
                    selectedPlan={redoFlow ? activePlanId : selectedPlan}
                    onSelect={handleResumePlanSelect}
                    disabled={resumeLocked}
                    highlightNext={!resumeLocked}
                    vehicleValue={vehicleValue}
                  />
                </div>
              )}

              {resumeFlow.step === 'addons' && (
                <>
                  {userActions[0] && <UserAction delay={0}>{userActions[0]}</UserAction>}
                  <ChatBubble role="ai">
                    <AddonsIntroMessage />
                  </ChatBubble>
                  <div className="ml-9">
                    <AddonGrid
                      planId={redoFlow ? activePlanId : selectedPlan}
                      selectedAddons={redoFlow ? activeAddons : selectedAddons}
                      onToggle={handleResumeToggleAddon}
                      disabled={resumeLocked}
                      onContinue={resumeLocked ? undefined : handleResumeConfirmAddons}
                      highlightNext={!resumeLocked}
                      {...addonGridProps}
                    />
                  </div>
                </>
              )}

              {resumeFlow.step === 'confirm' && (
                <>
                  {userActions[1] ?? userActions[0] ? (
                    <UserAction delay={0}>{userActions[1] ?? userActions[0]}</UserAction>
                  ) : null}
                  <ChatBubble role="ai">
                    <ConfirmIntroMessage />
                  </ChatBubble>
                  <div className="ml-9">
                    <ConfirmDetailsCard
                      planId={redoFlow ? activePlanId : selectedPlan}
                      selectedAddons={redoFlow ? activeAddons : selectedAddons}
                      vehicleValue={vehicleValue}
                      policyStart={policyStart}
                      onPolicyStartChange={setPolicyStart}
                      detailsExpanded={detailsExpanded}
                      onToggleDetails={() => setDetailsExpanded((open) => !open)}
                      onDownloadQuote={handleDownloadQuote}
                      onProceed={handleResumePay}
                      processing={processing && (stage === 'confirm' || !!redoFlow)}
                      highlightNext={!resumeLocked}
                      {...confirmWheelProps}
                    />
                  </div>
                </>
              )}

              {resumeFlow.step === 'docs' && (
                <>
                  <ChatBubble role="ai">
                    <PaymentMessage />
                  </ChatBubble>
                  <div className="ml-9">
                    <DocumentUpload
                      uploaded={stage === 'complete'}
                      uploading={processing && stage === 'documents'}
                      onVerify={resumeLocked ? undefined : handleResumeVerify}
                      highlightNext={!resumeLocked}
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {(supportLoading || supportVisible || hasSupportThread) && supportFaqSection}

        </div>
      </main>
      )}

      {(flowMode === 'chat' || uiSupportActive) && (
      <div className="shrink-0 px-3 pb-2 pt-1 flex flex-col items-center gap-1.5">
        {flowMode === 'chat' && <PoweredByInster />}

        {flowMode === 'chat' && (
        <AnimatePresence>
          {showProceedBadge && (
            <motion.div
              key="proceed-badge"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="flex w-full justify-center"
            >
              <button
                type="button"
                onClick={handleProceed}
                disabled={faqTyping || supportLoading}
                className="inline-flex max-w-[92%] items-center justify-center gap-1.5 rounded-full border border-liva-orange/25 bg-white/45 px-3 py-1 text-[10px] font-semibold text-liva-orange backdrop-blur-sm transition-colors hover:border-liva-orange/40 hover:bg-white/60 disabled:opacity-50 whitespace-nowrap"
              >
                <span>{proceedCta.label}</span>
                <span className="proceed-arrows" aria-hidden>
                  <ChevronRight className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                  <ChevronRight className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        )}

        <div className="w-full">
          <ChatInput
            onSend={handleFaqSend}
            onSupport={handleSupport}
            disabled={faqTyping || supportLoading}
            suggestions={FAQ_SUGGESTIONS}
            aiConnected={aiConnected}
          />
        </div>
      </div>
      )}
        </div>
      </div>
  )
}

function LockedSection({ locked, children }) {
  if (!locked) return children

  return <div className="opacity-40 pointer-events-none select-none">{children}</div>
}

function stageToAnchor(stage) {
  if (stage === 'welcome') return 'intro'
  if (stage === 'plan') return 'plan'
  if (stage === 'addons') return 'addons'
  if (stage === 'confirm') return 'confirm'
  if (stage === 'documents') return 'docs'
  if (stage === 'complete') return 'policy'
  return 'intro'
}

function journeyTargetForStage(stage) {
  if (stage === 'welcome' || stage === 'plan') return 'plan'
  if (stage === 'addons') return 'addons'
  if (stage === 'confirm') return 'confirm'
  if (stage === 'documents') return 'docs'
  if (stage === 'complete') return 'policy'
  return 'plan'
}

function wheelArchivesStep(wheelWinAtStage, step) {
  if (!wheelWinAtStage) return false
  if (step === 'plan') return wheelWinAtStage === 'plan' || wheelWinAtStage === 'welcome'
  return wheelWinAtStage === step
}

function WheelWinNotice({ show }) {
  if (!show) return null
  return (
    <ChatBubble role="ai" delay={0.12}>
      <FormattedMessage text={COPY.wheel.orangeCardWon} />
    </ChatBubble>
  )
}

function FaqThread({ messages, anchor, typing, activeAnchor }) {
  const thread = messages.filter((msg) => msg.afterStep === anchor)
  const showTyping = typing && activeAnchor === anchor

  if (thread.length === 0 && !showTyping) return null

  return (
    <>
      {thread.map((msg) => (
        <ChatBubble key={msg.id} role={msg.role} scrollAnchor replySource={msg.source}>
          {msg.role === 'ai' ? <FormattedMessage text={msg.text} /> : msg.text}
        </ChatBubble>
      ))}
      {showTyping && (
        <ChatBubble role="ai">
          <TypingDots />
        </ChatBubble>
      )}
    </>
  )
}

function TypingDots() {
  return (
    <span className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-liva-orange/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  )
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
