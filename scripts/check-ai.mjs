const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
const MODEL = process.env.VITE_OLLAMA_MODEL || 'llama3.2'

async function main() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const { models = [] } = await res.json()
    const names = models.map((m) => m.name)
    const hasModel = names.some((n) => n === MODEL || n.startsWith(`${MODEL}:`))

    console.log('✓ Ollama is running')
    console.log(`  Models: ${names.join(', ') || '(none)'}`)

    if (!hasModel) {
      console.log(`\n⚠ Model "${MODEL}" not found. Run: ollama pull ${MODEL}`)
      process.exit(1)
    }

    console.log(`✓ Model "${MODEL}" is available`)
    console.log('\nStart the app: npm run dev')
  } catch {
    console.log('✗ Ollama is not running')
    console.log('\nInstall: https://ollama.com/download')
    console.log(`Then:   ollama pull ${MODEL}`)
    console.log('        npm run dev')
    console.log('\nChat still works via built-in smart answers without Ollama.')
    process.exit(1)
  }
}

main()
