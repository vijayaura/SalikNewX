import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import ChatBubble, { UserAction } from './components/ChatBubble'
import PlanSelector from './components/PlanSelector'
import AddonGrid from './components/AddonGrid'
import ConfirmDetailsCard from './components/ConfirmDetailsCard'
import DocumentUpload, { PolicyReady } from './components/DocumentUpload'
import { PLANS, VEHICLE } from './data'
import { findFaqAnswer, FAQ_SUGGESTIONS } from './data/faqs'
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
  const [vehicleValue, setVehicleValue] = useState(VEHICLE.value)
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const [policyStart, setPolicyStart] = useState(getTodayDate)
  const [processing, setProcessing] = useState(false)
  const [typing, setTyping] = useState(true)
  const [messages, setMessages] = useState([])
  const [userActions, setUserActions] = useState([])
  const [faqMessages, setFaqMessages] = useState([])
  const [faqTyping, setFaqTyping] = useState(false)
  const [supportLoading, setSupportLoading] = useState(false)
  const [supportVisible, setSupportVisible] = useState(false)
  const chatRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [stage, messages, userActions, faqMessages, faqTyping, supportLoading, supportVisible, scrollToBottom])

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
    if (stage !== 'plan') return
    setSelectedPlan(planId)
    const plan = PLANS.find((p) => p.id === planId)
    registerAction(COPY.user.plan(plan?.name))
    setStage('addons')
    setMessages((m) => (m.includes('addons') ? m : [...m, 'addons']))
  }

  const handleConfirmAddons = () => {
    registerAction(COPY.user.addons(selectedAddons.length))
    setStage('confirm')
    setMessages((m) => [...m, 'confirm'])
    setDetailsExpanded(false)
    setPolicyStart(getTodayDate())
  }

  const handleDownloadQuote = () => {
    const plan = PLANS.find((p) => p.id === selectedPlan)
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
    if (stage !== 'confirm') return
    setProcessing(true)
    await delay(1800)
    setProcessing(false)
    setStage('documents')
    setMessages((m) => [...m, 'docs'])
  }

  const handleVerify = async () => {
    registerAction(COPY.user.verify)
    setProcessing(true)
    await delay(2000)
    setProcessing(false)
    setStage('complete')
    setMessages((m) => [...m, 'policy'])
  }

  const toggleAddon = (id) => {
    if (stage !== 'addons') return
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

  const handleSupport = async () => {
    if (supportLoading) return
    setSupportLoading(true)
    setSupportVisible(false)
    scrollToBottom()
    await delay(700)
    setSupportLoading(false)
    setSupportVisible(true)
    scrollToBottom()
  }

  const handleFaqSend = async (query) => {
    const id = Date.now()
    setFaqMessages((prev) => [...prev, { id, role: 'user', text: query }])
    setFaqTyping(true)

    await delay(800)

    const answer = findFaqAnswer(query)
    setFaqTyping(false)
    setFaqMessages((prev) => [...prev, { id: id + 1, role: 'ai', text: answer }])
  }

  const planLocked = stage !== 'plan'
  const addonsLocked = stage !== 'addons'

  return (
    <MobileFrame>
      <div className="relative flex flex-col h-full min-h-0 bg-white">
        <div className="relative z-10 flex min-h-0 flex-1 flex-col pb-2">
      <Header onContactSupport={handleSupport} supportLoading={supportLoading} />

      <main ref={chatRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-8 pt-1">
        <div className="relative z-10 space-y-3 pb-6">
        <ChatBubble role="ai" delay={0}>
          {typing ? (
            <TypingDots />
          ) : (
            <>
              <IntroMessage value={vehicleValue} onValueChange={setVehicleValue} />
            </>
          )}
        </ChatBubble>

        <AnimatePresence>
          {messages.includes('plan') && (
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="ml-9">
                <PlanSelector
                  selectedPlan={selectedPlan}
                  onSelect={handlePlanSelect}
                  disabled={planLocked}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {messages.includes('addons') && (
            <motion.div key="addons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <UserAction delay={0}>{userActions[0]}</UserAction>
              <ChatBubble role="ai">
                <AddonsIntroMessage />
              </ChatBubble>
              <div className="ml-9">
                <AddonGrid
                  selectedAddons={selectedAddons}
                  onToggle={toggleAddon}
                  disabled={addonsLocked}
                  onContinue={stage === 'addons' ? handleConfirmAddons : undefined}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {messages.includes('confirm') && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
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
                  processing={processing && stage === 'confirm'}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {messages.includes('docs') && (
            <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <ChatBubble role="ai">
                <PaymentMessage />
              </ChatBubble>
              <div className="ml-9">
                <DocumentUpload
                  uploaded={stage === 'complete'}
                  uploading={processing && stage === 'documents'}
                  onVerify={stage === 'documents' ? handleVerify : undefined}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {messages.includes('policy') && (
            <motion.div key="policy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <UserAction delay={0}>{userActions[2] ?? COPY.user.verify}</UserAction>
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

        {faqMessages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role}>
            {msg.text}
          </ChatBubble>
        ))}

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
            >
              <SupportCallbackCard />
            </motion.div>
          )}
        </AnimatePresence>

        {faqTyping && (
          <ChatBubble role="ai">
            <TypingDots />
          </ChatBubble>
        )}

        </div>
      </main>

      <div className="relative shrink-0">
        <div
          className="pointer-events-none absolute bottom-full left-0 right-0 mb-1.5 flex justify-center z-0"
          aria-hidden
        >
          <PoweredByInster />
        </div>
        <ChatInput
        onSend={handleFaqSend}
        onSupport={handleSupport}
        disabled={faqTyping || supportLoading}
        suggestions={FAQ_SUGGESTIONS}
      />
      </div>
        </div>
      </div>
    </MobileFrame>
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
