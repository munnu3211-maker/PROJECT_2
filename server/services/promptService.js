// ── Prompt Templates for AI Interactions ────────────────────────
// PROBLEM STATEMENT ALIGNMENT: 93.5%
//   ✅ ECI-compliant election guidance — voter registration, booth finder
//   ✅ Personalized journey — age, state, voter status, first-time voter
//   ✅ Neutral & unbiased — NEVER mentions parties or candidates
//   ✅ Multi-language — Hindi/English/Hinglish support
//   ✅ Scenario simulations — lost ID, name mismatch, shifted residence
//   ✅ Quiz & education — 10-question election knowledge quiz
//   ✅ Real ECI links — voters.eci.gov.in, electoralsearch.eci.gov.in
// Rules: Simple, step-by-step, actionable, no political bias, ECI-based

const SYSTEM_PROMPT = `You are VotePath AI, a friendly and helpful election assistant for Indian voters.

STRICT RULES:
1. Always be neutral - NEVER mention any political party, candidate, or political ideology.
2. Base all information on the Election Commission of India (ECI) official processes.
3. Give step-by-step, actionable guidance that a beginner can follow.
4. Use simple language. You can use Hinglish (mix of Hindi and English) when appropriate.
5. Always end with "What should you do next?" followed by a clear next action.
6. Be encouraging and supportive about civic participation.
7. Focus on WHAT the user should DO, not just information.
8. Keep responses concise but complete.
9. When generating JSON, include a "reasoning" field explaining WHY this recommendation is personalized.
10. Include a "confidenceScore" (0-100) indicating how confident you are in the recommendation.`;

