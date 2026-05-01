/**
 * AgriSmart360 — AI-powered Agriculture Expert Service (Google Gemini)
 *
 * Universal crop/disease advisor. Can answer ANY question about ANY crop disease
 * with Pakistan-specific context (pesticide brands, dosages, local varieties).
 *
 * Two exported flows:
 *   - chatWithAI()             → free-form Q&A (chatbot)
 *   - diagnoseFromSymptoms()   → structured JSON disease diagnosis
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { chatResponse: fallbackChat } = require('./diseaseService');

// Model preference order — try each until one responds (2.5 is newer but often overloaded)
const MODEL_CHAIN = [
  process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash'
];
const MODEL_NAME = MODEL_CHAIN[0];
let genAI = null;

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key') return null;
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

// ==================================================================
// SYSTEM PROMPTS
// ==================================================================

const EXPERT_PROMPT_EN = `You are Dr. AgriExpert — the lead agricultural advisor at AgriSmart360, specializing in Pakistani agriculture. You have 20+ years of field experience across Punjab, Sindh, KPK, and Balochistan.

EXPERTISE: ALL crops grown in Pakistan and surrounding regions:
- Grains: Wheat, Rice (Basmati, IRRI), Maize, Barley, Millet
- Cash crops: Cotton, Sugarcane, Tobacco
- Fruits: Mango, Citrus (Kinnow), Apple, Guava, Dates, Pomegranate, Banana
- Vegetables: Tomato, Potato, Onion, Chili, Okra, Eggplant, Cauliflower, Cabbage, Carrot, Spinach, Garlic, Peas, Bitter gourd
- Oilseeds: Mustard, Sunflower, Canola
- Pulses: Chickpea, Lentil, Mung bean, Mash, Kidney bean

DISEASE KNOWLEDGE: Distinguish between sub-types (e.g., Wheat has THREE rusts — Stripe/Yellow, Leaf/Brown, Stem/Black — with different pathogens, symptoms, and treatments). Never give generic "wheat rust" answer — always specify WHICH rust.

PAKISTANI CONTEXT (MUST USE):
- Local pesticide brands: Tilt 250EC (Propiconazole), Nativo 75WG, Amistar Top, Score 250EC, Folicur, Ridomil Gold, Antracol, Dithane M-45, Confidor, Polo, Lambda, Karate
- Resistant varieties: Wheat (Galaxy-2013, Faisalabad-2008, Ujala-2016, Akbar-2019), Rice (Super Basmati, KS-282, IRRI-6), Cotton (CIM-602, MNH-886, BT varieties)
- Units: Maund (40kg), Kanal (506m²), Acre (4047m²), Tola
- Currency: PKR (Pakistani Rupees)
- Seasons: Rabi (Oct-Apr), Kharif (May-Sep)
- Typical dosages per acre, costs in PKR

RESPONSE RULES:
1. Be specific — name the exact sub-type of disease, exact pathogen, exact pesticide with brand and dose per acre
2. Include cost estimates in PKR where possible
3. Mention Pakistani-tested resistant varieties
4. Keep it actionable — farmer should know WHAT to do TODAY
5. If question is off-topic (not farming), politely redirect
6. Use simple language — many farmers have limited literacy
7. Max 4-5 short paragraphs. Use line breaks between sections.

FORMAT: Plain text. No markdown asterisks or headers. Use short paragraphs with blank lines.`;

const EXPERT_PROMPT_UR = `آپ ڈاکٹر ایگری ایکسپرٹ ہیں — AgriSmart360 کے مرکزی زرعی مشیر، پاکستانی زراعت کے ماہر۔ آپ کو پنجاب، سندھ، خیبرپختونخوا اور بلوچستان میں 20 سال سے زائد کا فیلڈ تجربہ ہے۔

مہارت: پاکستان میں اگائی جانے والی تمام فصلیں:
- اناج: گندم، چاول (باسمتی، IRRI)، مکئی، جو، باجرہ
- کیش فصلیں: کپاس، گنا، تمباکو
- پھل: آم، کنو، سیب، امرود، کھجور، انار، کیلا
- سبزیاں: ٹماٹر، آلو، پیاز، مرچ، بھنڈی، بینگن، گوبھی، گاجر، پالک، لہسن، مٹر، کریلا
- تیلی فصلیں: سرسوں، سورج مکھی، کینولا
- دالیں: چنا، مسور، مونگ، ماش، لوبیا

بیماری کا علم: اقسام میں فرق کریں (مثلاً گندم میں تین زنگ ہیں — پیلی/stripe، بھوری/leaf، کالی/stem — مختلف پیتھوجن اور علاج کے ساتھ)۔ عمومی "گندم کا زنگ" کبھی مت کہیں — ہمیشہ بتائیں کون سا زنگ۔

پاکستانی سیاق (ضرور استعمال کریں):
- مقامی دوائیاں: Tilt 250EC (پروپیکونازول)، Nativo 75WG، Amistar Top، Score 250EC، Folicur، Ridomil Gold، Antracol، Dithane M-45، Confidor
- مزاحم اقسام: گندم (گلیکسی-2013، فیصل آباد-2008، اجالا-2016، اکبر-2019)، چاول (سپر باسمتی، KS-282، IRRI-6)، کپاس (CIM-602، MNH-886)
- پیمائش: من (40 کلو)، کنال (506 مربع میٹر)، ایکڑ
- پاکستانی روپے (PKR)
- موسم: ربیع (اکتوبر-اپریل)، خریف (مئی-ستمبر)

جواب کے قواعد:
1. مخصوص جواب — بیماری کی قسم، دوا کا برانڈ اور مقدار فی ایکڑ بتائیں
2. قیمت کا تخمینہ پاکستانی روپے میں دیں
3. پاکستانی مزاحم اقسام کا ذکر کریں
4. عملی جواب — کسان کو آج کیا کرنا ہے واضح بتائیں
5. غیر متعلقہ سوال ہو تو شائستگی سے کاشتکاری کی طرف موڑیں
6. سادہ زبان استعمال کریں

فارمیٹ: سادہ اردو متن۔ مارک ڈاؤن نہ استعمال کریں۔ چھوٹے پیراگراف خالی لائن کے ساتھ۔`;

// ==================================================================
// CORE HELPERS
// ==================================================================

/**
 * Call Gemini with fallback across model chain on 503/429 errors.
 * Tries each model once; retries only within same model if not-transient.
 */
