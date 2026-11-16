import { useEffect, useRef, useState } from 'react'

/** Quote_details_page / mobile frames in Figma file (430 × 934). */
const FIGMA_FRAME_WIDTH = 430
const FIGMA_FRAME_HEIGHT = 934

/** 1 = flush to frame edges; raise slightly (e.g. 1.02) only if the proto clips on the right. */
const WIDTH_FIT_FACTOR = 1

const EXISTING_JOURNEY_PROTO =
  'https://www.figma.com/proto/gVkiWx9NIrJ3lAlZr6a5dN/Loading...?node-id=24-712&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=24%3A712'

function buildFigmaEmbedUrl(protoUrl) {
  return `https://www.figma.com/embed?embed_host=share&hide-ui=1&url=${encodeURIComponent(protoUrl)}`
}

export default function FigmaPrototypeEmbed({
  protoUrl = EXISTING_JOURNEY_PROTO,
  title = 'Existing journey prototype',
  frameWidth = FIGMA_FRAME_WIDTH,
  frameHeight = FIGMA_FRAME_HEIGHT,
  widthFitFactor = WIDTH_FIT_FACTOR,
}) {
  const containerRef = useRef(null)
  const [fit, setFit] = useState({ scale: 1, frameHeight: frameHeight })

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const measure = () => {
      const width = node.clientWidth
      const height = node.clientHeight
      if (width <= 0 || height <= 0) return

      const scale = width / (frameWidth * widthFitFactor)
      setFit({ scale, frameHeight: height / scale })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    return () => ro.disconnect()
  }, [frameWidth, frameHeight, widthFitFactor])

  const embedUrl = buildFigmaEmbedUrl(protoUrl)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white pt-8">
      <div ref={containerRef} className="relative min-h-0 w-full flex-1 overflow-hidden bg-white">
        <div
          className="absolute left-0 top-0"
          style={{
            width: frameWidth,
            height: fit.frameHeight,
            transform: `scale(${fit.scale})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            title={title}
            src={embedUrl}
            width={frameWidth}
            height={Math.round(fit.frameHeight)}
            className="block border-0 bg-white"
            style={{ width: frameWidth, height: fit.frameHeight }}
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}