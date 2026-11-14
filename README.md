# CareAssist AI · Student Edition

A practice ward for nursing and medical students. Students triage simulated patients, write clinical handovers, learn short clinical modules, and test themselves with a quiz that builds a personal study plan.

**Live demo:** <https://careassistai.netlify.app/>
**Demo video:** <https://www.loom.com/share/da8bb8ebc86e4bfea2ccc8b05127da1b>

## The problem
Nursing and medical students get little safe practice at triage and handover before reaching a real ward, and feedback is slow. A missed priority or a vague handover can harm a patient.

## Our solution
CareAssist AI is a simulated ward where students practise these skills on fictional patients, learn the theory behind them, and test their knowledge.

## Features
- Role-based sign-in with protected routes
- Dashboard of simulated cases with priority, status and search
- Rules-based triage priority
- Assess and Handover workflows
- Learning centre: triage (SATS), ABCDE, vital signs, SBAR handover
- Quick quiz with explanations
- Personal study plan that links missed questions back to the right module
- Progress page with quiz history

## Tech stack
- React and Vite
- Tailwind CSS
- React Router
- Supabase (authentication and database)
- Netlify (hosting and serverless functions)
- OpenAI API

## Safety and privacy
- Fictional patients only
- Educational use, not clinical advice
- Triage priority comes from transparent rules, and AI output is reviewed by a human supervisor

## Run locally
    npm install
    npm run dev

Create a `.env` file with your Supabase and API keys (not committed to Git).

## Roadmap
- Save quiz scores in Supabase so progress follows the student across devices
- Larger, expert-reviewed question bank
- Lecturer dashboards for nursing schools

## Team
<your name> and <teammate's name>