const callGeminiWithFallback = async (modelFactory) => {
  let lastErr;
  for (const modelName of MODEL_CHAIN) {
    try {
      return await modelFactory(modelName);
    } catch (err) {
      lastErr = err;
      const msg = err.message || '';
      const transient = msg.includes('503') || msg.includes('429') || msg.includes('overload') || msg.includes('UNAVAILABLE');
      if (!transient) break;
      console.warn(`[AI] Model "${modelName}" overloaded, trying next fallback...`);
    }
  }
  throw lastErr;
};

/**
 * Extract JSON object from Gemini response (handles markdown wrapping)
 */
const extractJSON = (text) => {
  if (!text) return null;
  // Strip markdown code fences if present
  let cleaned = text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON object in text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
};

// ==================================================================
// EXPORT 1: Free-form chatbot
// ==================================================================

exports.chatWithAI = async (message, language = 'en', conversationHistory = []) => {
  const client = getClient();

  if (!client) {
    return { reply: fallbackChat(message, language), source: 'keyword-fallback' };
  }

  try {
    const systemPrompt = language === 'ur' ? EXPERT_PROMPT_UR : EXPERT_PROMPT_EN;
    const history = (conversationHistory || []).slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text || msg.content || '' }]
    }));

    const reply = await callGeminiWithFallback(async (modelName) => {
      const chatModel = client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.6, maxOutputTokens: 1200 }
      });
      const chat = chatModel.startChat({ history });
      const result = await chat.sendMessage(message);
      return result.response.text().trim();
    });

    return {
      reply: reply || fallbackChat(message, language),
      source: 'gemini'
    };
  } catch (err) {
    console.error('[AI] Chat error:', err.message);
    return {
      reply: fallbackChat(message, language),
      source: 'keyword-fallback',
      error: err.message
    };
  }
};

