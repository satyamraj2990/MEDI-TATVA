require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('./src/models/Medicine');
const Inventory = require('./src/models/Inventory');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditatva';

const sampleMedicines = [
  {
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    brand: 'Crocin',
    dosage: '500mg',
    form: 'tablet',
    price: 25.00,
    requiresPrescription: false,
    category: 'Pain Relief',
    manufacturer: 'GSK',
    initialStock: 500
  },
  {
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    brand: 'Novamox',
    dosage: '250mg',
    form: 'capsule',
    price: 120.00,
    requiresPrescription: true,
    category: 'Antibiotic',
    manufacturer: 'Cipla',
    initialStock: 200
  },
  {
    name: 'Metformin 500mg',
    genericName: 'Metformin Hydrochloride',
    brand: 'Glycomet',
    dosage: '500mg',
    form: 'tablet',
    price: 180.00,
    requiresPrescription: true,
    category: 'Diabetes',
    manufacturer: 'USV',
    initialStock: 300
  },
  {
    name: 'Vitamin D3 60K',
    genericName: 'Cholecalciferol',
    brand: 'Calcirol',
    dosage: '60000 IU',
    form: 'capsule',
    price: 80.00,
    requiresPrescription: false,
    category: 'Vitamins',
    manufacturer: 'Cadila',
    initialStock: 150
  },
  {
    name: 'Azithromycin 500mg',
    genericName: 'Azithromycin',
    brand: 'Azithral',
    dosage: '500mg',
    form: 'tablet',
    price: 150.00,
    requiresPrescription: true,
    category: 'Antibiotic',
    manufacturer: 'Alembic',
    initialStock: 100
  },
  {
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    brand: 'Omez',
    dosage: '20mg',
    form: 'capsule',
    price: 95.00,
    requiresPrescription: false,
    category: 'Gastric',
    manufacturer: 'Dr. Reddy\'s',
    initialStock: 250
  },
  {
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine Hydrochloride',
    brand: 'Zyrtec',
    dosage: '10mg',
    form: 'tablet',
    price: 30.00,
    requiresPrescription: false,
    category: 'Allergy',
    manufacturer: 'UCB',
    initialStock: 400
  },
  {
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    brand: 'Brufen',
    dosage: '400mg',
    form: 'tablet',
    price: 45.00,
    requiresPrescription: false,
    category: 'Pain Relief',
    manufacturer: 'Abbott',
    initialStock: 350
  },
  {
    name: 'Atorvastatin 10mg',
    genericName: 'Atorvastatin',
    brand: 'Lipitor',
    dosage: '10mg',
    form: 'tablet',
    price: 140.00,
    requiresPrescription: true,
    category: 'Cardiovascular',
    manufacturer: 'Pfizer',
    initialStock: 180
  },
  {
    name: 'Insulin Glargine 100 Units',
    genericName: 'Insulin Glargine',
    brand: 'Lantus',
    dosage: '100 Units/mL',
    form: 'injection',
    price: 850.00,
    requiresPrescription: true,
    category: 'Diabetes',
    manufacturer: 'Sanofi',
    initialStock: 50
  }
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing medicines, inventory, and users...');
    await Medicine.deleteMany({});
    await Inventory.deleteMany({});
    await User.deleteMany({});

    // Create default users/pharmacists
    console.log('👥 Creating default users/pharmacists...');
    const defaultUsers = [
      {
        name: 'Default Pharmacist',
        email: 'pharmacist@meditatva.com',
        role: 'pharmacist',
        phone: '9876543210',
        isActive: true
      },
      {
        name: 'Admin User',
        email: 'admin@meditatva.com',
        role: 'admin',
        phone: '9876543211',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(defaultUsers);
    console.log(`✅ Created ${createdUsers.length} default users`);

    console.log('📦 Creating medicines and inventory records...');
    
    // Helper function to generate expiry dates
    const generateExpiryDate = (monthsFromNow) => {
      const date = new Date();
      date.setMonth(date.getMonth() + monthsFromNow);
      return date;
    };
    
    for (const medData of sampleMedicines) {
      const { initialStock, ...medicineData } = medData;
      
      // Create medicine
      const medicine = new Medicine(medicineData);
      await medicine.save();
      console.log(`  ✓ Created: ${medicine.name}`);

      // Create inventory with expiry date based on medicine category
      let expiryMonths;
      switch (medicine.category) {
        case 'Antibiotic':
          expiryMonths = 18; // 1.5 years
          break;
        case 'Vitamins':
          expiryMonths = 24; // 2 years
          break;
        case 'Pain Relief':
          expiryMonths = 30; // 2.5 years
          break;
        case 'Diabetes':
          expiryMonths = 20; // ~1.7 years
          break;
        default:
          expiryMonths = 24; // 2 years default
      }
      
      const inventory = new Inventory({
        medicine: medicine._id,
        current_stock: initialStock,
        batchNumber: `BATCH${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`,
        expiryDate: generateExpiryDate(expiryMonths),
        reorderLevel: Math.floor(initialStock * 0.2), // 20% of initial stock
        location: 'Main Store',
        lastRestocked: new Date()
      });
      await inventory.save();
      console.log(`    📊 Stock: ${initialStock} units | Expiry: ${inventory.expiryDate.toLocaleDateString()}`);
    }

    console.log('\n✨ Database seeded successfully!');
    console.log(`📊 Created ${sampleMedicines.length} medicines with inventory`);
    
    // Display summary
    const totalStock = sampleMedicines.reduce((sum, m) => sum + m.initialStock, 0);
    const totalValue = await Medicine.aggregate([
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'medicine',
          as: 'inventory'
        }
      },
      {
        $project: {
          value: {
            $multiply: [
              '$price',
              { $arrayElemAt: ['$inventory.current_stock', 0] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    console.log(`📦 Total stock units: ${totalStock}`);
    console.log(`💰 Total inventory value: ₹${totalValue[0]?.totalValue.toFixed(2) || 0}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run seed
seedDatabase();
