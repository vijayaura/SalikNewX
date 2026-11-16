import PhoneShell from './PhoneShell'
import ChatExperience from '../ChatExperience'
import FigmaPrototypeEmbed from './FigmaPrototypeEmbed'
import JourneyEntryGate from './JourneyEntryGate'

const DEMO_LANES = [
  { title: 'Existing Journey', kind: 'figma' },
  { title: 'New Chat Based Journey', kind: 'chat' },
  { title: 'New UI Journey', kind: 'ui' },
]

export default function MobileFrame() {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-x-auto overflow-y-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-1/3 h-[520px] w-[520px] rounded-full bg-liva-orange/[0.09] blur-[110px]" />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-sky-500/[0.06] blur-[90px]" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-3 pb-2 pt-3 sm:px-5 sm:pt-4">
        <div className="flex min-h-0 w-full flex-1 items-stretch justify-center gap-6 px-1 sm:gap-8 xl:gap-10 min-[1500px]:max-w-[1240px] min-[1500px]:justify-between min-[1500px]:self-center">
          {DEMO_LANES.map((lane) => (
            <div
              key={lane.title}
              className="flex min-h-0 w-[min(100%,340px)] shrink-0 flex-col items-center gap-1.5 sm:w-[360px] min-[1500px]:min-w-0 min-[1500px]:flex-1 min-[1500px]:max-w-[380px]"
            >
              <h2 className="demo-lane-title w-full shrink-0 px-2">{lane.title}</h2>
              <PhoneShell compact fillRemaining className="w-full">
                <JourneyEntryGate>
                  {lane.kind === 'figma' ? (
                    <FigmaPrototypeEmbed title={lane.title} />
                  ) : (
                    <ChatExperience presentationMode={lane.kind} />
                  )}
                </JourneyEntryGate>
              </PhoneShell>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}