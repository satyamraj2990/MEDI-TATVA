const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('API Key loaded:', process.env.GEMINI_API_KEY ? `Yes (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : 'NO - MISSING!');

const modelNames = [
  'gemini-pro',
  'gemini-1.5-pro', 
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash-exp'
];

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'OK' if you can read this.");
    const response = result.response.text();
    console.log(`✅ ${modelName}: WORKS - Response: ${response.substring(0, 50)}`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName}: FAILED - ${error.message.substring(0, 100)}`);
    return false;
  }
}

async function testAllModels() {
  console.log('Testing Gemini models...\n');
  for (const modelName of modelNames) {
    await testModel(modelName);
  }
}

testAllModels();
