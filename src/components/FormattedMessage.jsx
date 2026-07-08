/** Lightweight markdown renderer for AI chat — bold, italic, bullets, paragraphs. */

function parseInline(text, keyPrefix = '') {
  const nodes = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g
  let lastIndex = 0
  let match
  let i = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    const key = `${keyPrefix}-${i++}`

    if (token.startsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold text-gray-900">
          {token.slice(2, -2)}
        </strong>,
      )
    } else {
      nodes.push(
        <em key={key} className="italic text-gray-700">
          {token.slice(1, -1)}
        </em>,
      )
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length ? nodes : [text]
}

function isBulletLine(line) {
  return /^[-•]\s+/.test(line.trim())
}

function stripBullet(line) {
  return line.trim().replace(/^[-•]\s+/, '')
}

export default function FormattedMessage({ text, className = '' }) {
  if (!text) return null

  const blocks = []
  let bulletGroup = []
  let blockIndex = 0

  const flushBullets = () => {
    if (bulletGroup.length === 0) return
    blocks.push(
      <ul key={`ul-${blockIndex++}`} className="space-y-2 my-2.5 list-none">
        {bulletGroup.map((line, idx) => (
          <li key={idx} className="flex gap-2 items-start">
            <span className="mt-[7px] shrink-0 w-1.5 h-1.5 rounded-full bg-liva-orange/70" aria-hidden />
            <span className="flex-1 min-w-0">{parseInline(line, `li-${idx}`)}</span>
          </li>
        ))}
      </ul>,
    )
    bulletGroup = []
  }

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trimEnd()

    if (!line.trim()) {
      flushBullets()
      continue
    }

    if (isBulletLine(line)) {
      bulletGroup.push(stripBullet(line))
      continue
    }

    flushBullets()
    blocks.push(
      <p key={`p-${blockIndex++}`} className={blocks.length > 0 ? 'mt-2.5' : ''}>
        {parseInline(line, `p-${blockIndex}`)}
      </p>,
    )
  }

  flushBullets()

  return <div className={`chat-formatted leading-relaxed ${className}`.trim()}>{blocks}</div>
}
