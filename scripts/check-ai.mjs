const HEALTH_URL = process.env.CHAT_HEALTH_URL || 'http://127.0.0.1:8080/api/chat/health'

async function main() {
  try {
    const res = await fetch(HEALTH_URL, {
      signal: AbortSignal.timeout(4000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()

    if (data.ok) {
      console.log(`✓ AI connected (${data.provider})`)
      console.log(`  Model: ${data.model}`)
      console.log('\nStart the app: npm run dev -- --port 8080')
      return
    }

    console.log('✗ Core42 not configured')
    console.log('\nAdd to .env:')
    console.log('  CORE42_API_KEY=your_key')
    console.log('  CORE42_BASE_URL=https://api.core42.ai/v1')
    console.log('  CORE42_MODEL=gpt-4.1')
    console.log('\nBuilt-in guided answers still work without AI.')
    process.exit(1)
  } catch {
    console.log('✗ Could not reach /api/chat/health')
    console.log('\nStart dev server first: npm run dev -- --port 8080')
    process.exit(1)
  }
}

main()