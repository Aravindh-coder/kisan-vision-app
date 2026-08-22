import express from 'express'
const router = express.Router()

router.post('/groq', async (req: any, res: any) => {
  try {
    const { messages, max_tokens } = req.body

    // Ensure no markdown formatting sneaks into responses, even if the
    // caller's system message doesn't specify it
    const formatRule = ' IMPORTANT: Respond in plain conversational text only. Do NOT use markdown formatting — no asterisks, no double asterisks, no hash headers, no pipe tables, no bullet symbols like - or *. Write in clear paragraphs and simple numbered lists using plain numbers like 1. 2. 3. only.'
    const safeMessages = Array.isArray(messages)
      ? messages.map((m: any) =>
          m.role === 'system' ? { ...m, content: (m.content || '') + formatRule } : m
        )
      : messages

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.GROQ_API_KEY },
      body: JSON.stringify({ model: 'openai/gpt-oss-120b', messages: safeMessages, max_tokens: max_tokens || 800, temperature: 0.7 })
    })
    const d = await r.json()
    res.json(d)
  } catch(e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