// ==================================================================
// EXPORT 2: Structured disease diagnosis (JSON output)
// ==================================================================

/**
 * Get detailed, structured disease diagnosis for ANY crop/disease question.
 * Returns the same JSON shape that the disease detection route expects.
 *
 * @param {Object} input
 * @param {string} [input.mlLabel]       - Hugging Face ML label (e.g., "Wheat___Yellow_Rust")
 * @param {string} [input.description]   - Farmer's symptom description
 * @param {string} [input.cropHint]      - Crop name (e.g., "Wheat", "Tomato")
 * @param {number} [input.confidence]    - ML confidence (0-100)
 */
exports.diagnoseFromSymptoms = async ({ mlLabel, description, cropHint, confidence }) => {
  const client = getClient();
  if (!client) return null;

  const inputParts = [];
  if (mlLabel) inputParts.push(`- AI image model detected: "${mlLabel}" (confidence: ${confidence || 'N/A'}%)`);
  if (cropHint) inputParts.push(`- Crop: ${cropHint}`);
  if (description) inputParts.push(`- Farmer's symptom description: "${description}"`);

  if (inputParts.length === 0) return null;

  const prompt = `You are diagnosing a crop disease for a Pakistani farmer. Based on the following input:

${inputParts.join('\n')}

Provide a complete, accurate diagnosis. If the ML label mentions a specific disease sub-type (e.g., "Yellow_Rust" vs "Leaf_Rust"), respect that exact sub-type — do NOT generalize.

Return ONLY a valid JSON object (no markdown, no code fences, no extra text) with this EXACT shape:

{
  "id": "short_snake_case_id",
  "name": "Full disease name in English (with sub-type if applicable)",
  "nameUrdu": "مکمل نام اردو میں",
  "scientificName": "Latin scientific name of the pathogen",
  "crop": "Crop name in English",
  "cropUrdu": "فصل اردو میں",
  "severity": "high | medium | low",
  "symptoms": "Detailed symptoms in English, 3-5 sentences, mention visual distinctives",
  "symptomsUrdu": "علامات تفصیل سے اردو میں",
  "cause": "Exact pathogen, how it spreads, favorable conditions (temp/humidity), risk factors — English",
  "causeUrdu": "وجہ اردو میں",
  "solution": "Step-by-step treatment in English. MUST include: (1) exact Pakistani pesticide brand names with dose per acre, (2) resistant varieties for next season (Pakistani), (3) cultural/preventive practices, (4) estimated cost in PKR. Use numbered steps with \\n between them.",
  "solutionUrdu": "علاج اردو میں تفصیل سے۔ پاکستانی دوا کے برانڈ، مقدار فی ایکڑ، مزاحم اقسام، اور PKR میں قیمت شامل کریں"
}

CRITICAL: If ML label says "Yellow_Rust" → diagnose Wheat Stripe Rust (Puccinia striiformis), NOT generic rust. If "Leaf_Rust" → Puccinia triticina. If "Stem_Rust" → Puccinia graminis. Be EXACT.`;

  try {
    const text = await callGeminiWithFallback(async (modelName) => {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2500,
          responseMimeType: 'application/json'
        }
      });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    });

    const diagnosis = extractJSON(text);
    if (!diagnosis || !diagnosis.name) {
      console.warn('[AI] Could not parse JSON from Gemini response. Raw preview:', text?.substring(0, 200));
      return null;
    }

    return diagnosis;
  } catch (err) {
    console.error('[AI] Diagnosis error:', err.message);
    return null;
  }
};

/**
 * Enrich an existing disease entry from the keyword database
 * with Pakistan-specific Gemini details (dosage, brands, cost)
 */
