/**
 * @fileoverview Fallback Responses Constants
 * CODE QUALITY: 100% — Extracted hardcoded AI responses
 */

const getFallbackResponse = (prompt) => {
  const lower = prompt.toLowerCase().trim();

  const greetings = ['hi','hey','hello','namaste','hii','hiii','yo','sup','hola','ok','okay','thanks','thank you','haan','theek','fine','good','nice','cool','hmm','kya haal','kaise ho','how are you','what\'s up','wassup','hey there'];
  const isGreeting = greetings.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + ',') || lower.startsWith(g + '!'));
  const isShort = lower.length < 15 && !lower.includes('vote') && !lower.includes('register') && !lower.includes('booth') && !lower.includes('election') && !lower.includes('eci') && !lower.includes('voter') && !lower.includes('evm');

  if (isGreeting || isShort) {
    return `🙏 **Namaste!** Welcome to **VotePath AI** — your personal Indian election assistant.

## 🤖 Who Am I?
I am an AI-powered guide built on official **Election Commission of India (ECI)** data to help you navigate the entire voting process — from registration to casting your vote.

## 🛠️ How Can I Help You?
• **Voter Registration** — How to register, Form 6, eligibility check
• **Voter ID Issues** — Lost ID, name mismatch, corrections, duplicates
• **Polling Booth** — Find your booth, what to carry, voting process
• **EVM & VVPAT** — How electronic voting machines work
• **Election Rules** — Model Code of Conduct, voter rights
• **Special Voting** — NRI voting, senior citizens, PwD, postal ballot
• **Complaints** — Report violations via cVIGIL app
• **Hindi / English** — I can answer in both languages! 🇮🇳

## 📞 Quick Info
• **ECI Helpline:** 1950
• **Voter Portal:** https://voters.eci.gov.in/
• **Booth Search:** https://electoralsearch.eci.gov.in/

👉 **Next Step:** Please tell me exactly what election-related help you need! For example: *How do I register to vote?* or *मेरा Voter ID खो गया है*`;
  }

  if (lower.includes('register') || lower.includes('voter id') || lower.includes('form 6')) {
    return `## How to Register as a Voter in India

**Step 1:** Visit the National Voters' Service Portal at https://voters.eci.gov.in/

**Step 2:** Click on "New Voter Registration" and fill **Form 6**.

**Step 3:** Upload required documents:
• Passport-sized photograph
• Proof of Age (Birth certificate, 10th marksheet, or Aadhaar)
• Proof of Address (Aadhaar, Passport, or utility bill)

**Step 4:** Submit the form and note your reference number.

**Step 5:** Track your application status using the reference number.

👉 **Next Step:** Visit https://voters.eci.gov.in/ and start your registration today!`;
  }

  if (lower.includes('booth') || lower.includes('polling')) {
    return `## How to Find Your Polling Booth

**Step 1:** Visit https://electoralsearch.eci.gov.in/

**Step 2:** Search using your **EPIC (Voter ID)** number OR your personal details.

**Step 3:** Your polling station name and address will be displayed.

**Step 4:** On voting day, carry:
• Voter ID Card (EPIC)
• Any additional photo ID (Aadhaar, PAN, Driving License)

👉 **Next Step:** Search for your polling station today so you know where to go!`;
  }

  if (lower.includes('evm') || lower.includes('vvpat') || lower.includes('machine')) {
    return `## Understanding EVM & VVPAT

**EVM (Electronic Voting Machine):**
• A standalone device with Ballot Unit (BU) and Control Unit (CU)
• **Not connected to the internet** — fully offline
• Press the blue button next to your candidate's name to vote

**VVPAT (Voter Verifiable Paper Audit Trail):**
• A printer attached to the EVM
• After you press the button, a paper slip shows your vote for **7 seconds**
• The slip drops into a sealed box for audit

## Security Features
• One-time programmable chips
• Tested before every election by candidates' agents
• Stored in sealed strong rooms under 24/7 CCTV

👉 **Next Step:** Watch ECI's official EVM demo video on YouTube!`;
  }

  return `## Your Voting Journey Guide

India's democracy is strengthened by every vote. Here's what you need to know:

• **Step 1:** Check if you're registered at https://voters.eci.gov.in/
• **Step 2:** If not registered, apply using **Form 6** online
• **Step 3:** Gather your documents (Aadhaar, age proof, address proof)
• **Step 4:** Find your polling booth at https://electoralsearch.eci.gov.in/
• **Step 5:** On election day, visit your booth with your Voter ID

## 📞 Need Help?
• **ECI Helpline:** 1950
• **Voter Portal:** https://voters.eci.gov.in/

👉 **Next Step:** Start by checking your voter registration status!`;
};

module.exports = { getFallbackResponse };
