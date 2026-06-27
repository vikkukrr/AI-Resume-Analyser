const API_KEY = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
const MODEL = 'google/gemini-2.5-flash-001';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callGemini(prompt, systemInstruction, maxOutputTokens) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      'HTTP-Referer': 'https://careerai.app',
      'X-Title': 'CareerAI',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxOutputTokens,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${errBody}`);
  }
  const data = await res.json();
  const raw = data.choices[0].message.content;
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

async function analyzeResume(resumeText, targetRole) {
  const systemInstruction =
    'You are a senior ATS (Applicant Tracking System) expert and career coach. Analyze this resume and return detailed JSON analysis.';
  const prompt = `Analyze the following resume${
    targetRole ? ` for the target role of "${targetRole}"` : ''
  } and return a JSON object with this exact structure:
{
  "atsScore": <number 0-100>,
  "experienceLevel": "<string>",
  "estimatedYearsExperience": <number>,
  "detectedRoles": ["<string>"],
  "sections": {
    "contact": { "score": <number>, "maxScore": <number>, "feedback": "<string>", "suggestions": ["<string>"] },
    "summary": { "score": <number>, "maxScore": <number>, "feedback": "<string>", "suggestions": ["<string>"] },
    "experience": { "score": <number>, "maxScore": <number>, "feedback": "<string>", "suggestions": ["<string>"] },
    "education": { "score": <number>, "maxScore": <number>, "feedback": "<string>", "suggestions": ["<string>"] },
    "skills": { "score": <number>, "maxScore": <number>, "feedback": "<string>", "suggestions": ["<string>"] },
    "projects": { "score": <number>, "maxScore": <number>, "feedback": "<string>", "suggestions": ["<string>"] },
    "certifications": { "score": <number>, "maxScore": <number>, "feedback": "<string>", "suggestions": ["<string>"] },
    "formatting": { "score": <number>, "maxScore": <number>, "feedback": "<string>", "suggestions": ["<string>"] }
  },
  "detectedSkills": ["<string>"],
  "missingSkills": ["<string>"],
  "keywords": ["<string>"],
  "strengths": ["<string>"],
  "weaknesses": ["<string>"],
  "recommendations": ["<string>"],
  "overallSummary": "<string>",
  "jobMatches": [{ "title": "<string>", "company": "<string>", "matchScore": <number>, "requiredSkills": ["<string>"], "description": "<string>", "salary": "<string>" }],
  "careerRoadmap": {
    "currentLevel": "<string>",
    "nextLevel": "<string>",
    "timeToNextLevel": "<string>",
    "nextSteps": ["<string>"],
    "longTermGoals": ["<string>"],
    "recommendedCourses": [{ "name": "<string>", "platform": "<string>", "url": "<string>" }],
    "salaryRange": { "current": "<string>", "next": "<string>" }
  }
}

Resume text:
${resumeText}`;
  return callGemini(prompt, systemInstruction, 4096);
}

async function generateInterviewQuestions(targetRole, difficulty, resumeText) {
  const systemInstruction =
    'You are a senior technical interviewer. Generate interview questions based on the candidate profile and return ONLY valid JSON.';
  const prompt = `Generate exactly 10 interview questions for a "${targetRole}" position at "${difficulty}" level.
Mix: 3 conceptual questions, 3 practical/coding questions, 2 system design questions, 2 behavioral questions.
Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "<string>",
      "category": "<conceptual|practical|system_design|behavioral>",
      "difficulty": "<easy|medium|hard>",
      "expectedTopics": ["<string>"]
    }
  ]
}

Candidate resume context:
${resumeText || 'No resume provided'}`;
  return callGemini(prompt, systemInstruction, 2048);
}

async function evaluateAnswer(question, userAnswer, targetRole, expectedTopics) {
  const systemInstruction =
    'You are a senior technical interviewer evaluating a candidate answer. Return ONLY valid JSON.';
  const prompt = `Evaluate this interview answer for a "${targetRole}" position.

Question: "${question}"

Expected topics: ${JSON.stringify(expectedTopics)}

Candidate's answer: "${userAnswer}"

Return a JSON object with this exact structure:
{
  "score": <number 0-10>,
  "technicalAccuracy": <number 0-10>,
  "communication": <number 0-10>,
  "depth": <number 0-10>,
  "feedback": "<string>",
  "strengths": ["<string>"],
  "improvements": ["<string>"],
  "modelAnswer": "<string>"
}`;
  return callGemini(prompt, systemInstruction, 1024);
}

async function generateOverallFeedback(questions, targetRole, totalScore) {
  const systemInstruction =
    'You are a career coach providing comprehensive interview feedback. Return ONLY valid JSON.';
  const prompt = `Generate overall interview feedback for a "${targetRole}" position.

Questions and evaluations:
${JSON.stringify(questions, null, 2)}

Total score: ${totalScore}

Return a JSON object with this exact structure:
{
  "summary": "<string>",
  "strengths": ["<string>"],
  "areasToImprove": ["<string>"],
  "nextSteps": ["<string>"],
  "recommendedResources": [{ "name": "<string>", "url": "<string>" }],
  "readinessLevel": "<string>"
}`;
  return callGemini(prompt, systemInstruction, 800);
}

async function generateCareerRoadmap(userProfile) {
  const systemInstruction =
    'You are a senior career advisor creating personalized career roadmaps. Return ONLY valid JSON.';
  const prompt = `Create a career roadmap for the following professional:

${JSON.stringify(userProfile, null, 2)}

Return a JSON object with this exact structure:
{
  "roadmap": {
    "phase1": { "title": "<string>", "goals": ["<string>"], "actions": ["<string>"], "skills": ["<string>"] },
    "phase2": { "title": "<string>", "goals": ["<string>"], "actions": ["<string>"], "skills": ["<string>"] },
    "phase3": { "title": "<string>", "goals": ["<string>"], "actions": ["<string>"], "skills": ["<string>"] },
    "phase4": { "title": "<string>", "goals": ["<string>"], "actions": ["<string>"], "skills": ["<string>"] }
  },
  "keyMilestones": ["<string>"],
  "topPriority": "<string>",
  "estimatedTimeToJobReady": "<string>",
  "salaryProjection": { "current": "<string>", "in6months": "<string>", "in1year": "<string>" }
}`;
  return callGemini(prompt, systemInstruction, 1200);
}

module.exports = {
  analyzeResume,
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallFeedback,
  generateCareerRoadmap,
};
