/**
 * Seed Medicine Data for Testing Medicine Analyser
 * Run with: node seed-medicines.js
 */

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/meditatva', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Medicine Schema (same as model)
const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  genericName: { type: String, trim: true },
  brand: { type: String, trim: true },
  dosage: String,
  strength: String,
  form: { 
    type: String, 
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'],
    default: 'tablet'
  },
  activeIngredients: [String],
  price: { type: Number, required: true, min: 0 },
  requiresPrescription: { type: Boolean, default: false },
  description: String,
  uses: [String],
  dosageInstructions: String,
  sideEffects: [String],
  manufacturer: String,
  category: String,
  therapeuticClass: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Medicine = mongoose.model('Medicine', MedicineSchema);

// Sample Medicine Data
const sampleMedicines = [
  // Paracetamol variants
  {
    name: 'Crocin 500',
    genericName: 'Paracetamol',
    brand: 'Crocin',
    strength: '500mg',
    dosage: '15 tablets',
    form: 'tablet',
    activeIngredients: ['Paracetamol'],
    price: 20,
    requiresPrescription: false,
    uses: ['Fever', 'Headache', 'Body pain', 'Cold symptoms'],
    dosageInstructions: 'Adults: 1-2 tablets every 4-6 hours. Maximum 8 tablets in 24 hours',
    sideEffects: ['Nausea', 'Allergic reactions (rare)', 'Liver damage (overdose)'],
    manufacturer: 'GlaxoSmithKline',
    category: 'Pain Relief',
    therapeuticClass: 'Analgesic, Antipyretic',
    description: 'Effective fever and pain relief medication'
  },
  {
    name: 'Dolo 650',
    genericName: 'Paracetamol',
    brand: 'Dolo',
    strength: '650mg',
    dosage: '15 tablets',
    form: 'tablet',
    activeIngredients: ['Paracetamol'],
    price: 30,
    requiresPrescription: false,
    uses: ['Fever', 'Headache', 'Pain relief', 'Post-vaccination fever'],
    dosageInstructions: 'Adults: 1 tablet every 4-6 hours as needed. Maximum 4 tablets in 24 hours',
    sideEffects: ['Nausea', 'Allergic skin reactions', 'Stomach upset'],
    manufacturer: 'Micro Labs',
    category: 'Pain Relief',
    therapeuticClass: 'Analgesic, Antipyretic',
    description: 'Higher strength paracetamol for effective fever control'
  },
  {
    name: 'Calpol 500',
    genericName: 'Paracetamol',
    brand: 'Calpol',
    strength: '500mg',
    dosage: '10 tablets',
    form: 'tablet',
    activeIngredients: ['Paracetamol'],
    price: 15,
    requiresPrescription: false,
    uses: ['Fever', 'Mild to moderate pain', 'Headache'],
    dosageInstructions: 'Adults and children over 12: 1-2 tablets every 4-6 hours',
    sideEffects: ['Rare allergic reactions', 'Liver toxicity (overdose)'],
    manufacturer: 'GlaxoSmithKline',
    category: 'Pain Relief',
    therapeuticClass: 'Analgesic, Antipyretic'
  },
  
  // Cetirizine (Antiallergy)
  {
    name: 'Zyrtec 10mg',
    genericName: 'Cetirizine',
    brand: 'Zyrtec',
    strength: '10mg',
    dosage: '10 tablets',
    form: 'tablet',
    activeIngredients: ['Cetirizine Hydrochloride'],
    price: 85,
    requiresPrescription: false,
    uses: ['Allergic rhinitis', 'Hay fever', 'Urticaria', 'Skin allergies'],
    dosageInstructions: 'Adults and children over 6: 1 tablet once daily',
    sideEffects: ['Drowsiness', 'Dry mouth', 'Fatigue', 'Headache'],
    manufacturer: 'UCB India',
    category: 'Antihistamine',
    therapeuticClass: 'Antiallergic',
    description: 'Non-drowsy antihistamine for allergy relief'
  },
  {
    name: 'Cetrizine 10mg',
    genericName: 'Cetirizine',
    brand: 'Generic',
    strength: '10mg',
    dosage: '10 tablets',
    form: 'tablet',
    activeIngredients: ['Cetirizine Hydrochloride'],
    price: 25,
    requiresPrescription: false,
    uses: ['Allergic rhinitis', 'Urticaria', 'Itching', 'Skin rashes'],
    dosageInstructions: 'Adults: 1 tablet once daily, preferably in the evening',
    sideEffects: ['Drowsiness', 'Dry mouth', 'Dizziness'],
    manufacturer: 'Various',
    category: 'Antihistamine',
    therapeuticClass: 'Antiallergic'
  },

  // Antibiotics - Amoxicillin
  {
    name: 'Amoxil 500',
    genericName: 'Amoxicillin',
    brand: 'Amoxil',
    strength: '500mg',
    dosage: '10 capsules',
    form: 'capsule',
    activeIngredients: ['Amoxicillin'],
    price: 120,
    requiresPrescription: true,
    uses: ['Bacterial infections', 'Respiratory tract infections', 'Ear infections', 'Dental infections'],
    dosageInstructions: 'Adults: 500mg three times daily for 5-7 days',
    sideEffects: ['Diarrhea', 'Nausea', 'Skin rash', 'Allergic reactions'],
    manufacturer: 'GlaxoSmithKline',
    category: 'Antibiotic',
    therapeuticClass: 'Beta-lactam Antibiotic',
    description: 'Broad-spectrum penicillin antibiotic'
  },
  {
    name: 'Mox 500',
    genericName: 'Amoxicillin',
    brand: 'Mox',
    strength: '500mg',
    dosage: '15 capsules',
    form: 'capsule',
    activeIngredients: ['Amoxicillin'],
    price: 95,
    requiresPrescription: true,
    uses: ['Bacterial infections', 'UTI', 'Lower respiratory infections'],
    dosageInstructions: 'As directed by physician. Usually 500mg TDS for 5-7 days',
    sideEffects: ['Diarrhea', 'Vomiting', 'Allergic reactions'],
    manufacturer: 'Ranbaxy',
    category: 'Antibiotic',
    therapeuticClass: 'Beta-lactam Antibiotic'
  },

  // Ibuprofen (NSAID)
  {
    name: 'Brufen 400',
    genericName: 'Ibuprofen',
    brand: 'Brufen',
    strength: '400mg',
    dosage: '15 tablets',
    form: 'tablet',
    activeIngredients: ['Ibuprofen'],
    price: 55,
    requiresPrescription: false,
    uses: ['Pain relief', 'Inflammation', 'Fever', 'Arthritis', 'Menstrual cramps'],
    dosageInstructions: 'Adults: 400mg three times daily after meals',
    sideEffects: ['Stomach upset', 'Nausea', 'Heartburn', 'Dizziness'],
    manufacturer: 'Abbott',
    category: 'NSAID',
    therapeuticClass: 'Analgesic, Anti-inflammatory',
    description: 'Non-steroidal anti-inflammatory drug'
  },
  {
    name: 'Combiflam',
    genericName: 'Ibuprofen + Paracetamol',
    brand: 'Combiflam',
    strength: '400mg + 325mg',
    dosage: '20 tablets',
    form: 'tablet',
    activeIngredients: ['Ibuprofen', 'Paracetamol'],
    price: 45,
    requiresPrescription: false,
    uses: ['Severe pain', 'High fever', 'Dental pain', 'Post-operative pain'],
    dosageInstructions: 'Adults: 1 tablet every 6-8 hours. Maximum 3 tablets daily',
    sideEffects: ['Stomach upset', 'Nausea', 'Dizziness'],
    manufacturer: 'Sanofi',
    category: 'Pain Relief',
    therapeuticClass: 'Analgesic, Antipyretic',
    description: 'Combination pain relief medication'
  },

  // Antacid - Pantoprazole
  {
    name: 'Pan 40',
    genericName: 'Pantoprazole',
    brand: 'Pan',
    strength: '40mg',
    dosage: '15 tablets',
    form: 'tablet',
    activeIngredients: ['Pantoprazole'],
    price: 75,
    requiresPrescription: false,
    uses: ['Acidity', 'GERD', 'Peptic ulcer', 'Heartburn'],
    dosageInstructions: 'Adults: 1 tablet once daily before breakfast',
    sideEffects: ['Headache', 'Diarrhea', 'Nausea', 'Stomach pain'],
    manufacturer: 'Alkem Laboratories',
    category: 'Antacid',
    therapeuticClass: 'Proton Pump Inhibitor',
    description: 'Reduces stomach acid production'
  },
  {
    name: 'Pantocid 40',
    genericName: 'Pantoprazole',
    brand: 'Pantocid',
    strength: '40mg',
    dosage: '15 tablets',
    form: 'tablet',
    activeIngredients: ['Pantoprazole'],
    price: 110,
    requiresPrescription: false,
    uses: ['GERD', 'Peptic ulcer disease', 'Zollinger-Ellison syndrome'],
    dosageInstructions: '1 tablet once daily, 30 minutes before meal',
    sideEffects: ['Headache', 'Abdominal pain', 'Flatulence'],
    manufacturer: 'Sun Pharma',
    category: 'Antacid',
    therapeuticClass: 'Proton Pump Inhibitor'
  },

  // Diabetes - Metformin
  {
    name: 'Glycomet 500',
    genericName: 'Metformin',
    brand: 'Glycomet',
    strength: '500mg',
    dosage: '20 tablets',
    form: 'tablet',
    activeIngredients: ['Metformin Hydrochloride'],
    price: 35,
    requiresPrescription: true,
    uses: ['Type 2 Diabetes', 'PCOS', 'Insulin resistance'],
    dosageInstructions: 'As prescribed. Usually 500mg twice daily with meals',
    sideEffects: ['Diarrhea', 'Nausea', 'Stomach upset', 'Metallic taste'],
    manufacturer: 'USV',
    category: 'Antidiabetic',
    therapeuticClass: 'Biguanide',
    description: 'First-line treatment for type 2 diabetes'
  },
  {
    name: 'Metformin 500',
    genericName: 'Metformin',
    brand: 'Generic',
    strength: '500mg',
    dosage: '20 tablets',
    form: 'tablet',
    activeIngredients: ['Metformin Hydrochloride'],
    price: 25,
    requiresPrescription: true,
    uses: ['Type 2 Diabetes mellitus'],
    dosageInstructions: 'Take with meals to reduce GI side effects',
    sideEffects: ['Diarrhea', 'Nausea', 'Abdominal discomfort'],
    manufacturer: 'Various',
    category: 'Antidiabetic',
    therapeuticClass: 'Biguanide'
  },

  // Hypertension - Amlodipine
  {
    name: 'Amlip 5',
    genericName: 'Amlodipine',
    brand: 'Amlip',
    strength: '5mg',
    dosage: '15 tablets',
    form: 'tablet',
    activeIngredients: ['Amlodipine Besylate'],
    price: 45,
    requiresPrescription: true,
    uses: ['Hypertension', 'Angina', 'Coronary artery disease'],
    dosageInstructions: '5-10mg once daily',
    sideEffects: ['Edema', 'Headache', 'Flushing', 'Dizziness'],
    manufacturer: 'Cipla',
    category: 'Antihypertensive',
    therapeuticClass: 'Calcium Channel Blocker',
    description: 'Blood pressure control medication'
  },
  {
    name: 'Norvasc 5',
    genericName: 'Amlodipine',
    brand: 'Norvasc',
    strength: '5mg',
    dosage: '10 tablets',
    form: 'tablet',
    activeIngredients: ['Amlodipine Besylate'],
    price: 85,
    requiresPrescription: true,
    uses: ['High blood pressure', 'Chest pain (angina)'],
    dosageInstructions: 'Once daily, same time each day',
    sideEffects: ['Swelling of ankles', 'Fatigue', 'Palpitations'],
    manufacturer: 'Pfizer',
    category: 'Antihypertensive',
    therapeuticClass: 'Calcium Channel Blocker'
  },

  // Azithromycin (Antibiotic)
  {
    name: 'Azithral 500',
    genericName: 'Azithromycin',
    brand: 'Azithral',
    strength: '500mg',
    dosage: '3 tablets',
    form: 'tablet',
    activeIngredients: ['Azithromycin'],
    price: 90,
    requiresPrescription: true,
    uses: ['Respiratory infections', 'Skin infections', 'STDs', 'Ear infections'],
    dosageInstructions: '500mg once daily for 3 days',
    sideEffects: ['Diarrhea', 'Nausea', 'Abdominal pain'],
    manufacturer: 'Alembic Pharmaceuticals',
    category: 'Antibiotic',
    therapeuticClass: 'Macrolide Antibiotic',
    description: 'Broad-spectrum antibiotic'
  },
  {
    name: 'Zithromax 500',
    genericName: 'Azithromycin',
    brand: 'Zithromax',
    strength: '500mg',
    dosage: '3 tablets',
    form: 'tablet',
    activeIngredients: ['Azithromycin'],
    price: 150,
    requiresPrescription: true,
    uses: ['Bacterial infections', 'Pneumonia', 'Bronchitis'],
    dosageInstructions: 'As directed by physician',
    sideEffects: ['Upset stomach', 'Diarrhea', 'Vomiting'],
    manufacturer: 'Pfizer',
    category: 'Antibiotic',
    therapeuticClass: 'Macrolide Antibiotic'
  }
];

// Seed the database
async function seedDatabase() {
  try {
    console.log('🌱 Starting medicine database seeding...');
    
    // Clear existing medicines
    await Medicine.deleteMany({});
    console.log('✅ Cleared existing medicines');
    
    // Insert sample medicines
    const inserted = await Medicine.insertMany(sampleMedicines);
    console.log(`✅ Inserted ${inserted.length} medicines`);
    
    // Display summary
    console.log('\n📊 Medicine Database Summary:');
    const categories = await Medicine.aggregate([
      { $group: { _id: '$therapeuticClass', count: { $sum: 1 } } }
    ]);
    categories.forEach(cat => {
      console.log(`   - ${cat._id}: ${cat.count} medicines`);
    });
    
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Connect and seed
mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB');
  seedDatabase();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