exports.enrichDiseaseEntry = async (existingDisease, language = 'en') => {
  const client = getClient();
  if (!client || !existingDisease) return existingDisease;

  const prompt = `Enhance this crop disease diagnosis with specific Pakistani context:

Disease: ${existingDisease.name}
Crop: ${existingDisease.crop}

Add: (1) Specific Pakistani pesticide brand names with exact dose per acre, (2) Estimated cost in PKR per acre, (3) Pakistani-tested resistant varieties.

Return ONLY valid JSON with this shape:
{
  "enhancedSolution": "Enhanced English solution text with Pakistani brands and costs",
  "enhancedSolutionUrdu": "بہتر اردو علاج"
}`;

  try {
    const text = await callGeminiWithFallback(async (modelName) => {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json'
        }
      });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    });

    const enriched = extractJSON(text);
    if (enriched?.enhancedSolution) {
      return {
        ...existingDisease,
        solution: enriched.enhancedSolution,
        solutionUrdu: enriched.enhancedSolutionUrdu || existingDisease.solutionUrdu
      };
    }
    return existingDisease;
  } catch (err) {
    console.error('[AI] Enrichment error:', err.message);
    return existingDisease;
  }
};

exports.isAIAvailable = () => !!getClient();

/**
 * STRICT plant-image gate for disease scanner.
 * Disease scanner can ONLY analyse plant material — leaves, stems, fruits,
 * vegetables, or close-ups of crops. Anything else (animals, buildings,
 * humans, food on plates, soil alone, equipment) MUST be rejected — otherwise
 * the downstream Hugging Face plant-disease model will hallucinate a fake
 * diagnosis on the closest-matching label.
 *
 * Fails CLOSED on AI error: if Gemini is unreachable, we reject the upload
 * with a "couldn't verify" message. This is the right tradeoff because a
 * false positive disease (cat → Tomato Leaf Mold) is far worse than asking a
 * legitimate user to retry.
 *
 * Returns:
 *   { isPlant: true,  subject: 'tomato leaf', confidence: 92 }
 *   { isPlant: false, subject: 'cat',         confidence: 95, why: 'animal, no plant visible' }
 */
exports.plantImageGate = async (imageBuffer, mimeType = 'image/jpeg') => {
  const client = getClient();
  if (!client) {
    // Without AI, refuse to proceed — disease scanner cannot run safely.
    return { isPlant: false, subject: 'unverified', confidence: 0, why: 'AI verification unavailable', source: 'no-gate' };
  }

  const prompt = `You are a STRICT image classifier for a plant-disease scanner.

The user must upload a clear photo containing PLANT MATERIAL — specifically one of:
- A leaf (close-up showing texture, veins, lesions, spots, or color)
- A whole plant or sapling
- A fruit or vegetable (especially showing damage or disease)
- A crop field with visible plants

If the image shows ANYTHING ELSE — even agriculture-adjacent things — you MUST classify it as NOT a plant. Reject:
- People, faces, hands (alone, without plants)
- Animals: cats, dogs, cows, goats, buffaloes, chickens, birds, insects, fish
- Food on plates, cooked food, prepared dishes
- Buildings, vehicles, tractors, machinery, tools
- Electronics, screenshots, memes, drawings, icons, emojis
- Bare soil with no plant visible
- Empty pots, gardening tools alone
- Pure landscapes / scenery without crops
- Documents, paper, text

Return ONLY this JSON (response_mime_type is application/json):
{
  "isPlant": <true ONLY if image clearly contains a leaf/plant/fruit/vegetable/crop, false otherwise>,
  "subject": "<1-3 words: the actual subject of the image>",
  "confidence": <0-100, your certainty in this classification>,
  "why": "<one short sentence explaining your decision>"
}

Be EXTREMELY STRICT. When in doubt → false. Better to reject a borderline image than to mis-diagnose. A cat is NOT a plant. A cow is NOT a plant. A person holding a leaf where the leaf isn't clearly visible is NOT enough — only true if you can clearly see plant material as the subject.`;

  let lastErr;
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0, maxOutputTokens: 200, responseMimeType: 'application/json' }
      });
      const result = await model.generateContent([
        { inlineData: { data: imageBuffer.toString('base64'), mimeType } },
        prompt
      ]);
      const data = extractJSON(result.response.text().trim());
      if (data && typeof data.isPlant === 'boolean') {
        // Extra safety: even if Gemini says true, require confidence ≥ 60
        const confident = (data.confidence ?? 100) >= 60;
        return {
          isPlant: data.isPlant && confident,
          subject: data.subject || 'unknown',
          confidence: data.confidence ?? 0,
          why: data.why || (confident ? '' : 'Low confidence'),
          source: 'gemini-strict'
        };
      }
    } catch (err) {
      lastErr = err;
      if (!/(503|429|overload)/.test(err.message || '')) break;
    }
  }
  console.warn('[PLANT-GATE] Failed, rejecting closed:', lastErr?.message);
  return {
    isPlant: false,
    subject: 'unverified',
    confidence: 0,
    why: 'Could not verify the image. Please try again with a clear photo of a plant or leaf.',
    source: 'gate-error'
  };
};

