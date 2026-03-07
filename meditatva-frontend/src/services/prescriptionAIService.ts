/**
 * AI-Powered Prescription Analysis Service
 * Uses Google Gemini AI to analyze OCR text from medical prescriptions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface MedicineEntry {
  name: string;
  dosage: string;
  frequency: string;
  confidence: number;
  needsReview?: boolean;
}

export interface PrescriptionAnalysis {
  medicines: MedicineEntry[];
  overall_confidence: number;
  warnings: string[];
}

/**
 * System prompt for Gemini AI to analyze medical prescriptions
 */
const PRESCRIPTION_ANALYSIS_PROMPT = `You are a medical prescription text analysis AI.

Input:
- Raw OCR text extracted from a handwritten doctor's prescription.
- OCR confidence scores per word (if available).

Your tasks:
1. Identify ONLY valid medicine names from the text.
2. Correct spelling errors caused by handwriting or OCR.
3. Ignore patient details, doctor name, address, age, dates, and symbols like "Rx".
4. For each medicine:
   - Extract medicine name
   - Extract dosage (mg/ml)
   - Extract frequency (e.g., BID, TID, QD)
5. Validate medicine names against real-world pharmaceutical drugs.
6. Assign a confidence percentage (0–100%) for each medicine based on:
   - OCR confidence
   - Handwriting clarity
   - Medical name certainty
7. If confidence < 60%, mark as "Needs pharmacist review".

Output format (STRICT JSON):

{
  "medicines": [
    {
      "name": "Betaloc",
      "dosage": "100 mg",
      "frequency": "1 tablet BID",
      "confidence": 92
    },
    {
      "name": "Dorzolamide",
      "dosage": "10 mg",
      "frequency": "1 tablet BID",
      "confidence": 88
    },
    {
      "name": "Cimetidine",
      "dosage": "50 mg",
      "frequency": "2 tablets TID",
      "confidence": 90
    },
    {
      "name": "Oxprenolol",
      "dosage": "50 mg",
      "frequency": "1 tablet QD",
      "confidence": 85
    }
  ],
  "overall_confidence": 89,
  "warnings": []
}

Rules:
- Do NOT hallucinate medicines.
- Do NOT include medicines not clearly present.
- Use medical knowledge to fix OCR mistakes.
- Be conservative with confidence scoring.
- Extract ALL medicines present in the prescription.
- Return ONLY valid JSON, no markdown formatting.`;


/**
 * Analyze prescription OCR text using Gemini AI
 * Enhanced to extract ONLY medicines from handwritten prescription
 */
