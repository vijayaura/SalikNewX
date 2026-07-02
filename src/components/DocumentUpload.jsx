import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, CheckCircle2, Download, Upload } from 'lucide-react'
import { InlineButton } from './ChatBubble'
import { COPY } from '../copy'

const DOCS = [
  { id: 'emirates-id', name: 'Emirates ID' },
  { id: 'driving-license', name: 'Driving License' },
]

export default function DocumentUpload({ uploaded, uploading, onVerify }) {
  const [docProgress, setDocProgress] = useState({})

  const simulateUpload = (docId) => {
    if (docProgress[docId] === 100) return
    setDocProgress((prev) => ({ ...prev, [docId]: 30 }))
    setTimeout(() => setDocProgress((prev) => ({ ...prev, [docId]: 70 })), 400)
    setTimeout(() => setDocProgress((prev) => ({ ...prev, [docId]: 100 })), 900)
  }

  const getProgress = (docId) => {
    if (uploaded) return 100
    if (uploading && docProgress[docId] === undefined) return 100
    return docProgress[docId] ?? 0
  }

  return (
    <div className="space-y-2 mt-1">
      {DOCS.map((doc, i) => {
        const progress = getProgress(doc.id)
        const done = progress === 100

        return (
          <div
            key={doc.id}
            className={`rounded-xl border border-gray-200 overflow-hidden px-3 py-2.5 shadow-soft ${
              i % 2 === 0 ? 'texture-card-muted' : 'texture-card'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-gray-900 min-w-0 truncate">
                {doc.name}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                {!done && !uploading && (
                  <>
                    <DocActionButton
                      icon={Upload}
                      label="Upload"
                      onClick={() => simulateUpload(doc.id)}
                    />
                    <DocActionButton
                      icon={Camera}
                      label="Camera"
                      onClick={() => simulateUpload(doc.id)}
                    />
                  </>
                )}

                {done && !uploading && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-label="Uploaded" />
                )}
              </div>
            </div>

            {progress > 0 && progress < 100 && (
              <div className="h-1 rounded-full bg-gray-200 overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-liva-orange rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        )
      })}

      {onVerify && !uploading && !uploaded && (
        <InlineButton
          onClick={onVerify}
          disabled={!DOCS.every((doc) => docProgress[doc.id] === 100)}
        >
          {COPY.buttons.verify}
        </InlineButton>
      )}
    </div>
  )
}

function DocActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-liva-orange/40 hover:text-liva-orange active:scale-[0.98]"
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
    </button>
  )
}

export function PolicyReady({ onDownload }) {
  return (
    <div className="card p-3 mt-1 text-center">
      <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2" />
      <h2 className="text-sm font-bold text-gray-900 mb-0.5">{COPY.cards.policyReady}</h2>
      <p className="text-xs text-gray-500 mb-3">{COPY.cards.policySub}</p>
      <button
        type="button"
        onClick={onDownload}
        className="w-full py-2.5 rounded-lg bg-liva-orange text-white text-xs font-semibold flex items-center justify-center gap-1.5"
      >
        <Download className="w-4 h-4" />
        Download policy
      </button>
    </div>
  )
}
