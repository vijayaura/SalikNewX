/** Microsoft Teams — advisor call / meeting (set in Vercel env). */
export function getTeamsSupportConfig() {
  const meetingUrl = (import.meta.env.VITE_TEAMS_MEETING_URL || '').trim()
  const contactEmail = (import.meta.env.VITE_TEAMS_CONTACT_EMAIL || '').trim()
  const contactName = (import.meta.env.VITE_TEAMS_CONTACT_NAME || '').trim() || 'Insurance advisor'
  const contactTitle =
    (import.meta.env.VITE_TEAMS_CONTACT_TITLE || '').trim() || 'LIVA customer care'

  const callUrl = contactEmail
    ? `https://teams.microsoft.com/l/call/0/0?users=${encodeURIComponent(contactEmail)}&withVideo=true`
    : ''

  /** Prefer a meeting link; else 1:1 call (opens in browser — Teams blocks iframe embed). */
  const joinUrl = meetingUrl || callUrl
  const configured = Boolean(joinUrl)

  return {
    meetingUrl,
    contactEmail,
    contactName,
    contactTitle,
    callUrl,
    joinUrl,
    configured,
  }
}