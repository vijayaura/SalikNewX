const AI_API_URL = process.env.AI_API_URL || 'http://127.0.0.1:8080/api/ai'

async function main() {
  try {
    const res = await fetch(`${AI_API_URL}/health`, {
      signal: AbortSignal.timeout(4000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()

    if (data.ok) {
      console.log(`✓ AI connected (${data.label || data.provider})`)
      console.log(`  Model: ${data.model}`)
      console.log('\nStart the app: npm run dev -- --port 8080')
      return
    }

    console.log('✗ No AI provider configured')
    console.log('\nEasiest option — free Groq (open Llama models):')
    console.log('  1. Sign up: https://console.groq.com')
    console.log('  2. Create API key → add to .env as GROQ_API_KEY=...')
    console.log('  3. npm run dev')
    console.log('\nOr install Ollama locally: https://ollama.com')
    console.log('\nBuilt-in smart answers still work without AI.')
    process.exit(1)
  } catch {
    console.log('✗ Could not reach AI proxy')
    console.log('\nStart dev server first: npm run dev -- --port 8080')
    process.exit(1)
  }
}

main()