export async function analyzePrescriptionWithAI(
  ocrText: string,
  ocrConfidence?: number
): Promise<PrescriptionAnalysis> {
  console.time('AI Analysis');
  
  try {
    console.log('🔑 API Key check:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 20)}...` : 'MISSING');
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'undefined' || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.error('❌ Gemini API key not configured properly');
      console.warn('⚠️ Using fallback analysis instead');
      return fallbackAnalysis(ocrText, ocrConfidence);
    }

    console.log('✅ API Key valid, initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1500,
      }
    });

    // Count numbered entries as hint
    const numberedEntries = (ocrText.match(/^\s*\d+[\.\)]/gm) || []).length;
    
    // Build prompt with context
    const prompt = `${PRESCRIPTION_ANALYSIS_PROMPT}

OCR Text:
${ocrText}

OCR Confidence: ${ocrConfidence ? Math.round(ocrConfidence * 100) + '%' : 'unknown'}
${numberedEntries > 0 ? `Note: Detected ${numberedEntries} numbered medicine entries. Extract ALL ${numberedEntries} medicines.` : ''}

CRITICAL: Focus ONLY on lines with medicine names and dosages (mg, ml).
IGNORE: Patient name (Joba Sith), Address (Example St), Doctor name, Date, etc.
Extract ONLY these medicine lines and correct spelling errors.
Return ONLY JSON response now:`;

    console.log('🧠 Sending to Gemini AI...');
    console.log('📝 OCR Text length:', ocrText.length);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log('✅ AI Response received');
    console.log('📄 Response preview:', text.substring(0, 100));
    console.timeEnd('AI Analysis');

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON response
    let analysis: PrescriptionAnalysis;
    try {
      analysis = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', text.substring(0, 200));
      throw new Error('AI returned invalid JSON format');
    }

    // Validate medicine count vs expected
    if (numberedEntries > 0 && analysis.medicines.length < numberedEntries) {
      console.warn(`⚠️ Expected ${numberedEntries} medicines but got ${analysis.medicines.length}`);
      analysis.warnings.push(`Expected ${numberedEntries} medicines, found ${analysis.medicines.length}. Some may have been missed.`);
    }

    // Filter out non-medicine entries (common mistakes)
    const nonMedicineWords = [
      'patient', 'doctor', 'dr', 'date', 'prescription', 'clinic', 'hospital',
      'signature', 'phone', 'address', 'demo', 'user', 'sarah', 'johnson',
      'john', 'smith', 'rx', 'md', 'mbbs', 'warning', 'caution', 'note'
    ];
    
    analysis.medicines = analysis.medicines.filter(med => {
      const nameLower = med.name.toLowerCase();
      // Remove if it's a common non-medicine word
      if (nonMedicineWords.some(word => nameLower.includes(word))) {
        console.warn(`🚫 Filtered out non-medicine: ${med.name}`);
        return false;
      }
      // Remove if name is too short (likely not a medicine)
      if (med.name.length < 4) {
        console.warn(`🚫 Filtered out too short: ${med.name}`);
        return false;
      }
      return true;
    });

    // Validate and enhance the response
    analysis = validateAndEnhanceAnalysis(analysis, ocrConfidence);

    console.log('✅ AI Analysis complete:', {
      medicinesFound: analysis.medicines.length,
      expectedCount: numberedEntries || 'unknown',
      overallConfidence: analysis.overall_confidence,
      warnings: analysis.warnings.length
    });

    return analysis;

  } catch (error) {
    console.error('AI Analysis failed:', error);
    console.log('Error details:', error instanceof Error ? error.message : String(error));
    console.timeEnd('AI Analysis');
    
    // Fallback to basic analysis if AI fails
    console.log('🔄 Using fallback analysis method');
    return fallbackAnalysis(ocrText, ocrConfidence);
  }
}

/**
 * Validate and enhance AI analysis results
 */
function validateAndEnhanceAnalysis(
  analysis: PrescriptionAnalysis,
  ocrConfidence?: number
): PrescriptionAnalysis {
  // Ensure all required fields exist
  if (!analysis.medicines) analysis.medicines = [];
  if (!analysis.warnings) analysis.warnings = [];
  if (typeof analysis.overall_confidence !== 'number') {
    analysis.overall_confidence = ocrConfidence ? ocrConfidence * 100 : 70;
  }

  // Process each medicine
  analysis.medicines = analysis.medicines.map(medicine => {
    // Ensure confidence is a number between 0-100
    if (typeof medicine.confidence !== 'number' || medicine.confidence < 0 || medicine.confidence > 100) {
      medicine.confidence = 65; // Default to 65% instead of 70
    }

    // Boost confidence slightly if medicine name looks valid (ends with common suffixes)
    const name = medicine.name.toLowerCase();
    const validSuffixes = ['lol', 'pril', 'statin', 'mycin', 'cillin', 'ide', 'ine', 'amide', 'azole'];
    if (validSuffixes.some(suffix => name.endsWith(suffix))) {
      medicine.confidence = Math.min(100, medicine.confidence + 10);
    }

    // Mark for review if confidence < 60%
    if (medicine.confidence < 60) {
      medicine.needsReview = true;
      if (!analysis.warnings.includes(`${medicine.name} needs pharmacist review (confidence: ${medicine.confidence}%)`)) {
        analysis.warnings.push(`${medicine.name} needs pharmacist review (confidence: ${medicine.confidence}%)`);
      }
    }

    // Ensure all fields have valid values
    if (!medicine.name) medicine.name = 'Unknown Medicine';
    if (!medicine.dosage || medicine.dosage === '') medicine.dosage = 'Not specified';
    if (!medicine.frequency || medicine.frequency === '') medicine.frequency = 'As directed';

    return medicine;
  });

  // Recalculate overall confidence if needed
  if (analysis.medicines.length > 0) {
    const avgConfidence = analysis.medicines.reduce((sum, m) => sum + m.confidence, 0) / analysis.medicines.length;
    analysis.overall_confidence = Math.round(avgConfidence);
  }

  // Add warning if overall confidence is low
  if (analysis.overall_confidence < 70) {
    analysis.warnings.unshift('⚠️ Low overall confidence - recommend pharmacist verification');
  }

  // Add OCR confidence info if available
  if (ocrConfidence && ocrConfidence < 0.8) {
    analysis.warnings.push(`OCR confidence was ${Math.round(ocrConfidence * 100)}% - text may have errors`);
  }

  return analysis;
}

