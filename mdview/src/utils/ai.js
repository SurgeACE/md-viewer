/**
 * AI Refine utility — Google Gemini integration
 * Refines markdown content for better AI prompting / instruction clarity
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const REFINE_MODES = {
  clarity: {
    label: 'Improve Clarity',
    icon: '✨',
    prompt: `You are an expert technical writer specializing in AI prompts and instruction documents.
Refine the following markdown to be clearer, more precise, and unambiguous.
- Fix vague language → specific, actionable instructions
- Ensure each rule/instruction is self-contained and testable
- Maintain the original intent and meaning
- Keep markdown formatting intact
- Do NOT add explanations outside the refined content

Return ONLY the refined markdown content, no commentary.`,
  },
  grammar: {
    label: 'Fix Grammar & Structure',
    icon: '📝',
    prompt: `You are a markdown formatting expert.
Fix grammar, spelling, punctuation, and structural issues in the following markdown.
- Correct heading hierarchy (h1 → h2 → h3)
- Fix list formatting and indentation
- Ensure consistent style (bullet types, spacing)
- Fix broken links or code block syntax
- Maintain the original content and meaning

Return ONLY the corrected markdown, no commentary.`,
  },
  concise: {
    label: 'Make Concise',
    icon: '✂️',
    prompt: `You are a ruthless editor who values brevity.
Make the following markdown more concise while preserving ALL meaning and intent.
- Remove redundant words, phrases, and sentences
- Combine related points where possible
- Use shorter, punchier language
- Keep all technical details and specifics
- Maintain markdown formatting

Return ONLY the concise markdown, no commentary.`,
  },
  expand: {
    label: 'Expand Detail',
    icon: '📖',
    prompt: `You are a thorough technical writer.
Expand the following markdown with more detail, examples, and clarity.
- Add concrete examples where instructions are abstract
- Explain edge cases or potential gotchas
- Add helpful sub-points under broad instructions
- Include code examples if relevant
- Maintain markdown formatting and original structure

Return ONLY the expanded markdown, no commentary.`,
  },
  promptify: {
    label: 'Convert to Prompt',
    icon: '🤖',
    prompt: `You are an expert prompt engineer.
Convert/restructure the following markdown into a well-structured AI prompt or instruction set.
- Use clear section headers (## Role, ## Rules, ## Constraints, ## Examples, etc.)
- Convert vague descriptions into specific behavioral instructions
- Add XML-style tags where helpful (<rules>, <examples>, etc.)
- Use imperative voice ("Do X", "Never Y", "Always Z")
- Include edge case handling
- Make instructions testable and unambiguous
- Maintain all original intent

Return ONLY the restructured markdown prompt, no commentary.`,
  },
}

/**
 * Call Gemini API to refine content
 * @param {string} content - markdown content to refine
 * @param {string} mode - refine mode key from REFINE_MODES
 * @param {string} apiKey - Gemini API key
 * @param {string} [customInstruction] - custom refine instruction (for 'custom' mode)
 * @returns {Promise<string>} refined markdown
 */
export async function refineContent(content, mode, apiKey, customInstruction = '') {
  if (!apiKey) throw new Error('API key required. Set your Gemini API key in Settings.')
  if (!content.trim()) throw new Error('No content to refine.')

  let systemPrompt
  if (mode === 'custom' && customInstruction) {
    systemPrompt = `You are an expert markdown editor. Follow the user's instruction to modify the markdown content below.
Instruction: ${customInstruction}

Return ONLY the modified markdown content, no commentary or explanation.`
  } else {
    const modeConfig = REFINE_MODES[mode]
    if (!modeConfig) throw new Error(`Unknown refine mode: ${mode}`)
    systemPrompt = modeConfig.prompt
  }

  const url = `${GEMINI_API_URL}?key=${apiKey}`

  const body = {
    contents: [
      {
        parts: [
          { text: `${systemPrompt}\n\n---\n\nMARKDOWN CONTENT TO REFINE:\n\n${content}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
    }
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const err = await resp.text()
    if (resp.status === 400 && err.includes('API_KEY')) {
      throw new Error('Invalid API key. Check your Gemini API key in Settings.')
    }
    throw new Error(`Gemini API error (${resp.status}): ${err.slice(0, 200)}`)
  }

  const data = await resp.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini API')

  // Strip markdown code fences if the model wrapped it
  return text.replace(/^```(?:markdown|md)?\n/, '').replace(/\n```$/, '').trim()
}

export { REFINE_MODES }
