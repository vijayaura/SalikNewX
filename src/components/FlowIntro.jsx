const FLOW_POINTS = [
  {
    title: 'One continuous chat thread',
    description:
      'The full journey — verify, quote, pay, upload, and download — stays in a single conversation.',
  },
  {
    title: 'Steps reveal as you go',
    description:
      'Plans, add-ons, and confirmation appear only when needed, so the screen never feels crowded.',
  },
  {
    title: 'Edit where you decide',
    description:
      'Vehicle value, policy dates, and personal details adjust inline at the moment they matter.',
  },
  {
    title: 'Help without breaking flow',
    description:
      'FAQ chips and one-tap support sit at the bottom — answers and callbacks without leaving the chat.',
  },
]

export default function FlowIntro() {
  return (
    <div className="max-w-lg px-8 xl:px-14">
      <p className="text-liva-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3">
        Prototype demo
      </p>
      <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight mb-4">Salik NewX</h1>
      <p className="text-base text-white/60 leading-relaxed mb-10 max-w-md">
        An AI-guided insurance renewal flow — designed to show how a complex purchase can feel like
        a simple chat.
      </p>

      <ul className="space-y-5">
        {FLOW_POINTS.map((point, index) => (
          <li key={point.title} className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-liva-orange/15 border border-liva-orange/30 flex items-center justify-center text-sm font-bold text-liva-orange tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-white mb-0.5">{point.title}</p>
              <p className="text-sm text-white/55 leading-relaxed">{point.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