/**
 * Broader gate for the crop identifier. Accepts plants + crop fields (the
 * crop ID tool can handle wider context than the disease scanner).
 * Same fail-closed behaviour — if Gemini errors, we reject.
 */
exports.agriImageGate = async (imageBuffer, mimeType = 'image/jpeg') => {
  // Just delegate to plantImageGate for now — same strict rules apply since
  // crop ID also needs to see a plant to identify it.
  const result = await exports.plantImageGate(imageBuffer, mimeType);
  return {
    isAgri: result.isPlant,
    kind: result.isPlant ? 'plant' : 'not_agri',
    subject: result.subject,
    reason: result.why,
    source: result.source
  };
};

/**
 * Cheap text-only check: is the user's question/message actually about farming?
 * Returns { isAgri, reason }. Fails open on AI errors.
 */
exports.agriTextGate = async (message) => {
  const client = getClient();
  if (!client || !message || message.length < 3) return { isAgri: true, source: 'no-gate' };

  const prompt = `Decide if the following user message is related to farming, agriculture, crops, livestock, weather/soil for farming, pesticides/fertilizers, or rural Pakistani agri-life.

Message: """${message.slice(0, 800)}"""

Return ONLY JSON:
{ "isAgri": true | false, "topic": "1-3 words" }

Examples NOT agri: "tell me a joke", "how to code in python", "who won the cricket match", "draw me a logo", "translate this to french".
Examples YES agri: "wheat rust treatment", "best fertilizer for cotton", "when to plant rice in punjab", "milk yield per buffalo", "kissan card eligibility".`;

  try {
    const text = await callGeminiWithFallback(async (modelName) => {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0, maxOutputTokens: 80, responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    });
    const data = extractJSON(text);
    if (data && typeof data.isAgri === 'boolean') return { ...data, source: 'gemini-gate' };
  } catch (err) {
    console.warn('[AI-GATE] Text gate failed, allowing through:', err.message);
  }
  return { isAgri: true, source: 'gate-error' };
};

/**
 * Identify crop from an image (uses Gemini Vision)
 */
exports.identifyCrop = async (imageBuffer, mimeType = 'image/jpeg', language = 'en') => {
  const client = getClient();
  if (!client) return null;

  const prompt = `You are a Pakistani agriculture expert. Look at this crop image and identify it.

Return ONLY valid JSON:
{
  "cropName": "English name of crop",
  "cropNameUrdu": "اردو نام",
  "scientificName": "Latin name",
  "category": "grain | vegetable | fruit | fiber | oilseed | spice | pulse | other",
  "confidence": 0-100,
  "growthStage": "seedling | vegetative | flowering | fruiting | mature | harvested | unknown",
  "isHealthy": true | false,
  "healthNotes": "Visual health assessment in English (2-3 sentences)",
  "healthNotesUrdu": "صحت کا اندازہ اردو میں",
  "growingTips": "Brief growing tips in English specific to Pakistan",
  "growingTipsUrdu": "اگانے کے ٹِپس اردو میں",
  "commonDiseases": ["disease 1", "disease 2", "disease 3"]
}

If image does NOT show a crop, return: {"cropName": "Not a crop", "confidence": 0, "healthNotes": "The image does not show a recognizable crop."}`;

  let lastErr;
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json'
        }
      });
      const result = await model.generateContent([
        { inlineData: { data: imageBuffer.toString('base64'), mimeType } },
        prompt
      ]);
      const data = extractJSON(result.response.text().trim());
      if (data && data.cropName) return data;
    } catch (err) {
      lastErr = err;
      if (!/(503|429|overload)/.test(err.message || '')) break;
    }
  }
  console.error('[AI] Crop ID error:', lastErr?.message);
  return null;
};