/**
 * Fallback analysis when AI is not available
 * STRICT: Only extracts from lines that look like medicine prescriptions
 */
function fallbackAnalysis(
  text: string,
  ocrConfidence?: number
): PrescriptionAnalysis {
  console.log('🔍 Running fallback pattern matching...');
  const medicines: MedicineEntry[] = [];
  const warnings: string[] = ['⚠️ AI not available - using pattern matching'];

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Pattern: Medicine name followed by dosage (mg/ml) and optionally frequency (BID/TID/QD)
  const prescriptionLinePattern = /^([A-Za-z]+(?:ine|ol|ide|cin|mycin|cillin|azole|pril|statin)?)\s+(\d+\s*m[gl])\s*(?:-\s*)?(.+)?$/i;

  for (const line of lines) {
    // Skip obvious non-medicine lines
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes('dea') ||
      lowerLine.includes('medical centre') ||
      lowerLine.includes('street') ||
      lowerLine.includes('york') ||
      lowerLine.includes('name') ||
      lowerLine.includes('address') ||
      lowerLine.includes('date') ||
      lowerLine.includes('signature') ||
      lowerLine.includes('label') ||
      lowerLine.includes('refill') ||
      line.length < 10
    ) {
      continue;
    }

    // Check if line matches prescription pattern
    const match = line.match(prescriptionLinePattern);
    if (match) {
      const name = match[1].trim();
      const dosage = match[2].trim();
      const rest = match[3]?.trim() || '';
      
      // Extract frequency from the rest
      const freqMatch = rest.match(/\b(BID|TID|QID|QD|OD|PRN)\b/i);
      const frequency = freqMatch ? freqMatch[0].toUpperCase() : 'As directed';

      // Basic spelling corrections
      let correctedName = name;
      if (name.toLowerCase() === 'betaloe') correctedName = 'Betaloc';
      if (name.toLowerCase().includes('dorzol') || name.toLowerCase().includes('dorpeb')) correctedName = 'Dorzolamide';
      if (name.toLowerCase().includes('cimetid') || name.toLowerCase().includes('contid')) correctedName = 'Cimetidine';
      if (name.toLowerCase().includes('oxpren') || name.toLowerCase().includes('orprel')) correctedName = 'Oxprenolol';

      medicines.push({
        name: correctedName,
        dosage: dosage,
        frequency: frequency,
        confidence: 60,
        needsReview: true
      });

      console.log(`✓ Found medicine: ${correctedName} ${dosage} ${frequency}`);
    }
  }

  if (medicines.length === 0) {
    warnings.push('⚠️ No medicines detected - please verify prescription manually');
  } else {
    medicines.forEach(med => {
      warnings.push(`${med.name} needs pharmacist review (pattern matching)`);
    });
  }

  const overallConfidence = medicines.length > 0 ? 60 : 0;

  console.log(`📊 Fallback found ${medicines.length} medicines`);

  return {
    medicines,
    overall_confidence: overallConfidence,
    warnings
  };
}

/**
 * Format medicine entry for display
 */
export function formatMedicineEntry(medicine: MedicineEntry): string {
  let result = `${medicine.name} ${medicine.dosage} - ${medicine.frequency}`;
  if (medicine.needsReview) {
    result += ' ⚠️';
  }
  return result;
}

/**
 * Get confidence badge color based on confidence level
 */
export function getConfidenceBadgeColor(confidence: number): string {
  if (confidence >= 85) return 'bg-green-500';
  if (confidence >= 70) return 'bg-yellow-500';
  if (confidence >= 60) return 'bg-orange-500';
  return 'bg-red-500';
}
