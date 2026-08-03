import { useSearchParams } from 'react-router-dom'
import ChatExperience from '../ChatExperience'
import EmbedLayout from '../layouts/EmbedLayout'

/** Embeddable chat — /chat or /chat?embed=1 for iframes */
export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const embedHost = searchParams.get('embed') === '1'

  return (
    <EmbedLayout>
      <ChatExperience embedHost={embedHost} />
    </EmbedLayout>
  )
}
