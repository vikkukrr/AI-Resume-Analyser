/**
 * AI Service — Google Gemini API (Free Tier)
 * Model: gemini-2.5-flash (free, 1M context, excellent JSON output)
 * Docs: https://ai.google.dev/gemini-api/docs
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.5-flash';

async function callGemini(prompt, systemInstruction = '', maxOutputTokens = 2048) {
  const fetch = (await import('node-fetch')).default;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables');

  const url = `${GEMINI_BASE}/${MODEL}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens,
      temperature: 0.4,
      responseMimeType: 'application/json',   // Gemini native JSON mode
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    // Log finish reason for debugging (e.g. SAFETY, MAX_TOKENS)
    const reason = data?.candidates?.[0]?.finishReason;
    throw new Error(`Gemini returned no text. finishReason: ${reason}`);
  }

  return text;
}

function safeParseJSON(raw) {
  // Strip any stray markdown fences Gemini might add despite JSON mode
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

/* ─── Resume Analysis ──────────────────────────────────────────────────── */
async function analyzeResume(resumeText, targetRole = '') {
  const system = `You are a senior ATS (Applicant Tracking System) expert and career coach with 15+ years of experience reviewing resumes. You respond ONLY with valid JSON matching the schema requested — no commentary outside the JSON object.`;

  const prompt = `Analyze this resume${targetRole ? ` for a "${targetRole}" role` : ''} and return a comprehensive ATS evaluation.

Resume Text:
"""
${resumeText.slice(0, 8000)}
"""

Return this EXACT JSON object (all fields required, numbers must be integers where specified):
{
  "atsScore": <integer 0-100>,
  "experienceLevel": "<Entry Level|Mid Level|Senior Level|Lead/Principal>",
  "estimatedYearsExperience": <number>,
  "detectedRoles": ["<role>"],
  "sections": {
    "contact":       { "score": <0-10>,  "maxScore": 10,  "feedback": "<text>", "suggestions": ["<text>"] },
    "summary":       { "score": <0-10>,  "maxScore": 10,  "feedback": "<text>", "suggestions": ["<text>"] },
    "experience":    { "score": <0-25>,  "maxScore": 25,  "feedback": "<text>", "suggestions": ["<text>"] },
    "education":     { "score": <0-15>,  "maxScore": 15,  "feedback": "<text>", "suggestions": ["<text>"] },
    "skills":        { "score": <0-20>,  "maxScore": 20,  "feedback": "<text>", "suggestions": ["<text>"] },
    "projects":      { "score": <0-10>,  "maxScore": 10,  "feedback": "<text>", "suggestions": ["<text>"] },
    "certifications":{ "score": <0-5>,   "maxScore": 5,   "feedback": "<text>", "suggestions": ["<text>"] },
    "formatting":    { "score": <0-5>,   "maxScore": 5,   "feedback": "<text>", "suggestions": ["<text>"] }
  },
  "detectedSkills":  ["<skill>"],
  "missingSkills":   ["<skill>"],
  "keywords":        ["<keyword>"],
  "strengths":       ["<strength>"],
  "weaknesses":      ["<weakness>"],
  "recommendations": ["<actionable recommendation>"],
  "overallSummary":  "<2-3 honest sentence summary>",
  "jobMatches": [
    { "title": "<title>", "company": "<company type>", "matchScore": <0-100>, "requiredSkills": ["<skill>"], "description": "<one line>", "salary": "<USD range>" }
  ],
  "careerRoadmap": {
    "currentLevel":      "<level>",
    "nextLevel":         "<level>",
    "timeToNextLevel":   "<estimate e.g. 6-12 months>",
    "nextSteps":         ["<specific action>"],
    "longTermGoals":     ["<goal>"],
    "recommendedCourses":[{ "name": "<name>", "platform": "<platform>", "url": "" }],
    "salaryRange":       { "current": "<USD range>", "next": "<USD range>" }
  }
}`;

  const raw = await callGemini(prompt, system, 4096);
  return safeParseJSON(raw);
}

/* ─── Interview Questions ──────────────────────────────────────────────── */
async function generateInterviewQuestions(targetRole, difficulty, resumeText = '') {
  const system = `You are a senior technical interviewer at a top-tier tech company. You create precise, role-relevant interview questions. Respond ONLY with valid JSON.`;

  const prompt = `Generate exactly 10 technical interview questions for a "${targetRole}" position at "${difficulty}" level.

${resumeText ? `Candidate Resume Context:\n"""\n${resumeText.slice(0, 3500)}\n"""` : ''}

Return this EXACT JSON:
{
  "questions": [
    {
      "question":       "<clear, specific, open-ended question>",
      "category":       "<DSA|System Design|Frontend|Backend|Database|DevOps|Behavioral|Language Specific|Problem Solving>",
      "difficulty":     "<easy|medium|hard>",
      "expectedTopics": ["<topic a good answer would cover>"]
    }
  ]
}

Rules:
- Mix: 3 conceptual, 3 practical/coding, 2 system-design, 2 behavioral
- Tailor specifically to ${targetRole}
- Calibrate to ${difficulty} level — be genuinely challenging
- No yes/no questions`;

  const raw = await callGemini(prompt, system, 2048);
  const parsed = safeParseJSON(raw);
  return Array.isArray(parsed.questions) ? parsed.questions : [];
}

