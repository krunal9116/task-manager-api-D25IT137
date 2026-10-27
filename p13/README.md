# Practical 13: External AI Service Integration into a Web Application

[![Node.js Version](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![AI Services](https://img.shields.io/badge/AI%20Providers-OpenAI%20%7C%20Google%20Gemini-412991?logo=openai&logoColor=white)](https://platform.openai.com/)
[![Architecture](https://img.shields.io/badge/Resilience-Graceful%20Degradation-success)](#)
[![Responsible AI](https://img.shields.io/badge/Responsible%20AI-Privacy%20%26%20Governance-blue)](#)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**Student ID:** D25IT137  
**Course:** Advanced Web Development Frameworks (ITUE301)  
**Department:** Information Technology, Faculty of Technology & Engineering, CHARUSAT  

---

## 1. Problem Definition & Objectives

The primary objective of Practical 13 is to integrate an external **Generative AI Service (OpenAI / Google Gemini)** into the existing Task Management web application while enforcing **Strict Security Protocols**, **Graceful Degradation**, and **Responsible AI Governance**.

### Specific Deliverables:
1. **Secure Backend AI Gateway**: Dedicated server-side route `POST /api/ai/generate-description` invoking OpenAI (`gpt-4o-mini`) or Google Gemini (`gemini-1.5-flash`).
2. **Key Isolation**: AI API credentials stored exclusively in backend `.env`, completely isolated from client bundles and never exposed via browser network traffic.
3. **Graceful Degradation & Fallback Engine**: If the third-party AI service times out, experiences rate limiting, or has an invalid/missing API key, the application automatically catches the error and generates contextual fallback suggestions without crashing or interrupting task workflows.
4. **Interactive React UI Integration**: "✨ AI Suggest" button with loading spinners, rate-limiting cooldown timers, editable suggestion fields, and clear AI content disclaimers.
5. **Rate Limiting Protection**: Backend request throttling (max 10 requests/minute/IP) and frontend client debouncing (30s cooldown) to prevent quota exhaustion and accidental spamming.

---

## 2. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│                   React 18 Frontend                    │
├────────────────────────────────────────────────────────┤
│ 1. User enters Task Title: "Fix JWT authentication bug" │
│ 2. Clicks "✨ AI Suggest" button (sets loading spinner) │
│ 3. Dispatches POST to backend API (No API key on UI)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ POST /api/ai/generate-description
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Express.js Backend                     │
├────────────────────────────────────────────────────────┤
│ 1. Rate Limiter Middleware: validates request quota    │
│ 2. Title Sanitization & Validation                     │
│ 3. Read API Credentials from process.env (.env file)   │
└───────────────────────────┬────────────────────────────┘
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
    [Valid Key Present]           [No Key / Invalid / Outage]
             │                             │
    ┌────────▼─────────┐          ┌────────▼────────────────┐
    │ External AI Call │          │ Contextual Fallback     │
    │ OpenAI / Gemini  │          │ Engine                  │
    └────────┬─────────┘          └────────┬────────────────┘
             │                             │
             ├──────── (On Error / 401) ───┘
             ▼
┌────────────────────────────────────────────────────────┐
│                   Structured Response                  │
├────────────────────────────────────────────────────────┤
│ {                                                      │
│   "description": "Investigate root cause in auth...",   │
│   "suggestedPriority": "high",                         │
│   "fallback": true / false,                            │
│   "disclaimer": "AI-generated suggestion. Review..."   │
│ }                                                      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   React 18 Frontend                    │
├────────────────────────────────────────────────────────┤
│ 1. Populates Description textarea as editable text     │
│ 2. Sets recommended Priority ("high")                  │
│ 3. Displays AI Disclaimer banner & provider badge      │
│ 4. Starts 30s cooldown timer to enforce rate limits    │
└────────────────────────────────────────────────────────┘
```

---

## 3. Security & Key Management Best Practices

1. **Strict Server-Side Key Containment:** The AI API key is read solely by the Node.js backend using `process.env.OPENAI_API_KEY`. It is never bundled into client JavaScript or accessible via browser DevTools.
2. **Git Hygiene via `.gitignore`:** `.env` is explicitly declared in `.gitignore`. Only `.env.example` with placeholder values is committed to version control.
3. **Defense Against Scraping:** Frontend only communicates with `/api/ai/generate-description`, hiding the upstream AI provider endpoint, models, and prompts.

---

## 4. Graceful Degradation Implementation

When third-party APIs fail due to quota exhaustion, bad credentials, or network partition, the application must not crash (`res.status(200).json({ description: '...', fallback: true })`).

```javascript
// p13/backend/services/aiService.js
async function generateTaskDescription(title) {
  const openAiKey = process.env.OPENAI_API_KEY;

  if (openAiKey && openAiKey.startsWith('sk-')) {
    try {
      const client = new OpenAI({ apiKey: openAiKey });
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: `Suggest task description for: ${title}` }]
      });
      return {
        description: completion.choices[0].message.content,
        fallback: false
      };
    } catch (err) {
      console.warn(`[AI Service Notice] External call failed (${err.message}). Engaging fallback.`);
      return generateFallbackDetails(title, err.message);
    }
  }

  // Automated Graceful Degradation Fallback
  return generateFallbackDetails(title, 'No external AI key configured');
}
```

---

## 5. Responsible AI Considerations & Data Privacy

1. **User In The Loop (Editable Suggestions):** AI output is placed into an editable form field rather than directly saved into the database, preserving user agency.
2. **Transparent AI Disclaimers:** UI displays a prominent banner noting:  
   `"✨ AI-generated suggestion. Please review and edit before saving."`
3. **Data Privacy Guardrails:** Sensitive Personally Identifiable Information (PII) such as passwords, banking info, and confidential credentials must never be passed to external model providers.
4. **Environmental & Financial Governance:** Rate limiting (10 req/min/IP) prevents accidental runaway billing and unnecessary compute consumption.

---

## 6. Key Questions & In-Depth Analysis

### Question 1: Why must the AI API key be called from the backend rather than directly from the React frontend?
- **Vulnerability of Client Code:** Code running in a web browser is completely inspectable by end-users. Any API key embedded in React code or environment variables (e.g., `VITE_OPENAI_KEY`) can be extracted from bundle files or captured via the browser Network tab.
- **Financial & Abuse Risks:** A leaked key allows unauthorized third parties to drain prepaid credits, violate terms of service, and spam external APIs under the account owner's billing identity.
- **Backend as Security Gate:** By routing through Express, the backend acts as an authenticated security barrier, enforcing authentication, request sanitization, and rate limiting before invoking external models.

### Question 2: What does 'graceful degradation' mean in this context, and why does it matter for a feature that depends on a third-party service outside your control?
- **Definition:** Graceful degradation is a software resilience architectural pattern where an application continues to operate with limited or alternative functionality when a dependency fails, rather than crashing or presenting fatal error screens.
- **Importance for Third-Party AI:** External AI services are prone to latency spikes, downtime, rate limits (HTTP 429), and quota exhaustion. If task creation relied synchronously on an external AI response, a 503 outage at OpenAI would completely paralyze the core Task Management application.
- **Implementation:** By catching errors and activating the local contextual fallback engine, users can still create tasks without interruption.

### Question 3: What are the privacy and governance implications of sending task data to an external AI API, and what kind of data should never be sent this way?
- **Data Retention & Model Training:** External AI providers may log prompt text for safety review or model fine-tuning unless enterprise zero-data-retention agreements are active.
- **Prohibited Data Categories:**
  - Passwords, cryptographic keys, and JWT tokens.
  - Personally Identifiable Information (PII) such as social security numbers, medical records, and credit card numbers.
  - Proprietary trade secrets, source code vulnerabilities, and privileged enterprise communications.
- **Governance Best Practices:** Implement input sanitization to strip PII, maintain audit logs of AI requests, and obtain explicit user consent.

---

## 7. How to Run Locally

### 1. Backend Setup:
```bash
cd p13/backend
npm install
cp .env.example .env
npm start
```

### 2. Frontend Setup:
```bash
cd p13/frontend
npm install
npm run dev
```

### 3. Run Automated Tests:
```bash
cd p13/backend
npm test
```