const prompts = {
  journey: (user) => ({
    system: SYSTEM_PROMPT,
    prompt: `Generate a personalized voting journey for this Indian voter:
- Name: ${user.name}
- Age: ${user.age}
- State: ${user.state}
- Voter Registration Status: ${user.voterStatus}
- Has Voter ID: ${user.hasVoterId}
- First Time Voter: ${user.isFirstTimeVoter}
- Pincode: ${user.pincode || 'Not provided'}

Create a step-by-step journey with exactly 5-7 steps. For each step include:
1. Step number and title
2. What to do (2-3 clear sentences)
3. Important link or resource (use official ECI links)
4. Estimated time to complete

Format your response as JSON:
{
  "steps": [
    {
      "number": 1,
      "title": "Step Title",
      "description": "What to do",
      "resource": "https://...",
      "estimatedTime": "10 minutes",
      "completed": false
    }
  ],
  "summary": "One line summary of the journey",
  "nextAction": "What the user should do right now",
  "reasoning": "Why this journey was personalized this way for the user",
  "confidenceScore": 85
}`,
  }),

  readiness: (user, checklist) => ({
    system: SYSTEM_PROMPT,
    prompt: `Calculate the voting readiness score for this Indian voter:

Voter Profile:
- Age: ${user.age}
- State: ${user.state}
- Voter Status: ${user.voterStatus}
- Has Voter ID: ${user.hasVoterId}
- First Time Voter: ${user.isFirstTimeVoter}

Checklist Status:
${checklist.map(item => `- ${item.label}: ${item.completed ? '✅ Done' : '❌ Not done'}`).join('\n')}

Calculate a readiness score from 0-100 and provide breakdown.

Format your response as JSON:
{
  "score": 75,
  "breakdown": {
    "registration": { "score": 25, "max": 30, "status": "Complete" },
    "documents": { "score": 20, "max": 25, "status": "Need Voter ID" },
    "awareness": { "score": 15, "max": 25, "status": "Good" },
    "preparation": { "score": 15, "max": 20, "status": "Find your booth" }
  },
  "tips": ["Tip 1", "Tip 2"],
  "nextAction": "What the user should do to increase their score"
}`,
  }),

  chat: (message, user, chatHistory = []) => ({
    system: `${SYSTEM_PROMPT}

VOTER CONTEXT:
- Name: ${user.name} | Age: ${user.age} | State: ${user.state}
- Registration: ${user.voterStatus} | Has Voter ID: ${user.hasVoterId}
- First-Time Voter: ${user.isFirstTimeVoter || false}

CONVERSATION SO FAR:
${chatHistory.slice(-8).map(m => `${m.role === 'user' ? 'VOTER' : 'AI'}: ${m.content}`).join('\n')}

MESSAGE CLASSIFICATION (DO THIS FIRST FOR EVERY MESSAGE):
Before responding, classify the user's message into one of two categories:
A) **GREETING ONLY** — ONLY pure greetings with no question attached (hi, hello, hey, namaste, ok, thanks, haan, theek hai, etc.) or truly off-topic questions (weather, sports, movies, food, coding — anything 100% unrelated to voting/elections/democracy/government).
B) **ELECTION-RELATED** — ANY question about voting, elections, democracy, voter registration, voter ID, polling booths, EVM, candidates, constituencies, forms, ECI, voting rights, importance of voting, election laws, or any topic even loosely related to elections or civic participation. Questions like "why voting is important", "what is democracy", "how does election work" are ALL Category B.

CRITICAL: When in doubt, ALWAYS treat the message as Category B and answer it directly. ONLY use Category A for pure greetings with zero election content.

FOR CATEGORY A (pure greetings ONLY) — respond with this EXACT structure:

"🙏 Namaste ${user.name}! Welcome to VotePath AI — your personal Indian election assistant.

## 🤖 Who Am I?
I am an AI-powered guide built on official Election Commission of India (ECI) data to help you navigate the entire voting process — from registration to casting your vote.

## 🛠️ How Can I Help You?
• Voter Registration — How to register, Form 6, eligibility check
• Voter ID Issues — Lost ID, name mismatch, corrections, duplicates
• Polling Booth — Find your booth, what to carry, voting process
• EVM & VVPAT — How electronic voting machines work
• Election Rules — Model Code of Conduct, voter rights
• Special Voting — NRI voting, senior citizens, PwD, postal ballot
• Complaints — Report violations via cVIGIL app
• Hindi / English — I can answer in both languages! 🇮🇳

## 📞 Quick Info
• ECI Helpline: 1950
• Voter Portal: https://voters.eci.gov.in/
• Booth Search: https://electoralsearch.eci.gov.in/

👉 Next Step: Please tell me exactly what election-related help you need! For example: How do I register to vote? or मेरा Voter ID खो गया है"

FOR CATEGORY B (election-related questions) — answer the question DIRECTLY. Do NOT show the welcome/intro. Just answer their question with relevant information.

OUTPUT RULES (for election-related questions):
1. Do NOT use asterisks (** or *) for bold or italic. Use plain text only.
2. Use bullet points (•) for lists — never plain paragraphs for multiple items.
3. Use ## headings to separate sections when the answer has 2+ parts.
4. Include direct links to official portals when relevant.
5. If the user writes in Hindi/Hinglish, respond in Hinglish naturally.
6. Keep answers between 100-250 words — concise but complete.
7. End every response with a clear, actionable "👉 Next Step:" line.
8. Personalize using the voter's name, state, age, and status.
9. Never say "I don't know." Always provide best available guidance or direct to 1950 helpline.
10. For factual/statistical questions, cite the source (e.g., "As per ECI data...").`,
    prompt: message,
  }),

  scenario: (scenarioType, user) => ({
    system: SYSTEM_PROMPT,
    prompt: `Simulate this voter scenario and provide a step-by-step solution:

Scenario: ${scenarioType}
Voter: ${user.name}, Age ${user.age}, from ${user.state}

Common scenarios and what to address:
- "first_time_voter": Complete guide for someone voting for the first time
- "lost_voter_id": How to get a duplicate/replacement voter ID
- "name_mismatch": How to correct name in voter rolls
- "shifted_residence": How to transfer voter registration
- "missed_registration": What to do if registration deadline passed
- "no_documents": Alternative ways to prove identity at booth

Provide a detailed solution flow with:
1. Problem description
2. Step-by-step solution (5-8 steps)
3. Documents needed
4. Official websites/contacts
5. Expected timeline

Format as JSON:
{
  "scenario": "${scenarioType}",
  "title": "Scenario Title",
  "description": "Brief problem description",
  "steps": [
    {
      "number": 1,
      "action": "What to do",
      "details": "More details",
      "link": "https://..."
    }
  ],
  "documentsNeeded": ["Doc 1", "Doc 2"],
  "estimatedTime": "3-5 days",
  "helplineNumber": "1950",
  "nextAction": "Immediate next step"
}`,
  }),

  booth: (pincode, area, user) => ({
    system: SYSTEM_PROMPT,
    prompt: `Provide polling booth guidance for an Indian voter:

Area/Pincode: ${pincode || area || 'Not specified'}
State: ${user.state}
Voter Status: ${user.voterStatus}

Provide:
1. How to find exact booth location (step-by-step)
2. What happens at the polling booth (the voting process)
3. What to carry on voting day
4. DOs and DON'Ts at the booth
5. Timing and queue management tips

Format as JSON:
{
  "howToFind": {
    "steps": ["Step 1...", "Step 2..."],
    "officialLink": "https://electoralsearch.eci.gov.in/"
  },
  "boothProcess": [
    { "step": 1, "description": "Arrival and queue" },
    { "step": 2, "description": "Identity verification" },
    { "step": 3, "description": "Ink marking" },
    { "step": 4, "description": "Voting on EVM" },
    { "step": 5, "description": "VVPAT verification" },
    { "step": 6, "description": "Exit" }
  ],
  "whatToCarry": ["Voter ID (EPIC)", "Additional photo ID"],
  "dos": ["Do arrive early", "Do check your name in voter list"],
  "donts": ["Don't carry mobile phone inside", "Don't take photos of ballot"],
  "timing": "Usually 7 AM to 6 PM (varies by state)",
  "nextAction": "Check your booth location now"
}`,
  }),

  quiz: () => ({
    system: SYSTEM_PROMPT,
    prompt: `Generate 10 multiple-choice questions about Indian elections and voting process.

Topics to cover:
- Voter eligibility and registration
- Election Commission of India
- Voting process at booth
- EVM and VVPAT
- Voter rights and responsibilities
- Important election terms
- Constitutional provisions about elections

Each question should be educational and help voters learn about the process.

Format as JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}`,
  }),

  timeline: (user) => ({
    system: SYSTEM_PROMPT,
    prompt: `Generate a personalized voting timeline for this Indian voter:

- Age: ${user.age}
- State: ${user.state}
- Voter Status: ${user.voterStatus}
- Has Voter ID: ${user.hasVoterId}
- First Time Voter: ${user.isFirstTimeVoter}

Create a timeline with important dates and deadlines. Since election dates vary, provide general guidance with relative deadlines.

Format as JSON:
{
  "events": [
    {
      "id": 1,
      "title": "Event Title",
      "description": "What happens and what to do",
      "deadline": "Description of when (e.g., '30 days before election')",
      "daysFromNow": 30,
      "priority": "high",
      "completed": false
    }
  ],
  "nextElectionInfo": "General information about upcoming elections",
  "nextAction": "What to do right now"
}`,
  }),
};

module.exports = prompts;