/* ─── Answer Evaluation ────────────────────────────────────────────────── */
async function evaluateAnswer(question, userAnswer, targetRole, expectedTopics = []) {
  const system = `You are an expert technical interviewer evaluating a candidate's answer. Be honest, specific, and constructive. Respond ONLY with valid JSON.`;

  const prompt = `Evaluate this interview answer for a "${targetRole}" position.

Question: ${question}
Expected topics a good answer covers: ${expectedTopics.join(', ') || 'General understanding'}

Candidate Answer:
"""
${userAnswer || '(No answer provided — candidate skipped this question)'}
"""

Return this EXACT JSON:
{
  "score":              <integer 0-100>,
  "technicalAccuracy":  <integer 0-10>,
  "communication":      <integer 0-10>,
  "depth":              <integer 0-10>,
  "feedback":           "<2-3 sentence balanced feedback mentioning specific strengths and gaps>",
  "strengths":          ["<what they did well>"],
  "improvements":       ["<specific actionable improvement>"],
  "modelAnswer":        "<concise ideal answer that covers key points>"
}

Scoring guide: 90-100=Exceptional, 75-89=Strong, 60-74=Adequate, 40-59=Needs Work, 0-39=Poor`;

  const raw = await callGemini(prompt, system, 1024);
  return safeParseJSON(raw);
}

/* ─── Overall Interview Feedback ───────────────────────────────────────── */
async function generateOverallFeedback(questions, targetRole, totalScore) {
  const system = `You are a career coach providing post-interview feedback. Be encouraging yet honest. Respond ONLY with valid JSON.`;

  const answered = questions
    .filter(q => q.answered && !q.skipped)
    .map(q => ({ q: q.question.slice(0, 100), score: q.evaluation?.score || 0, category: q.category }));

  const prompt = `Generate overall interview feedback for a "${targetRole}" candidate.

Overall Score: ${totalScore}/100
Questions answered: ${answered.length} of ${questions.length}
Score breakdown by question: ${JSON.stringify(answered)}

Return this EXACT JSON:
{
  "summary":              "<3-4 sentence honest overall assessment>",
  "strengths":            ["<demonstrated strength>"],
  "areasToImprove":       ["<specific improvement area>"],
  "nextSteps":            ["<concrete next action step>"],
  "recommendedResources": ["<book, course, or platform>"],
  "readinessLevel":       "<Not Ready|Developing|Almost Ready|Interview Ready>"
}`;

  const raw = await callGemini(prompt, system, 800);
  return safeParseJSON(raw);
}

/* ─── Career Roadmap ───────────────────────────────────────────────────── */
async function generateCareerRoadmap(userProfile) {
  const system = `You are a strategic career advisor for tech professionals. Respond ONLY with valid JSON.`;

  const prompt = `Generate a detailed, actionable career roadmap for this tech professional.

Profile:
- Target Role: ${userProfile.targetRole || 'Software Developer'}
- Current Skills: ${(userProfile.skills || []).join(', ') || 'Not specified'}
- Avg Interview Score: ${userProfile.avgInterviewScore || 0}/100
- Best ATS Score: ${userProfile.bestAtsScore || 0}/100
- Interviews Completed: ${userProfile.interviewCount || 0}

Return this EXACT JSON:
{
  "roadmap": {
    "phase1": { "title": "0-3 months",  "goals": ["<goal>"], "actions": ["<action>"], "skills": ["<skill to learn>"] },
    "phase2": { "title": "3-6 months",  "goals": ["<goal>"], "actions": ["<action>"], "skills": ["<skill to learn>"] },
    "phase3": { "title": "6-12 months", "goals": ["<goal>"], "actions": ["<action>"], "skills": ["<skill to learn>"] },
    "phase4": { "title": "1-2 years",   "goals": ["<goal>"], "actions": ["<action>"], "skills": ["<skill to learn>"] }
  },
  "keyMilestones":              ["<milestone>"],
  "topPriority":                "<single most important thing to do right now>",
  "estimatedTimeToJobReady":    "<realistic estimate>",
  "salaryProjection": {
    "current":   "<USD range>",
    "in6months": "<USD range>",
    "in1year":   "<USD range>"
  }
}`;

  const raw = await callGemini(prompt, system, 1200);
  return safeParseJSON(raw);
}

module.exports = {
  analyzeResume,
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallFeedback,
  generateCareerRoadmap,
};
