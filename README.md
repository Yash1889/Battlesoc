# BattleSoc - AI Battle Platform

An AI-powered platform to compare GitHub profiles, LinkedIn profiles, resumes, and typing speeds.

## Features

- 🥊 **GitHub Battle**: Compare GitHub profiles across 10 categories
- 💼 **LinkedIn Battle**: AI-powered LinkedIn profile comparison  
- 📄 **Resume Battle**: Resume comparison with ATS scoring
- ⌨️ **Typing Race**: Monkeytype-style typing speed test

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Groq AI API

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` with your Groq API key:
   ```
   NEXT_PUBLIC_GROQ_API_KEY=your_key_here
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `NEXT_PUBLIC_GROQ_API_KEY`: Your Groq API key for AI features

## Deployment

Deploy easily on Vercel by connecting your GitHub repository and adding the environment variable.
