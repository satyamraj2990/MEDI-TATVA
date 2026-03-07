const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { PDFParse } = require('pdf-parse');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

// Initialize Gemini API - using dedicated key for report analyzer
const geminiApiKey = process.env.GEMINI_REPORT_ANALYZER_KEY || process.env.GEMINI_API_KEY;

// Analyze medical report using OCR and Gemini AI
router.post('/analyze', upload.single('report'), async (req, res) => {
  console.log('📨 Report analyzer - Analyze request received');
  
  try {
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    console.log('📄 Processing medical report:', req.file.originalname);
    console.log('📎 File type:', req.file.mimetype);
    console.log('📏 File size:', (req.file.size / 1024).toFixed(2), 'KB');

    // Step 1: Extract text based on file type
    const filePath = req.file.path;
    let text = '';

    if (req.file.mimetype === 'application/pdf') {
      // Extract text from PDF
      console.log('📑 Extracting text from PDF...');
      const dataBuffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      text = result.text;
      console.log('✅ PDF text extracted, length:', text.length);
    } else {
      // Extract text from image using Tesseract OCR
      console.log('🔍 Extracting text using OCR...');
      const { data: { text: extractedText } } = await Tesseract.recognize(filePath, 'eng', {
        logger: info => {
          if (info.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        }
      });
      text = extractedText;
      console.log('✅ Text extracted, length:', text.length);
    }

    if (!text || text.trim().length < 10) {
      throw new Error('No text could be extracted from the file. Please upload a clearer image or PDF.');
    }

    // Step 2: Analyze with Gemini AI (using dedicated key)
    if (!geminiApiKey) {
      throw new Error('GEMINI_REPORT_ANALYZER_KEY or GEMINI_API_KEY not configured');
    }

    console.log('🤖 Analyzing report with Gemini AI...');

    const prompt = `You are a medical report analyzer. Analyze this medical report text and extract structured data in JSON format.

Medical Report Text:
${text}

Extract and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "patientInfo": {
    "name": "Patient name from report or 'Patient' if not found",
    "age": number or null,
    "gender": "Male/Female/Other" or null,
    "bloodGroup": "Blood group" or null,
    "reportDate": "YYYY-MM-DD" or today's date,
    "reportType": "Type of report" or "Health Panel",
    "healthScore": number 0-100 based on overall health
  },
  "vitalSigns": {
    "bloodPressure": {"value": "120/80", "status": "normal/attention", "trend": "+2.3%"},
    "heartRate": {"value": "72 bpm", "status": "normal/attention", "trend": "-1.5%"},
    "temperature": {"value": "98.6°F", "status": "normal/attention", "trend": "0%"},
    "oxygenLevel": {"value": "98%", "status": "normal/attention", "trend": "+0.5%"}
  },
  "testResults": [
    {
      "name": "Test name",
      "result": number,
      "unit": "unit",
      "range": "normal range",
      "status": "normal/attention/critical",
      "cause": "Brief explanation",
      "context": "Health context",
      "tips": "Recommendations"
    }
  ],
  "healthScore": {
    "overall": number 0-100,
    "cardiovascular": number 0-100,
    "metabolic": number 0-100,
    "respiratory": number 0-100,
    "immunity": number 0-100
  },
  "aiSummary": "Overall health summary paragraph",
  "recommendations": [
    {"text": "Recommendation text", "priority": "high/medium"}
  ],
  "lifestyleTips": [
    {"emoji": "emoji", "text": "Lifestyle tip"}
  ]
}

If test data is not found in the report, make reasonable medical estimates based on standard health metrics. Ensure all numbers are realistic medical values.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    console.log('✅ AI Analysis complete');

    // Parse JSON from response (remove markdown code blocks if present)
    let analysisData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        analysisData = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI response was not valid JSON');
    }

    // Add icons to recommendations and lifestyle tips
    const iconMap = {
      'heart': '❤️', 'exercise': '🏃', 'food': '🥗', 'water': '💧',
      'sleep': '😴', 'stress': '🧘', 'medicine': '💊', 'doctor': '👨‍⚕️'
    };

    analysisData.recommendations = analysisData.recommendations.map(rec => ({
      ...rec,
      icon: 'Heart' // Will be converted to React icon on frontend
    }));

    // Clean up uploaded file
    await fs.unlink(filePath);
    console.log('🗑️ Temporary file cleaned up');

    console.log('✅ Analysis complete, sending response');
    res.json({
      success: true,
      extractedText: text.substring(0, 500), // First 500 chars for preview
      analysis: analysisData
    });

  } catch (error) {
    console.error('❌ Report analysis error:', error.message);
    console.error('Stack:', error.stack);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }

    // Check for quota exceeded error
    if (error.response?.data?.error?.code === 429) {
      return res.status(429).json({ 
        success: false,
        error: 'API quota exceeded',
        details: 'Gemini API quota has been exceeded. Please wait or upgrade your API plan.',
        message: error.response.data.error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to analyze report',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Report Analyzer API is running' });
});

// New Vision-based analysis endpoint (uses Gemini Vision API directly with images)
router.post('/analyze-vision', upload.single('report'), async (req, res) => {
  console.log('📨 Vision-based report analyzer - Request received');
  
  try {
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    console.log('📄 Processing medical report:', req.file.originalname);
    console.log('📎 File type:', req.file.mimetype);
    console.log('📏 File size:', (req.file.size / 1024).toFixed(2), 'KB');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Read file and convert to base64
    const filePath = req.file.path;
    const fileBuffer = await fs.readFile(filePath);
    const base64Data = fileBuffer.toString('base64');
    
    console.log('✅ File converted to base64, length:', base64Data.length);

    // Prepare prompt for Gemini Vision
    const prompt = `Analyze this medical report image and extract health data. Return ONLY valid JSON (no markdown):

{
  "patientInfo": {
    "name": "Patient",
    "age": 30,
    "gender": "Male",
    "bloodGroup": "O+",
    "reportDate": "2026-02-16",
    "reportType": "Blood Test",
    "healthScore": 85
  },
  "vitalSigns": {
    "bloodPressure": { "value": "120/80", "status": "normal", "trend": "0%" },
    "heartRate": { "value": "72 bpm", "status": "normal", "trend": "0%" },
    "temperature": { "value": "98.6°F", "status": "normal", "trend": "0%" },
    "oxygenLevel": { "value": "98%", "status": "normal", "trend": "0%" }
  },
  "reportComparisons": [
    {
      "name": "Test name",
      "result": 14,
      "unit": "g/dL",
      "range": "13-17",
      "status": "normal",
      "cause": "Brief explanation",
      "context": "Health context",
      "tips": "Recommendations",
      "bodyPart": "blood"
    }
  ],
  "bodyMapping": {
    "head": {"status": "normal", "issues": []},
    "heart": {"status": "normal", "issues": []},
    "lungs": {"status": "normal", "issues": []},
    "liver": {"status": "normal", "issues": []},
    "kidneys": {"status": "normal", "issues": []},
    "stomach": {"status": "normal", "issues": []},
    "bones": {"status": "normal", "issues": []},
    "blood": {"status": "normal", "issues": []},
    "thyroid": {"status": "normal", "issues": []},
    "muscles": {"status": "normal", "issues": []}
  },
  "healthScore": {
    "overall": 85,
    "cardiovascular": 85,
    "metabolic": 85,
    "respiratory": 85,
    "immunity": 85
  },
  "aiSummary": "Health summary",
  "recommendations": [
    { "text": "Stay healthy", "priority": "medium", "category": "lifestyle" }
  ],
  "lifestyleTips": [
    { "emoji": "🥗", "text": "Eat well" }
  ],
  "criticalFindings": []
}

Extract actual values. Map tests to body parts. Use status: normal/attention/critical.`;

    console.log('🤖 Sending request to Gemini Vision API...');

    // Call Gemini Vision API (using gemini-2.5-flash for vision tasks)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: req.file.mimetype,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 8192
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 60 second timeout
      }
    );

    console.log('📦 Full API Response:', JSON.stringify(response.data, null, 2));
    
    if (!response.data.candidates || !response.data.candidates[0]) {
      console.error('❌ No candidates in response');
      throw new Error('No valid response from Gemini API');
    }
    
    const candidate = response.data.candidates[0];
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.warn('⚠️ Response finish reason:', candidate.finishReason);
    }

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    console.log('✅ AI Vision Analysis complete, response length:', aiResponse.length);
    console.log('📄 Full AI Response:', aiResponse);

    // Parse JSON from response
    let analysisData;
    try {
      // Remove markdown code blocks if present
      let jsonText = aiResponse.trim();
      
      // Try to extract JSON from markdown code blocks
      if (jsonText.includes('```json')) {
        const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) jsonText = match[1].trim();
      } else if (jsonText.includes('```')) {
        const match = jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (match) jsonText = match[1].trim();
      }
      
      // Find the outermost complete JSON object
      const startIndex = jsonText.indexOf('{');
      const lastIndex = jsonText.lastIndexOf('}');
      
      if (startIndex === -1 || lastIndex === -1) {
        throw new Error('No JSON object found in response');
      }
      
      jsonText = jsonText.substring(startIndex, lastIndex + 1);
      
      console.log('🔍 Attempting to parse JSON, length:', jsonText.length);
      analysisData = JSON.parse(jsonText);
      
      console.log('✅ Successfully parsed JSON response');
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.error('Full AI Response:', aiResponse);
      throw new Error('AI response was not valid JSON: ' + parseError.message);
    }

    // Ensure bodyMapping exists
    if (!analysisData.bodyMapping) {
      analysisData.bodyMapping = {
        head: { status: "normal", issues: [] },
        heart: { status: "normal", issues: [] },
        lungs: { status: "normal", issues: [] },
        liver: { status: "normal", issues: [] },
        kidneys: { status: "normal", issues: [] },
        stomach: { status: "normal", issues: [] },
        bones: { status: "normal", issues: [] },
        blood: { status: "normal", issues: [] },
        thyroid: { status: "normal", issues: [] },
        muscles: { status: "normal", issues: [] }
      };
    }

    // Clean up uploaded file
    await fs.unlink(filePath);
    console.log('🗑️ Temporary file cleaned up');

    console.log('✅ Vision analysis complete, sending response');
    res.json({
      success: true,
      analysis: analysisData
    });

  } catch (error) {
    console.error('❌ Vision analysis error:', error.message);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    }
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }

    // Handle specific errors
    if (error.response?.status === 429 || error.message?.includes('quota')) {
      return res.status(429).json({ 
        success: false,
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please wait or upgrade your API plan.'
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid request',
        message: error.response?.data?.error?.message || 'Invalid API request. Please check your API key.'
      });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        success: false,
        error: 'Service unavailable',
        message: 'Cannot reach Gemini API. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to analyze report',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

module.exports = router;
