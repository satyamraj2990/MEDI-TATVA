const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditatva', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// CSV file path - update this after uploading the file
const CSV_FILE_PATH = process.argv[2] || '/workspaces/MediTatva/A_Z_medicines_dataset_of_India.csv';

// Statistics
let stats = {
  total: 0,
  inserted: 0,
  updated: 0,
  errors: 0,
  skipped: 0
};

// Helper function to clean and parse data
function cleanString(str) {
  if (!str || str === 'N/A' || str === 'NA' || str === '') return undefined;
  return str.trim();
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // Remove currency symbols and extract number
  const match = priceStr.toString().match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function parseArray(str, delimiter = ',') {
  if (!str || str === 'N/A' || str === 'NA' || str === '') return [];
  return str.split(delimiter).map(item => item.trim()).filter(item => item);
}

function determineForm(formStr) {
  if (!formStr) return 'other';
  const form = formStr.toLowerCase();
  if (form.includes('tablet')) return 'tablet';
  if (form.includes('capsule')) return 'capsule';
  if (form.includes('syrup') || form.includes('liquid')) return 'syrup';
  if (form.includes('injection') || form.includes('infusion')) return 'injection';
  if (form.includes('cream') || form.includes('ointment') || form.includes('gel')) return 'cream';
  if (form.includes('drops') || form.includes('eye drop')) return 'drops';
  return 'other';
}

// Import function
async function importMedicines() {
  console.log(`📂 Reading CSV file: ${CSV_FILE_PATH}\n`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ Error: File not found at ${CSV_FILE_PATH}`);
    console.log('\n💡 Instructions:');
    console.log('1. Upload A_Z_medicines_dataset_of_India.csv to /workspaces/MediTatva/');
    console.log('2. Run: node src/scripts/importMedicinesFromCSV.js');
    console.log('   OR: node src/scripts/importMedicinesFromCSV.js <path-to-csv>');
    process.exit(1);
  }

  const medicines = [];
  const stream = fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on('data', (row) => {
      stats.total++;

      try {
        // Skip discontinued medicines
        const isDiscontinued = (row['Is_discontinued'] || '').toString().toLowerCase();
        if (isDiscontinued === 'true' || isDiscontinued === '1' || isDiscontinued === 'yes') {
          stats.skipped++;
          return;
        }

        // Parse composition (combine short_composition1 and short_composition2)
        const composition1 = cleanString(row['short_composition1']);
        const composition2 = cleanString(row['short_composition2']);
        const compositions = [];
        if (composition1) compositions.push(composition1);
        if (composition2) compositions.push(composition2);

        // Extract generic name from composition (first ingredient)
        const genericName = composition1 ? composition1.split('(')[0].trim() : undefined;

        // Map CSV columns to Medicine model
        const medicine = {
          name: cleanString(row['name'] || row['Medicine Name'] || row['product_name']),
          genericName: genericName || cleanString(row['Generic Name'] || row['generic_name']),
          brand: cleanString(row['manufacturer_name'] || row['Brand'] || row['brand']),
          dosage: cleanString(row['pack_size_label'] || row['Dosage'] || row['dosage']),
          strength: composition1, // Full composition as strength
          form: determineForm(row['type'] || row['Form'] || row['form']),
          activeIngredients: compositions,
          price: parsePrice(row['price(₹)'] || row['Price'] || row['price'] || row['MRP'] || 0),
          requiresPrescription: false, // Default to false, can be updated later
          description: cleanString(row['Description'] || row['description']),
          uses: parseArray(row['Uses'] || row['uses']),
          dosageInstructions: cleanString(row['pack_size_label'] || row['Dosage Instructions']),
          sideEffects: parseArray(row['Side Effects'] || row['side_effects']),
          manufacturer: cleanString(row['manufacturer_name'] || row['Manufacturer']),
          category: cleanString(row['Category'] || row['category']),
          therapeuticClass: cleanString(row['Therapeutic Class'] || row['therapeutic_class']),
          isActive: true
        };

        // Validate required fields
        if (!medicine.name) {
          stats.skipped++;
          return;
        }

        // Set default price if missing
        if (!medicine.price || medicine.price === 0) {
          medicine.price = 10; // Default price
        }

        medicines.push(medicine);

      } catch (error) {
        console.error(`❌ Error parsing row ${stats.total}:`, error.message);
        stats.errors++;
      }
    })
    .on('end', async () => {
      console.log(`\n📊 CSV parsing complete!`);
      console.log(`Total rows: ${stats.total}`);
      console.log(`Valid medicines: ${medicines.length}`);
      console.log(`Skipped rows: ${stats.skipped}\n`);

      if (medicines.length === 0) {
        console.log('⚠️  No valid medicines found in CSV file.');
        console.log('\n🔍 Checking CSV structure...');
        console.log('Please verify the CSV column names match the expected format.');
        mongoose.connection.close();
        process.exit(0);
      }

      console.log(`💾 Importing ${medicines.length} medicines to MongoDB...\n`);

      // Batch insert with upsert (update if exists, insert if new)
      let batchSize = 100;
      for (let i = 0; i < medicines.length; i += batchSize) {
        const batch = medicines.slice(i, i + batchSize);
        
        for (const medicine of batch) {
          try {
            const result = await Medicine.findOneAndUpdate(
              { name: medicine.name, genericName: medicine.genericName },
              medicine,
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            if (result.isNew) {
              stats.inserted++;
            } else {
              stats.updated++;
            }

            // Progress indicator
            if ((stats.inserted + stats.updated) % 50 === 0) {
              console.log(`✅ Processed: ${stats.inserted + stats.updated}/${medicines.length}`);
            }

          } catch (error) {
            console.error(`❌ Error inserting medicine "${medicine.name}":`, error.message);
            stats.errors++;
          }
        }
      }

      // Final report
      console.log('\n' + '='.repeat(60));
      console.log('📋 IMPORT COMPLETE!');
      console.log('='.repeat(60));
      console.log(`✅ Successfully inserted: ${stats.inserted}`);
      console.log(`🔄 Updated existing: ${stats.updated}`);
      console.log(`⏭️  Skipped (invalid): ${stats.skipped}`);
      console.log(`❌ Errors: ${stats.errors}`);
      console.log(`📊 Total processed: ${stats.total}`);
      console.log('='.repeat(60) + '\n');

      // Sample medicines
      console.log('📝 Sample imported medicines:');
      const samples = await Medicine.find().limit(5);
      samples.forEach((med, idx) => {
        console.log(`${idx + 1}. ${med.name} (${med.genericName || 'N/A'}) - ₹${med.price}`);
      });

      console.log(`\n✅ Total medicines in database: ${await Medicine.countDocuments()}`);

      mongoose.connection.close();
      console.log('\n🎉 Import process completed successfully!');
    })
    .on('error', (error) => {
      console.error('❌ Error reading CSV file:', error);
      mongoose.connection.close();
      process.exit(1);
    });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Import interrupted by user');
  mongoose.connection.close();
  process.exit(0);
});

// Start import
importMedicines();
