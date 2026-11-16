/** Jitsi Meet — in-app video (default public server or self-hosted). */
export function getJitsiSupportConfig() {
  const server = (import.meta.env.VITE_JITSI_SERVER || 'https://meet.jit.si').replace(/\/$/, '')
  const room = (import.meta.env.VITE_JITSI_ROOM || 'liva-advisor-desk').trim()
  const lobby = import.meta.env.VITE_JITSI_LOBBY === 'true'
  const advisorName = (import.meta.env.VITE_JITSI_ADVISOR_NAME || '').trim() || 'LIVA advisor'

  return {
    server,
    room,
    lobby,
    advisorName,
    configured: Boolean(room),
  }
}

export function buildJitsiEmbedUrl({ server, room, displayName, lobby }) {
  const params = new URLSearchParams()
  params.set('userInfo.displayName', displayName)
  params.set('config.prejoinPageEnabled', 'true')
  params.set('config.startWithAudioMuted', 'false')
  params.set('config.startWithVideoMuted', 'false')
  params.set('config.disableDeepLinking', 'true')
  params.set('interfaceConfig.MOBILE_APP_PROMO', 'false')
  params.set('interfaceConfig.SHOW_JITSI_WATERMARK', 'false')
  params.set('interfaceConfig.SHOW_WATERMARK_FOR_GUESTS', 'false')
  if (lobby) {
    params.set('config.lobby.enabled', 'true')
  }

  const safeRoom = encodeURIComponent(room)
  return `${server}/${safeRoom}#${params.toString()}`
}