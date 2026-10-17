import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK on server side with User-Agent header per instructions
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Multi-turn Gemini Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.8-flash', systemRole } = req.body;

    const defaultSystemInstruction =
      'You are Mama Chichi, the legendary Lagos street oracle, guild tactician, and mentor in the vibrant RPG world of mylag. ' +
      'You speak with authentic Nigerian warmth, punchy Lagos Pidgin expressions ("No shaking", "Wahala be like bicycle", "E go be", "Oya sharp sharp", "Sharp guy"), ' +
      'and strategic mastery on elemental combat (Electro/Hydro/Pyro/Anemo combos), careers (Yaba Tech Bro, Oshodi Danfo Driver, Lekki Actor, Balogun Merchant), ' +
      'dungeons, pet companions, and the mylag real-economy payout system. Give immersive, tactical, and entertaining guidance.';

    // Map conversation history to contents format
    const contents = (messages || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Target model selection with fallback to gemini-3.8-flash
    const targetModel = model || 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction: systemRole || defaultSystemInstruction,
      },
    });

    res.json({
      reply: response.text || 'Lagos no dey sleep! Ask me again sharp sharp.',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    // Provide a resilient fallback if API key quota or offline
    res.json({
      reply:
        'Mama Chichi here: Network fit dey do shaky-shaky for Lagos, but your guild stands strong! ' +
        'Remember to stack your LagCoins, trigger Vaporize (Pyro + Hydro) in the Computer Village dungeon, ' +
        'and keep your daily login streak active! No shaking at all!',
      fallback: true,
    });
  }
});

// 2. High-Quality Image Generation API (Supports 1K, 2K, 4K resolution)
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '1:1' } = req.body;

    const promptText = `High quality afrofuturistic video game concept art of: ${prompt}. Clean vivid colors, cinematic lighting, sharp details.`;

    let response;
    // Primary model requested by user attachment: gemini-3-pro-image-preview
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: promptText }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: (imageSize as any) || '1K',
          },
        },
      });
    } catch (e1: any) {
      console.warn('gemini-3-pro-image-preview fallback, trying gemini-nano-banana-2.1:', e1?.message);
      try {
        response = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: {
            parts: [{ text: promptText }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: (imageSize as any) || '1K',
            },
          },
        });
      } catch (e2: any) {
        console.warn('Falling back to gemini-3.1-flash-lite-image:', e2?.message);
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: promptText }],
          },
        });
      }
    }

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error('No image data returned from model');
    }

    res.json({ imageUrl, imageSize, aspectRatio });
  } catch (error: any) {
    console.error('Image gen error:', error);
    res.status(500).json({
      error: error.message || 'Image generation failed',
    });
  }
});

// 3. Simulated Nigerian Banking & Fintech Resolution API
const DEMO_NAMES = [
  'MICHELLE ONIOBIA',
  'BABATUNDE OLUWASEUN',
  'CHIOMA ADESANYA',
  'EMMANUEL CHUKWU',
  'ZAINAB AL-HASSAN',
  'FOLAKE JOHNSON',
];

app.post('/api/fintech/verify', (req, res) => {
  const { accountNumber, bankCode } = req.body;
  if (!accountNumber || accountNumber.length !== 10) {
    return res.status(400).json({ error: 'Invalid 10-digit NUBAN account number' });
  }

  // Deterministic account name resolution based on account digits
  const seed = parseInt(accountNumber.slice(-2), 10) || 0;
  const resolvedName = DEMO_NAMES[seed % DEMO_NAMES.length];

  res.json({
    verified: true,
    accountNumber,
    bankCode,
    accountName: resolvedName,
    verificationTimestamp: new Date().toISOString(),
    institutionStatus: 'Active - Central Bank of Nigeria Cleared NIP Gateway',
  });
});

app.post('/api/fintech/withdraw', (req, res) => {
  const { accountNumber, bankName, amountNaira, otp } = req.body;

  if (!otp || otp.trim() !== '7749' && otp.length < 4) {
    return res.status(400).json({ error: 'Invalid verification OTP. Enter 7749 or 4-digit code.' });
  }

  const reference = `MYLAG-NIP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  res.json({
    status: 'COMPLETED',
    reference,
    amountNaira,
    accountNumber,
    bankName,
    completedAt: new Date().toISOString(),
    escrowAuditHash: 'SHA256-ESCROW-VERIFIED-SECURE-PAYMENT-OK',
    message: `₦${Number(amountNaira).toLocaleString()} successfully processed to ${bankName} account ${accountNumber}.`,
  });
});

// Mount Vite or serve static dist
async function setupVite() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`mylag server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
