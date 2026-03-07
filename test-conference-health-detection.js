#!/usr/bin/env node

/**
 * 🧪 HEALTH QUERY DETECTION TEST
 * Tests MediSaarthi conference mode health query detection logic
 */

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  🧪 MEDISAARTHI CONFERENCE - HEALTH QUERY DETECTION TEST ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Health Query Detection Function (same as in voiceCall.js)
function detectHealthQuery(text) {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Health/Medical keywords (comprehensive list)
  const healthKeywords = [
    // Symptoms
    'dard', 'pain', 'ache', 'bukhar', 'fever', 'tap', 'thanda', 'cold', 'khansi', 'cough',
    'headache', 'sir', 'sar', 'pet', 'stomach', 'ulti', 'vomit', 'loose motion', 'diarrhea',
    'chakkar', 'dizzy', 'weakness', 'kamzori', 'thakaan', 'tired', 'sans', 'breathing',
    'dil', 'heart', 'chest', 'naak', 'nose', 'gala', 'throat', 'khara', 'khaaj', 'itch',
    'swelling', 'sujan', 'rash', 'allergy', 'infection', 'jalan', 'burning',
    
    // Diseases
    'diabetes', 'sugar', 'shakkar', 'bp', 'blood pressure', 'thyroid', 'asthma', 'dama',
    'cancer', 'tuberculosis', 'tb', 'malaria', 'dengue', 'typhoid', 'cholesterol',
    'arthritis', 'kidney', 'liver', 'heart', 'pneumonia', 'covid', 'corona',
    
    // Medicine related
    'dawai', 'medicine', 'tablet', 'capsule', 'syrup', 'dawa', 'injection', 'dose',
    'paracetamol', 'aspirin', 'antibiotic', 'prescription', 'doctor',
    
    // Body parts
    'kamar', 'back', 'pair', 'leg', 'hath', 'hand', 'aankh', 'eye', 'kan', 'ear',
    
    // Health queries
    'health', 'swasthya', 'bimar', 'sick', 'ill', 'problem', 'issue', 'treatment', 'upchar',
    'hospital', 'clinic', 'checkup', 'test', 'report', 'diagnosis'
  ];
  
  // Check if text contains any health keyword
  const containsHealthKeyword = healthKeywords.some(keyword => lowerText.includes(keyword));
  
  // Return true ONLY if contains health keyword
  // This prevents AI from responding to normal chat like "Hello, kaise ho?"
  return containsHealthKeyword;
}

// Test Cases
const testCases = [
  // ✅ SHOULD DETECT (Health Queries)
  { text: 'Mujhe sir dard ho raha hai', expected: true },
  { text: 'Bukhar 102 hai, kya karoon?', expected: true },
  { text: 'BP high hai koi dawai batao', expected: true },
  { text: 'Pet mein dard hai', expected: true },
  { text: 'Diabetes ke liye kya khana chahiye', expected: true },
  { text: 'Khansi nahi ja rahi upay batao', expected: true },
  { text: 'Headache hai 3 din se', expected: true },
  { text: 'Sugar level kitna hona chahiye?', expected: true },
  { text: 'I have a fever', expected: true },
  { text: 'My stomach hurts', expected: true },
  { text: 'Doctor ki appointment kab hai', expected: true },
  { text: 'Paracetamol ki dose batao', expected: true },
  { text: 'Thyroid ki medicine chahiye', expected: true },
  { text: 'Aankh mein jalan ho rahi hai', expected: true },
  { text: 'Kamar mein dard hai', expected: true },
  
  // ❌ SHOULD NOT DETECT (Normal Conversation)
  { text: 'Hello, kaise ho?', expected: false },
  { text: 'Weather kaisa hai aaj?', expected: false },
  { text: 'Aap kahan se bol rahe ho?', expected: false },
  { text: 'Mera naam Rahul hai', expected: false },
  { text: 'Cricket match dekha kya?', expected: false },
  { text: 'Office kab ja rahe ho?', expected: false },
  { text: 'Aaj kya khaya?', expected: false },
  { text: 'Movie dekhne chalein?', expected: false },
  { text: 'Aapka phone number kya hai?', expected: false },
  { text: 'Time kya hua hai?', expected: false }
];

// Run Tests
let passed = 0;
let failed = 0;

console.log('Running tests...\n');

testCases.forEach((testCase, index) => {
  const result = detectHealthQuery(testCase.text);
  const isCorrect = result === testCase.expected;
  
  if (isCorrect) {
    passed++;
    console.log(`✅ Test ${index + 1}: PASS`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: FAIL`);
    console.log(`   Text: "${testCase.text}"`);
    console.log(`   Expected: ${testCase.expected ? 'DETECT' : 'IGNORE'}`);
    console.log(`   Got: ${result ? 'DETECT' : 'IGNORE'}`);
  }
  console.log(`   Query: "${testCase.text}"`);
  console.log(`   Result: ${result ? '🏥 HEALTH QUERY → AI will respond' : '💬 NORMAL CHAT → AI silent'}\n`);
});

// Summary
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 TEST RESULTS');
console.log('═══════════════════════════════════════════════════════════');
console.log(`✅ Passed: ${passed}/${testCases.length}`);
console.log(`❌ Failed: ${failed}/${testCases.length}`);
console.log(`📈 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
console.log('═══════════════════════════════════════════════════════════\n');

if (failed === 0) {
  console.log('🎉 ALL TESTS PASSED! Health query detection is working perfectly.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Review the detection logic.\n');
  process.exit(1);
}
