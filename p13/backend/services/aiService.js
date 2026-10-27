const OpenAI = require('openai');

/**
 * Intelligent Local Fallback Engine for Graceful Degradation
 * Generates tailored, contextual suggestions when third-party AI services are offline,
 * unconfigured, or experiencing quota/network issues.
 */
function generateFallbackDetails(title, reason = 'Fallback mode activated') {
  const cleanTitle = (title || '').trim();
  const lower = cleanTitle.toLowerCase();

  let priority = 'medium';
  let estimatedDays = 3;
  let description = '';

  if (lower.includes('bug') || lower.includes('fix') || lower.includes('crash') || lower.includes('error')) {
    priority = 'high';
    estimatedDays = 1;
    description = `Investigate root cause for "${cleanTitle}". Replicate behavior in isolated test environment, inspect stack traces, apply necessary patch, and verify fix with unit tests.`;
  } else if (lower.includes('deploy') || lower.includes('docker') || lower.includes('ci') || lower.includes('pipeline') || lower.includes('release')) {
    priority = 'high';
    estimatedDays = 2;
    description = `Execute deployment pipeline for "${cleanTitle}". Verify environment variables, run automated regression tests, build production containers, and monitor health endpoints post-release.`;
  } else if (lower.includes('ui') || lower.includes('design') || lower.includes('css') || lower.includes('style') || lower.includes('theme') || lower.includes('navbar')) {
    priority = 'medium';
    estimatedDays = 2;
    description = `Refine user interface presentation for "${cleanTitle}". Align layout tokens, optimize contrast ratios, ensure responsive viewport behavior, and maintain component accessibility.`;
  } else if (lower.includes('auth') || lower.includes('login') || lower.includes('security') || lower.includes('jwt') || lower.includes('password')) {
    priority = 'high';
    estimatedDays = 2;
    description = `Implement and audit authentication workflows for "${cleanTitle}". Ensure token validation, secure HTTP-only cookies, prevent unauthorized access to protected routes, and sanitize user credentials.`;
  } else if (lower.includes('test') || lower.includes('jest') || lower.includes('qa')) {
    priority = 'medium';
    estimatedDays = 2;
    description = `Construct comprehensive automated test coverage for "${cleanTitle}". Author unit tests, mock external database/service dependencies, and assert status codes across boundary conditions.`;
  } else if (lower.includes('database') || lower.includes('mongo') || lower.includes('schema') || lower.includes('query') || lower.includes('cache')) {
    priority = 'medium';
    estimatedDays = 3;
    description = `Review data access patterns for "${cleanTitle}". Optimize indexing strategies, configure cache invalidation policies, and assert transactional schema consistency.`;
  } else {
    priority = 'medium';
    estimatedDays = 3;
    description = `Review requirements and technical specifications for "${cleanTitle}". Break down into deliverable milestones, implement core functionality, and verify deliverables.`;
  }

  return {
    success: true,
    title: cleanTitle,
    description,
    suggestedPriority: priority,
    estimatedDays,
    provider: 'local-fallback',
    fallback: true,
    fallbackReason: reason,
    disclaimer: 'AI-generated suggestion. Please review and edit before saving.'
  };
}

/**
 * Generate AI-assisted task details (Description, Priority, Estimation)
 * Supports OpenAI, Google Gemini, and automated Graceful Degradation.
 */
async function generateTaskDescription(title) {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('Task title is required to generate AI suggestion');
  }

  const cleanTitle = title.trim();
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Try OpenAI if valid format key is configured (starts with sk- and not placeholder)
  if (openAiKey && openAiKey.startsWith('sk-') && !openAiKey.includes('your_') && !openAiKey.startsWith('dummy')) {
    try {
      const client = new OpenAI({ apiKey: openAiKey });
      const prompt = `You are an agile software engineering assistant. Based on this task title: "${cleanTitle}", generate a concise task description (1-2 sentences), recommend a priority (low, medium, high), and estimated completion days (integer). Return strictly valid JSON: {"description": "...", "suggestedPriority": "...", "estimatedDays": 2}`;

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      });

      const rawContent = completion.choices[0]?.message?.content?.trim();
      let parsed = {};
      try {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch (parseErr) {
        parsed = { description: rawContent };
      }

      return {
        success: true,
        title: cleanTitle,
        description: parsed.description || rawContent || generateFallbackDetails(cleanTitle).description,
        suggestedPriority: ['low', 'medium', 'high'].includes(parsed.suggestedPriority?.toLowerCase())
          ? parsed.suggestedPriority.toLowerCase()
          : 'medium',
        estimatedDays: typeof parsed.estimatedDays === 'number' ? parsed.estimatedDays : 3,
        provider: 'openai-gpt-4o-mini',
        fallback: false,
        disclaimer: 'AI-generated suggestion. Please review and edit before saving.'
      };
    } catch (apiError) {
      console.warn(`[AI Service Notice] OpenAI call failed (${apiError.message}). Activating graceful degradation fallback.`);
      return generateFallbackDetails(cleanTitle, `OpenAI API unavailable: ${apiError.message}`);
    }
  }

  // 2. Try Google Gemini if configured with a real key
  if (geminiKey && !geminiKey.includes('your_') && !geminiKey.startsWith('dummy') && geminiKey.length > 20) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a concise 1-2 sentence description and priority (low, medium, high) for a task titled "${cleanTitle}". Respond in JSON format: {"description": "...", "suggestedPriority": "..."}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      let parsed = {};
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch {
        parsed = { description: text };
      }

      return {
        success: true,
        title: cleanTitle,
        description: parsed.description || text || generateFallbackDetails(cleanTitle).description,
        suggestedPriority: parsed.suggestedPriority || 'medium',
        estimatedDays: 3,
        provider: 'google-gemini-1.5-flash',
        fallback: false,
        disclaimer: 'AI-generated suggestion. Please review and edit before saving.'
      };
    } catch (geminiError) {
      console.warn(`[AI Service Notice] Gemini API call failed (${geminiError.message}). Activating graceful fallback.`);
      return generateFallbackDetails(cleanTitle, `Gemini API unavailable: ${geminiError.message}`);
    }
  }

  // 3. Graceful Fallback Mode (Default when no external credentials provided)
  return generateFallbackDetails(cleanTitle, 'No active external AI API key in .env. Contextual fallback engine engaged.');
}

module.exports = {
  generateTaskDescription,
  generateFallbackDetails
};
