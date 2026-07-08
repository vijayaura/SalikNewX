import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import Header from './components/Header'
import ChatBubble, { UserAction } from './components/ChatBubble'
import FormattedMessage from './components/FormattedMessage'
import PlanSelector from './components/PlanSelector'
import AddonGrid from './components/AddonGrid'
import ConfirmDetailsCard from './components/ConfirmDetailsCard'
import DocumentUpload, { PolicyReady } from './components/DocumentUpload'
import { VEHICLE, clampInsuredValue, getPlanById } from './data'
import { FAQ_SUGGESTIONS } from './data/faqs'
import { buildChatContext } from './services/buildChatContext'
import { checkAiAvailable, getChatReply } from './services/aiChat'
import { detectRevisionIntent } from './services/localChat'
import { getControversialFallback, isControversialQuery } from './services/contentGuard'
import { getAlreadyOnStepReply, getPendingStep, getProceedCta, resolveRevisionIntent } from './services/journeyGuide'
import ChatInput from './components/ChatInput'
import MobileFrame from './components/MobileFrame'
import IntroMessage from './components/IntroMessage'
import AddonsIntroMessage from './components/AddonsIntroMessage'
import ConfirmIntroMessage from './components/ConfirmIntroMessage'
import PaymentMessage from './components/PaymentMessage'
import SupportCallbackCard from './components/SupportCallbackCard'
import PoweredByInster from './components/PoweredByInster'
import { COPY } from './copy'
import { addMonthsToDate, getTodayDate } from './data'

