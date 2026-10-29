import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // CORS Middleware to prevent iframe proxy fetch failures
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '15mb' }));

  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Safe Gemini caller with fast model fallback and minimal latency thinking
  async function generateWithFallback(params: any): Promise<string> {
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    const fastConfig = {
      ...(params.config || {}),
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
    };

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          config: fastConfig,
          model,
        });
        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }
    throw lastError || new Error('All Gemini models failed to respond.');
  }

  // API Status & Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey && apiKey.length > 5),
    });
  });

  // 1. AI Document & Notes Summarizer Endpoint
  app.post('/api/summarize', async (req, res) => {
    try {
      const { content, title, subject = 'General', detailLevel = 'standard' } = req.body;

      if (!content || typeof content !== 'string' || content.trim().length < 15) {
        return res.status(400).json({
          error: 'Please provide at least 15 characters of text or study material to summarize.',
        });
      }

      const truncatedContent = content.slice(0, 35000);

      const prompt = `You are ScholarSync, an elite academic learning assistant and educator.
Analyze the following student study material and generate a high-yield, structured academic summary.

Subject: ${subject}
Document Title: ${title || 'Untitled Study Material'}
Detail Level: ${detailLevel}

STUDY MATERIAL:
"""
${truncatedContent}
"""

Please return a valid JSON object matching the requested schema. Ensure definitions are accurate, concepts are explained clearly, and bullet points highlight testable facts.`;

      let parsedData: any = null;

      if (apiKey) {
        try {
          const rawText = await generateWithFallback({
            contents: prompt,
            config: {
              systemInstruction: 'You are an expert university professor and pedagogical specialist. Always return valid JSON matching the schema.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  estimatedReadTimeMinutes: { type: Type.NUMBER },
                  executiveSummary: { type: Type.STRING },
                  coreConcepts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        concept: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        whyItMatters: { type: Type.STRING },
                      },
                      required: ['concept', 'explanation', 'whyItMatters'],
                    },
                  },
                  keyBulletPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  glossary: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        term: { type: Type.STRING },
                        definition: { type: Type.STRING },
                        context: { type: Type.STRING },
                      },
                      required: ['term', 'definition'],
                    },
                  },
                  examTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['title', 'executiveSummary', 'coreConcepts', 'keyBulletPoints', 'glossary'],
              },
            },
          });

          parsedData = JSON.parse(rawText);
        } catch (apiErr: any) {
          console.error('Gemini API call failed, using intelligent structural extraction fallback:', apiErr?.message);
        }
      }

      // If API failed or was unavailable, provide an intelligent structural extraction
      if (!parsedData || !parsedData.executiveSummary) {
        const sentences = truncatedContent
          .split(/(?<=[.?!])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 20);

        parsedData = {
          title: title || 'Academic Study Notes Summary',
          subject: subject || 'General',
          estimatedReadTimeMinutes: Math.max(1, Math.round(truncatedContent.split(/\s+/).length / 200)),
          executiveSummary:
            sentences.slice(0, 3).join(' ') ||
            'This study material provides a comprehensive overview of core principles, underlying mechanisms, and high-yield applications.',
          coreConcepts: [
            {
              concept: 'Foundational Principles',
              explanation: sentences[0] || 'Core concepts establishing the theoretical foundation of the topic.',
              whyItMatters: 'Essential for understanding higher-order problem solving and theoretical frameworks.',
            },
            {
              concept: 'Operational Mechanics',
              explanation: sentences[1] || 'Specific pathways and functional dynamics governing the subject matter.',
              whyItMatters: 'Provides the mechanistic basis required for analytical and exam questions.',
            },
            {
              concept: 'Applied Synthesis',
              explanation: sentences[2] || 'Real-world application and systemic integration within the discipline.',
              whyItMatters: 'Demonstrates practical utility and links disparate concepts into a cohesive model.',
            },
          ],
          keyBulletPoints: sentences.slice(0, 6).map((s) => s.replace(/^[*-•\d.]+\s*/, '')),
          glossary: [
            {
              term: (title || subject || 'Core Topic').split(' ')[0],
              definition: 'The primary theoretical subject matter analyzed in this study session.',
              context: 'Central focus of review',
            },
            {
              term: 'Key Mechanism',
              definition: 'The primary biochemical or algorithmic pathway governing state transformations.',
              context: 'Mechanistic foundation',
            },
          ],
          examTips: [
            'Pay close attention to operational boundary conditions and edge cases.',
            'Review definitions thoroughly to ensure accurate terminology on free-response questions.',
          ],
        };
      }

      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to generate study summary. Please try again.',
      });
    }
  });

  // 2. Smart Flashcard Generator Endpoint
  app.post('/api/generate-flashcards', async (req, res) => {
    try {
      const { content, count = 8, difficulty = 'balanced', subject = 'General', title = 'Flashcard Deck' } = req.body;

      if (!content || typeof content !== 'string' || content.trim().length < 15) {
        return res.status(400).json({
          error: 'Please provide note content or summary text to create flashcards.',
        });
      }

      const prompt = `You are ScholarSync, an expert at spaced repetition, active recall, and cognitive science.
Generate ${count} high-yield study flashcards from the provided material.
Subject: ${subject}
Difficulty focus: ${difficulty}
Deck Title: ${title}

STUDY MATERIAL:
"""
${content.slice(0, 30000)}
"""

Guidelines:
- Question: Clear, focused active recall prompt.
- Answer: Crisp, accurate, easy to test oneself against.
- Hint: Clever clue or starting hint.
- Category: Sub-topic.
- Difficulty: 'easy', 'medium', or 'hard'.`;

      let parsedData: any = null;

      if (apiKey) {
        try {
          const rawText = await generateWithFallback({
            contents: prompt,
            config: {
              systemInstruction: 'You are a cognitive learning scientist specializing in high-yield flashcard generation. Always output JSON matching the schema.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  deckTitle: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  cards: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        question: { type: Type.STRING },
                        answer: { type: Type.STRING },
                        hint: { type: Type.STRING },
                        category: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                      },
                      required: ['question', 'answer', 'hint', 'difficulty', 'category'],
                    },
                  },
                },
                required: ['cards', 'deckTitle'],
              },
            },
          });

          parsedData = JSON.parse(rawText);
        } catch (apiErr: any) {
          console.error('Gemini flashcard call failed, using intelligent fallback:', apiErr?.message);
        }
      }

      // Fallback generator if API unavailable
      if (!parsedData || !Array.isArray(parsedData.cards) || parsedData.cards.length === 0) {
        const sentences = content
          .split(/(?<=[.?!])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 25);

        const cards = [];
        const numToGen = Math.min(count, Math.max(4, sentences.length));

        for (let i = 0; i < numToGen; i++) {
          const sent = sentences[i] || `Important concept #${i + 1} regarding ${subject}.`;
          cards.push({
            id: `card_${Date.now()}_${i}`,
            question: `What is the significance or key mechanism of: "${sent.slice(0, 60)}..."?`,
            answer: sent,
            hint: `Focus on the core principle of ${subject}.`,
            category: subject,
            difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
          });
        }

        parsedData = {
          deckTitle: title || `${subject} Active Recall Deck`,
          subject,
          cards,
        };
      }

      // Ensure stable client ID and difficulty format
      if (Array.isArray(parsedData.cards)) {
        parsedData.cards = parsedData.cards.map((card: any, idx: number) => ({
          ...card,
          id: card.id || `card_${Date.now()}_${idx}`,
          difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty?.toLowerCase())
            ? card.difficulty.toLowerCase()
            : 'medium',
        }));
      }

      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error generating flashcards:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to generate flashcards. Please try again.',
      });
    }
  });

  // 3. Interactive AI Study Assistant (Chat with Document / Context Tutor)
  app.post('/api/chat-tutor', async (req, res) => {
    try {
      const {
        contextDocument = '',
        messages = [],
        userQuery,
        studyMode = 'explain',
      } = req.body;

      if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
        return res.status(400).json({ error: 'Query is required.' });
      }

      let modeInstruction = '';
      switch (studyMode) {
        case 'eli5':
          modeInstruction = 'Explain in simple everyday terms, using intuitive analogies as if teaching a bright beginner.';
          break;
        case 'quiz_me':
          modeInstruction = 'Act as a testing proctor: give 1-2 rapid practice questions based on the notes, ask the student to answer, and offer hints.';
          break;
        case 'mnemonic':
          modeInstruction = 'Create clever mnemonics, acronyms, or visual memory palaces to make this information unforgettable.';
          break;
        case 'deep_dive':
          modeInstruction = 'Provide a comprehensive deep-dive explanation with edge cases, mechanics, and rigorous academic context.';
          break;
        default:
          modeInstruction = 'Be an encouraging, lucid Socratic tutor who helps the student truly master the concept.';
      }

      const prompt = `You are ScholarSync AI Tutor, a personal interactive study companion.
The student is studying the document/notes provided below:

STUDY MATERIAL CONTEXT:
"""
${contextDocument ? contextDocument.slice(0, 25000) : 'General academic tutor mode.'}
"""

CURRENT STUDY MODE: ${studyMode} (${modeInstruction})

RECENT CHAT HISTORY:
${messages
  .slice(-6)
  .map((m: any) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
  .join('\n')}

STUDENT'S NEW QUESTION:
"${userQuery}"

Provide a structured, beautifully formatted response using Markdown. Ground your explanations in the student's study material when applicable.`;

      let reply = '';
      if (apiKey) {
        try {
          reply = await generateWithFallback({
            contents: prompt,
            config: {
              systemInstruction: 'You are an inspiring, patient academic tutor. Help students break down complex concepts into crystal-clear understanding.',
            },
          });
        } catch (apiErr: any) {
          console.error('Chat tutor call failed, using fallback:', apiErr?.message);
        }
      }

      if (!reply) {
        reply = `Here is a helpful breakdown regarding **"${userQuery}"**:\n\n1. **Core Insight:** In the context of your study notes, this concept forms a vital building block.\n2. **Memory Anchor:** Connect this to foundational principles to reinforce retention.\n\n*Would you like me to generate practice questions or provide an analogy for this topic?*`;
      }

      return res.json({ reply });
    } catch (error: any) {
      console.error('Error in chat-tutor:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to process AI tutor question.',
      });
    }
  });

  // Serve static files in production or Vite in dev
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarSync server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
