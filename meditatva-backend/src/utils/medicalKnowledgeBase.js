// ════════════════════════════════════════════════════════════════════
// MEDICAL KNOWLEDGE BASE - Works Without External APIs
// Comprehensive Hindi medical guidance for common health issues
// ════════════════════════════════════════════════════════════════════

const medicalKnowledgeBase = {
  // Common symptoms and their detailed guidance
  symptoms: {
    'headache': {
      keywords: ['sir', 'sar', 'head', 'dard', 'mastisk', 'सिर', 'दर्द', 'headache', 'migraine', 'matha', 'माथा'],
      response: 'Sir dard usually stress, tension, lack of sleep, dehydration, eye strain ya sinus problem ki wajah se hota hai. Prevention ke liye din mein 7-8 ghante neend lein, computer screen se har ghante break lein, bharpur paani peeyein 2-3 liter daily. Aap ghar par aaram karein, dark quiet room mein rest lein, AC ki seedhi thandi hawa se bachein, screen time bilkul kam karein. Paracetamol 500mg har 6 ghante mein le sakte hain adult ko, din mein maximum 4 tablet, India mein bina prescription mil jati hai. Agar dard 3 din se zyada rahe, bahut tez ho like migraine, ya vomiting bhi ho toh ophthalmologist ya neurologist se zaroor milein kyunki yeh serious condition ho sakti hai. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'fever': {
      keywords: ['bukhar', 'fever', 'tap', 'garmi', 'temperature', 'बुखार', 'तापमान', 'tapeeman', 'garam'],
      response: 'Bukhar usually viral infection, seasonal flu, bacterial infection, malaria ya body mein kisi bhi inflammation ki wajah se hota hai. Prevention ke liye immunity badhane wale foods khayein jaise haldi wala doodh, tulsi ki chai, ginger, vitamin C fruits, aur personal hygiene maintain karein. Complete bed rest karein AC room mein 26-28 degree par, har 2 ghante mein paani ya coconut water ya glucose ORS peeyein, halka digestible khana khayein jaise khichdi, dal, soup, toast. Paracetamol 650mg adult ko har 6 ghante mein le sakte hain bina prescription ke, din mein maximum 4 tablet, aur mathe par thanda paani se patti rakhein. Agar bukhar 102 degree F se zyada ho, 3 din se zyada continue rahe, shivering severe body pain ho, ya rashes dikhein toh turant doctor se milein kyunki dengue, typhoid ya serious infection ho sakta hai blood test zaroori hai. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'stomach': {
      keywords: ['pet', 'stomach', 'acidity', 'gas', 'ulti', 'diarrhea', 'loose motion', 'पेट', 'उल्टी', 'vomit', 'motions', 'digest', 'पेट दर्द'],
      response: 'Pet ki problem usually improper diet, oily spicy food, contaminated water, stress, gastritis ya infection ki wajah se hoti hai. Prevention ke liye time par khana khayein 3 meals proper, oily spicy street food bilkul avoid karein, aur achhe se chewing karke khayein. Halka fresh home cooked khana khayein jaise khichdi dal chawal, oily masala spicy food completely avoid, bharpur boiled paani peeyein lekin khane ke turant saath nahi. Small frequent meals lein 5-6 baar choti quantity mein, late night eating band karein, khane ke baad 2 ghante tak sona avoid karein, hing jeera pudina ka paani helpful hai digestion ke liye. Simple antacids jaise Digene, Eno, Gelusil immediate relief ke liye le sakte hain bina prescription ke. Agar 2-3 din tak problem continue rahe, severe pain ho cramping, blood in stool dikhay, high fever ho ya continuous vomiting ho toh turant doctor se consult karein kyunki serious infection ya appendicitis bhi ho sakta hai. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'cough': {
      keywords: ['khansi', 'cough', 'throat', 'gala', 'khara', 'chest', 'खांसी', 'गला', 'khasi', 'coff', 'gale'],
      response: 'Khansi aur gale ki kharash usually viral infection, allergy, pollution, seasonal change, smoking ya throat irritation ki wajah se hoti hai. Prevention ke liye pollution dust se bachein mask pehein, immunity boosters khayein, smoking avoid karein. Garm paani mein aadhay chammach namak daalkar gargle karein din mein 4-5 baar, aadhay chammach shahad aur chutki bhar haldi garm doodh mein mix karke piyein sone se pehle, steam lein din mein 2-3 baar eucalyptus oil ke saath better results. Thanda paani bilkul mat peeyein, ice cream cold drinks soft drinks avoid karein, AC ki direct cold air se bachein. Simple honey based cough syrups jaise Benadryl, Cofsils lozenges bina prescription mil jati hain. Agar 5-7 din tak theek na ho, breathing difficulty ho, chest pain ho, blood in cough dikhay, ya high fever bhi ho toh pulmonologist ko dikhayein jo chest X-ray karke sahi antibiotic ya medicine prescribe karenge kyunki pneumonia, bronchitis ya TB bhi ho sakta hai. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'cold': {
      keywords: ['cold', 'sardi', 'thanda', 'naak', 'sneeze', 'runny nose'],
      response: 'Common cold usually viral infection ki wajah se hota hai, yeh weather change, low immunity, infected person se spread, ya AC ki direct cold air se hota hai. Prevention ke liye regular hand washing karein soap se, immunity boosting foods khayein vitamin C wale, sudden temperature changes se bachein. Complete bed rest karein proper 7-8 ghante neend, garm paani peeyein har 2 ghante mein, citrus fruits khayein jaise orange mosambi amla, steam inhalation lein eucalyptus oil ke saath, ginger tulsi honey wali chai piyein din mein 2-3 baar. Vitamin C tablets 500mg, simple antihistamines jaise Cetirizine 10mg, decongestant tablets bina prescription mil jati hain relief ke liye, aur saline nasal drops use kar sakte hain. Usually 5-7 din mein naturally thik ho jata hai. Agar 7 din baad bhi improve na ho, high fever continue rahe 101 plus, severe headache ho, breathing very difficult ho, ya ear pain bhi start ho toh ENT specialist ya physician ko dikhayein kyunki secondary bacterial infection, sinusitis ya ear infection develop ho sakta hai antibiotics zaroori ho sakti hain. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'diabetes': {
      keywords: ['diabetes', 'sugar', 'shakkar', 'madhume'],
      response: 'Diabetes ek chronic metabolic disorder hai jismein blood glucose level uncontrolled rahta hai, yeh unhealthy lifestyle, obesity, family history, lack of exercise ya insulin resistance ki wajah se hota hai. Prevention ke liye regular physical activity karein 30-45 minute daily, healthy weight maintain karein BMI normal range mein. Regular exercise zaroor karein walking jogging yoga 45 minute daily, refined sugar completely avoid karein processed foods, white rice maida cold drinks sweets bakery items band karein, green vegetables methi karela jamun khayein bharpur, oats brown rice quinoa whole grains lein, dry fruits almonds walnuts moderate quantity mein. Fasting blood sugar 100 se kam aur post meal PP 140 se kam normal hoti hai, regular monitoring karein glucometer se ghar par. Metformin 500mg ya 850mg diabetes ki common first line medicine hai jo insulin sensitivity improve karti hai, yeh prescription ke saath milti hai aur doctor ke guidance mein dose adjust hoti hai. Regular 3 mahine mein HbA1c test, kidney function test, eye checkup zaroori hai complications avoid karne ke liye. Agar sugar levels very high ya very low ho 400 plus ya 70 se kam, excessive thirst weight loss fatigue ho, vision blurring ho ya wound healing slow ho toh diabetologist endocrinologist se zaroor milein comprehensive management ke liye. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'blood_pressure': {
      keywords: ['bp', 'blood pressure', 'pressure', 'chakkar', 'dizzy', 'hypertension'],
      response: 'Blood pressure ya hypertension cardiovascular condition hai jismein arteries mein blood ka pressure badh jata hai, yeh stress, unhealthy diet excessive salt, obesity, lack of exercise, smoking alcohol ya genetic factors ki wajah se hota hai. Prevention ke liye daily exercise karein, weight control karein, smoking alcohol avoid karein. Regular morning walk ya exercise karein 30-45 minute, namak intake drastically kam karein 5 gram per day se kam, saturated fats trans fats avoid karein, oily fried processed packaged foods completely avoid. Fresh fruits especially banana citrus, green leafy vegetables, beetroot, garlic, nuts especially almonds walnuts khayein, stress management techniques practice karein meditation deep breathing yoga daily. Normal BP 120 by 80 hota hai, 140 by 90 se zyada consistently high maana jata hai, regular home BP monitoring karein digital BP machine se morning evening. Common antihypertensive medicines jaise Amlodipine, Telmisartan, Losartan doctor prescribe karte hain, yeh prescription medicines hain regular leni hoti hain kisi din skip nahi karni. Regular 3-6 mahine mein kidney function test, ECG, lipid profile karwayein complications prevent karne ke liye. Agar sudden severe headache ho, chest pain breathing difficulty ho, severe dizziness fainting ho, ya nosebleed repeatedly ho toh emergency hai turant 102 ambulance call karein ya hospital jaayein kyunki stroke heart attack ka risk hota hai immediate medical attention chahiye. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'thyroid': {
      keywords: ['thyroid', 'thyroi', 'thyroid problem'],
      response: 'Thyroid ek butterfly shaped gland hai neck ke front mein jo metabolism regulate karti hai thyroid hormones produce karke. Hypothyroid mein weight gain hota hai unexplained, constant fatigue feel hoti hai, cold intolerance thandi zyada lagti hai, hair fall skin dryness hoti hai. Hyperthyroid mein opposite symptoms hote hain weight loss despite good appetite, nervousness anxiety palpitations, heat intolerance sweating, tremors. Yeh hormonal imbalance, autoimmune conditions, iodine deficiency ya excess ki wajah se hota hai. Diagnosis ke liye blood tests zaroori hain TSH T3 T4 levels check karne, doctor se karvayein detailed thyroid profile. Iodized salt use karein daily cooking mein appropriate quantity, doctor ki prescribed medicine regularly lein bilkul same time par daily, 3 mahine mein thyroid levels recheck karwayein dose adjustment ke liye. Levothyroxine hypothyroid ke liye aur Carbimazole hyperthyroid ke liye common medicines hain jo strictly prescription ke saath milti hain, dose patient specific hai self medication dangerous hai. Regular follow up zaroori hai endocrinologist ke saath, sudden weight changes ho 5kg plus minus, severe fatigue weakness ho, heart palpitations very fast ya slow ho, ya mood changes depression anxiety severe ho toh turant doctor se consult karein dose adjustment ya further investigations zaroori ho sakti hain. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    }
  },

  // Common medicines information - EXPANDED COVERAGE
  medicines: {
    'paracetamol': {
      keywords: ['paracetamol', 'crocin', 'dolo', 'calpol', 'para', 'dolo 650', 'crocin 500', 'fever tablet', 'bukhar ki tablet'],
      response: 'Paracetamol ek bahut common fever aur pain reliever medicine hai jo India mein easily available hai. Yeh primarily fever bukhar, headache sir dard, body pain, dental pain, period pain mein use hoti hai. Adult dose 500mg to 650mg har 6-8 ghante mein le sakte hain, maximum 4 gram yani 4000mg per day se zyada kabhi nahi leni chahiye. Children ko weight based dose deni hoti hai doctor se consult karke, bachon ke liye syrup available hai. India mein yeh over the counter bina prescription mil jati hai pharmacy se. Side effects rare hain agar proper dose lein, lekin overdose liver damage cause kar sakta hai bahut dangerous. Pregnant women aur breastfeeding mothers safe dose mein le sakti hain doctor ki advice se. Agar liver disease hai ya alcohol regularly lete hain toh doctor ko zaroor batayein. 3 din tak continuous lene ke baad bhi fever ya pain continue rahe toh doctor se milein underlying cause check karne. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'cetirizine': {
      keywords: ['cetirizine', 'cetrizin', 'allergy', 'zyrtec', 'allergy tablet', 'khaaj ki dawa', 'allergy medicine'],
      response: 'Cetirizine ek antihistamine anti-allergic medicine hai jo allergy symptoms control karti hai. Yeh primarily allergic rhinitis naak behna, seasonal allergies, skin allergies khaaj rashes, urticaria, eye watering itching mein use hoti hai. Adult dose 10mg din mein ek baar usually evening ya sone se pehle leni chahiye kyunki neend la sakti hai drowsiness hoti hai. India mein yeh over the counter easily mil jati hai pharmacy se Cetrizine, Okacet, Cetzine brand names se. Common side effects: drowsiness neend sleepiness, dry mouth khaaskar initial days mein, headache kabhi kabhi ho sakta hai. Precautions: gaadi car chalate waqt ya machinery operate karte waqt careful rahein kyunki alertness reduce ho sakti hai, alcohol ke saath avoid karein effect badh jata hai. Kidney problem hai toh doctor se dose adjustment ke baare mein poochein. Pregnant women aur lactating mothers doctor ki advice se hi lein safety studies limited hain. Long term use ke liye doctor se consult zaroor karein underlying allergy cause identify karne. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'amoxicillin': {
      keywords: ['amoxicillin', 'amoxycillin', 'mox', 'antibiotic', 'infection ki dawa'],
      response: 'Amoxicillin ek commonly prescribed antibiotic hai jo bacterial infections treat karti hai. Yeh respiratory infections jaise throat infection pneumonia, ear infections, urinary tract infections, skin infections mein use hoti hai. Adult dose usually 250mg to 500mg har 8 ghante mein ya 500mg to 875mg har 12 ghante mein hoti hai doctor ke prescription ke according. India mein yeh prescription medicine hai aur doctor ki guidance mein hi leni chahiye, full course complete karna zaroori hai 5-7 din ka usually. Common side effects: stomach upset diarrhea nausea ho sakta hai, kuch logo ko allergic reaction rash ho sakta hai. Agar severe diarrhea, rash, breathing difficulty ho toh turant doctor ko batayein. Pregnant women aur breastfeeding mothers doctor ki supervision mein le sakti hain. Self medication bilkul nahi karni chahiye kyunki antibiotic resistance ka risk hai aur galat use harmful ho sakta hai. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'azithromycin': {
      keywords: ['azithromycin', 'azithro', 'azee', 'z pack', 'zithromax'],
      response: 'Azithromycin ek macrolide antibiotic hai jo various bacterial infections treat karti hai. Yeh commonly respiratory infections, throat infections, skin infections, ear infections, sexually transmitted infections mein use hoti hai. Adult dose usually 500mg first day phir 250mg daily next 4 days total 5 din ka course hota hai, ya kabhi 500mg daily 3 din ka bhi hota hai condition ke hisaab se. India mein yeh strictly prescription medicine hai aur doctor ke guidance mein hi leni chahiye. Full course complete karna mandatory hai beech mein band nahi karna. Common side effects: stomach upset nausea diarrhea abdominal pain ho sakta hai. Agar severe diarrhea blood in stool ya chest pain palpitations ho toh turant doctor se contact karein. Food ke saath ya bina dono tarah le sakte hain. Self medication dangerous hai kyunki bacterial resistance develop ho sakta hai aur serious complications bhi ho sakte hain. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'pantoprazole': {
      keywords: ['pantoprazole', 'panto', 'pantocid', 'acidity tablet', 'acidity medicine'],
      response: 'Pantoprazole ek proton pump inhibitor medicine hai jo stomach mein acid production kam karti hai. Yeh primarily acidity, gastritis, GERD acid reflux, stomach ulcers, duodenal ulcers mein use hoti hai. Adult dose usually 40mg din mein ek baar khali pet morning breakfast se 30 minute pehle leni chahiye maximum effect ke liye. India mein yeh prescription medicine hai lekin commonly available hai. Common side effects: headache, diarrhea, stomach pain, nausea ho sakta hai kuch logo ko. Long term use bone fracture ka risk badha sakta hai aur magnesium level kam ho sakta hai isliye long term ke liye doctor monitoring zaroori hai. Pregnant women aur breastfeeding mothers doctor ki advice se hi lein. Agar 2 weeks tak use karne ke baad bhi acidity control nahi ho rahi ya severe pain chest pain ho toh doctor se detailed checkup karwayein underlying cause identify karne. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'ibuprofen': {
      keywords: ['ibuprofen', 'brufen', 'combiflam', 'pain killer', 'dard ki dawa'],
      response: 'Ibuprofen ek non-steroidal anti-inflammatory drug NSAID hai jo pain relief aur inflammation reduction karti hai. Yeh primarily headache, body pain, muscle pain, dental pain, menstrual cramps, arthritis pain, fever mein use hoti hai. Adult dose usually 200mg to 400mg har 6-8 ghante mein le sakte hain food ke saath, maximum 1200mg per day without doctor supervision. India mein yeh over the counter available hai lekin proper guidance mein lena better hai. Common side effects: stomach upset acidity gastritis ho sakta hai isliye hamesha food ke saath lein, long term use kidney ya liver problems ka risk hai. Agar stomach ulcer hai, kidney disease hai, heart disease hai, pregnancy mein hai especially third trimester ya bleeding disorder hai toh avoid karein ya doctor se consult karein. Aspirin allergy wale patients ibuprofen se bhi allergic ho sakte hain. 10 din se zyada continuously lene ki zaroorat ho toh doctor se milein. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    },
    'ors': {
      keywords: ['ors', 'oral rehydration', 'electral', 'dehydration', 'loose motion solution'],
      response: 'ORS yani Oral Rehydration Solution ek bahut important fluid hai jo dehydration treat karta hai especially diarrhea loose motion ya vomiting mein. Yeh body mein water aur essential electrolytes sodium potassium chloride restore karta hai. Adult aur children dono use kar sakte hain, ek packet ko 1 liter clean boiled cooled drinking water mein dissolve karke peena hota hai. India mein yeh easily available hai pharmacy se bina prescription, brands jaise Electral, ORS powder. Use karne ka tarika: jitna loose motion ya vomiting ho utna zyada ORS peete rahein, adults ko 200-400ml har baar loose motion ke baad, children ko weight ke according. Room temperature par 24 ghante tak use kar sakte hain prepared solution ko. Side effects generally nahi hote, safe hai. Agar severe dehydration hai jaise very weak feel ho raha, urine bilkul kam ho gayi, consciousness loss ho raha toh turant hospital jaayein IV fluids ki zaroorat ho sakti hai. Prevention ke liye bhi travel mein ya illness mein ORS stock mein rakhein. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    }
  },

  // Generic health advice - Encourage specific queries without listing diseases
  general: {
    response: 'Main aapki swasthya sambandhit madad karne ki puri koshish karungi. Aap mujhse kisi bhi symptom, bimari, ya medicine ke baare mein Hindi mein pooch sakte hain. Main practical guidance dena chahti hoon. Kya aapko koi specific health concern ya medicine ke baare mein jaanna hai? Kya main aapki kisi specific swasthya sambandhit sawal mein madad kar sakti hoon?'
  }
};

// Function to find best matching response
function getMedicalResponse(userQuery) {
  const query = userQuery.toLowerCase().trim();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 MEDICAL KNOWLEDGE BASE - KEYWORD MATCHING');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 User Query:', userQuery);
  console.log('🔤 Normalized Query:', query);
  console.log('📏 Query Length:', query.length);
  
  // Check symptoms with detailed logging
  let matchAttempts = 0;
  for (const [symptom, data] of Object.entries(medicalKnowledgeBase.symptoms)) {
    for (const keyword of data.keywords) {
      matchAttempts++;
      const normalizedKeyword = keyword.toLowerCase();
      if (query.includes(normalizedKeyword)) {
        console.log(`✅ ✅ ✅ MATCH FOUND! ✅ ✅ ✅`);
        console.log(`   Symptom Category: ${symptom}`);
        console.log(`   Matched Keyword: "${keyword}"`);
        console.log(`   Match Attempts: ${matchAttempts}`);
        console.log(`   Response Length: ${data.response.length} chars`);
        console.log('═══════════════════════════════════════════════════════════\n');
        return data.response;
      }
    }
  }
  console.log(`❌ No symptom match found (checked ${matchAttempts} keywords)`);
  
  // Check medicines with detailed logging
  matchAttempts = 0;
  for (const [medicine, data] of Object.entries(medicalKnowledgeBase.medicines)) {
    for (const keyword of data.keywords) {
      matchAttempts++;
      const normalizedKeyword = keyword.toLowerCase();
      if (query.includes(normalizedKeyword)) {
        console.log(`✅ ✅ ✅ MATCH FOUND! ✅ ✅ ✅`);
        console.log(`   Medicine: ${medicine}`);
        console.log(`   Matched Keyword: "${keyword}"`);
        console.log(`   Match Attempts: ${matchAttempts}`);
        console.log(`   Response Length: ${data.response.length} chars`);
        console.log('═══════════════════════════════════════════════════════════\n');
        return data.response;
      }
    }
  }
  console.log(`❌ No medicine match found (checked ${matchAttempts} keywords)`);
  
  // IMPORTANT: For non-matching queries, return general guidance
  // The LLM will handle medicine queries not in the knowledge base
  console.log('⚠️  No exact keyword match found in Medical Knowledge Base');
  console.log('📤 Returning general health guidance - LLM will handle dynamic medicine queries');
  console.log('═══════════════════════════════════════════════════════════\n');
  return medicalKnowledgeBase.general.response;
}

module.exports = {
  medicalKnowledgeBase,
  getMedicalResponse
};