export default function App() {
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
  const [journeyEngaged, setJourneyEngaged] = useState(false)
  const [resumeFlow, setResumeFlow] = useState(null)
  const chatRef = useRef(null)

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

  useEffect(() => {
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
    if (stage === 'welcome') {
      setTyping(true)
      const t1 = setTimeout(() => {
        setTyping(false)
        setMessages(['greeting', 'vehicle', 'plan'])
        setStage('plan')
      }, 1200)
      return () => clearTimeout(t1)
    }
  }, [stage])

  const registerAction = useCallback((label) => {
    setUserActions((prev) => [...prev, label])
  }, [])

  const handlePlanSelect = (planId) => {
    if (stage !== 'plan' || redoFlow) return

    markJourneyEngaged()
    setSelectedPlan(planId)
    const plan = getPlanById(planId, vehicleValue)
    registerAction(COPY.user.plan(plan?.name))
    setStage('addons')
    setMessages((m) => (m.includes('addons') ? m : [...m, 'addons']))
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
        `LIVA Insurance Quote\n\nPolicy Holder: Rashid Khan\nInsured Value: ${vehicleValue.toLocaleString()} AED\nPlan: ${plan?.name}\nPlate: ${VEHICLE.plate}\nPolicy Period: ${policyStart} – ${addMonthsToDate(policyStart, 13)}`,
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

  const handlePay = async () => {
    if (stage !== 'confirm' && !redoFlow) return
    markJourneyEngaged()
    setProcessing(true)
    await delay(1800)
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
  }

  const startRedo = (type) => {
    if (['documents', 'complete'].includes(stage)) return

    const frozen = { plan: selectedPlan, addons: selectedAddons }

    if (type === 'plan') {
      setRedoFlow({ step: 'plan', frozen })
      setRedoDraft({ plan: null, addons: [] })
      return
    }

    if (type === 'addons' && selectedPlan) {
      setRedoFlow({ step: 'addons', frozen })
      setRedoDraft({ plan: selectedPlan, addons: [] })
    }
  }

  const handleRedoPlanSelect = (planId) => {
    markJourneyEngaged()
    const plan = getPlanById(planId, vehicleValue)
    setRedoDraft({ plan: planId, addons: [] })
    setRedoFlow((prev) => ({ ...prev, step: 'addons' }))
    if (plan) {
      setUserActions((prev) => {
        const next = [...prev]
        next[0] = COPY.user.plan(plan.name)
        return next.length ? next : [COPY.user.plan(plan.name)]
      })
    }
  }

  const handleRedoToggleAddon = (id) => {
    markJourneyEngaged()
    setRedoDraft((prev) => ({
      ...prev,
      addons: prev.addons.includes(id)
        ? prev.addons.filter((a) => a !== id)
        : [...prev.addons, id],
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
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    )
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

  const presentPendingStep = useCallback(() => {
    const step = getPendingStep({ stage, redoFlow })
    if (!step) return
    presentResumeStep(step)
  }, [stage, redoFlow, presentResumeStep])

  const handleResumePlanSelect = (planId) => {
    if (redoFlow) {
      handleRedoPlanSelect(planId)
      presentResumeStep('addons')
      return
    }
    setSelectedPlan(planId)
    const plan = getPlanById(planId, vehicleValue)
    registerAction(COPY.user.plan(plan?.name))
    setStage('addons')
    setMessages((m) => (m.includes('addons') ? m : [...m, 'addons']))
    presentResumeStep('addons')
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

  const handleResumePay = async () => {
    if (stage !== 'confirm' && !redoFlow) return
    markJourneyEngaged()
    setProcessing(true)
    await delay(1800)
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
    presentResumeStep('docs')
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

  const handleSupport = async () => {
    if (supportLoading) return
    setJourneyEngaged(false)
    setSupportLoading(true)
    setSupportVisible(false)
    scrollToLatest()
    await delay(700)
    setSupportLoading(false)
    setSupportVisible(true)
    scrollToLatest()
  }

  const handleFaqSend = async (query) => {
    if (!redoFlow) setJourneyEngaged(false)
    const anchor = stageToAnchor(stage)
    const id = Date.now()
    const history = faqMessages
    const revision = detectRevisionIntent(query)

    setFaqMessages((prev) => [...prev, { id, role: 'user', text: query, afterStep: anchor }])

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

    const context = buildChatContext({
      stage,
      selectedPlan,
      selectedAddons,
      vehicleValue,
      policyStart,
    })

    if (isControversialQuery(query)) {
      setFaqMessages((prev) => [
        ...prev,
        { id: id + 1, role: 'ai', text: getControversialFallback(context), afterStep: anchor },
      ])
      scrollToLatest()
      return
    }

    setFaqTyping(true)
    setFaqTypingAnchor(anchor)

    const { text, source } = await getChatReply(query, { history, context })

    if (source === 'claude') {
      setAiConnected(true)
    } else if (source === 'error') {
      setAiConnected(false)
    }

    setFaqTyping(false)
    setFaqTypingAnchor(null)
    setFaqMessages((prev) => [...prev, { id: id + 1, role: 'ai', text, afterStep: anchor }])
  }

  const proceedCta = getProceedCta({ stage, redoFlow })
  const hasChatted = faqMessages.some((m) => m.role === 'user')
  const divertedFromJourney = hasChatted || supportVisible || supportLoading
  const chatDiverted = !journeyEngaged && divertedFromJourney
  const showProceedBadge = Boolean(proceedCta && chatDiverted)
  const resumeLocked = chatDiverted && !!resumeFlow

  const planLocked = stage !== 'plan' || !!redoFlow || divertedFromJourney
  const addonsLocked = stage !== 'addons' || !!redoFlow || divertedFromJourney
  const confirmLocked = !!redoFlow || divertedFromJourney
  const docsLocked = divertedFromJourney
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

  const handleProceed = () => {
    if (!proceedCta) return
    presentPendingStep()
  }

  return (
    <MobileFrame>
      <div className="relative flex flex-col h-full min-h-0 bg-white">
        <div className="relative z-10 flex min-h-0 flex-1 flex-col pb-2">
      <Header onContactSupport={handleSupport} supportLoading={supportLoading} />

      <main ref={chatRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-8 pt-1">
        <div className="relative z-10 space-y-3 pb-6">
        <LockedSection locked={journeyLocked}>
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
            <motion.div key="plan" data-journey="plan" data-scroll-anchor initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <LockedSection locked={planLocked}>
                <div className="ml-9">
                  <PlanSelector
                    selectedPlan={frozenPlan}
                    onSelect={handlePlanSelect}
                    disabled={planLocked}
                    highlightNext={highlightPlan && !planLocked}
                    vehicleValue={vehicleValue}
                  />
                </div>
              </LockedSection>
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
          {messages.includes('addons') && resumeFlow?.step !== 'addons' && (
            <motion.div key="addons" data-journey="addons" data-scroll-anchor initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <LockedSection locked={journeyLocked}>
                <UserAction delay={0}>{userActions[0]}</UserAction>
              </LockedSection>
              <LockedSection locked={addonsLocked}>
                <ChatBubble role="ai">
                  <AddonsIntroMessage />
                </ChatBubble>
                <div className="ml-9">
                  <AddonGrid
                    selectedAddons={frozenAddons}
                    onToggle={toggleAddon}
                    disabled={addonsLocked}
                    onContinue={stage === 'addons' && !redoFlow ? handleConfirmAddons : undefined}
                    highlightNext={highlightAddons && !addonsLocked}
                  />
                </div>
              </LockedSection>
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
          {messages.includes('confirm') && resumeFlow?.step !== 'confirm' && (
            <motion.div key="confirm" data-journey="confirm" data-scroll-anchor initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <LockedSection locked={confirmLocked}>
                <UserAction delay={0}>{userActions[1]}</UserAction>
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
                  />
                </div>
              </LockedSection>
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
            <motion.div key="docs" data-journey="docs" data-scroll-anchor initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <ChatBubble role="ai">
                <PaymentMessage />
              </ChatBubble>
              <div className="ml-9">
                <LockedSection locked={docsLocked}>
                  <DocumentUpload
                    uploaded={stage === 'complete'}
                    uploading={processing && stage === 'documents'}
                    onVerify={stage === 'documents' && !docsLocked ? handleVerify : undefined}
                    highlightNext={highlightDocs}
                  />
                </LockedSection>
              </div>
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
                  <div className="ml-9">
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

              {redoFlow.step === 'addons' && (
                <>
                  <ChatBubble role="ai">
                    <AddonsIntroMessage />
                  </ChatBubble>
                  <div className="ml-9">
                    <AddonGrid
                      selectedAddons={activeAddons}
                      onToggle={handleRedoToggleAddon}
                      disabled={redoLocked}
                      onContinue={redoLocked ? undefined : handleRedoConfirmAddons}
                      highlightNext={highlightAddons && !redoLocked}
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
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
              className="ml-9"
              data-scroll-anchor
            >
              <SupportCallbackCard />
            </motion.div>
          )}
        </AnimatePresence>

        {faqTyping && !faqTypingAnchor && (
          <ChatBubble role="ai">
            <TypingDots />
          </ChatBubble>
        )}

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
                <div className="ml-9">
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
                      selectedAddons={redoFlow ? activeAddons : selectedAddons}
                      onToggle={handleResumeToggleAddon}
                      disabled={resumeLocked}
                      onContinue={resumeLocked ? undefined : handleResumeConfirmAddons}
                      highlightNext={!resumeLocked}
                    />
                  </div>
                </>
              )}

              {resumeFlow.step === 'confirm' && (
                <>
                  {userActions[1] && <UserAction delay={0}>{userActions[1]}</UserAction>}
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

        </div>
      </main>

      <div className="shrink-0 px-3 pb-2 pt-1 flex flex-col items-center gap-1.5">
        <PoweredByInster />

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
        </div>
      </div>
    </MobileFrame>
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

function FaqThread({ messages, anchor, typing, activeAnchor }) {
  const thread = messages.filter((msg) => msg.afterStep === anchor)
  const showTyping = typing && activeAnchor === anchor

  if (thread.length === 0 && !showTyping) return null

  return (
    <>
      {thread.map((msg) => (
        <ChatBubble key={msg.id} role={msg.role} scrollAnchor>
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
