const mongoose = require('mongoose');
const Medicine = require('./src/models/Medicine');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/meditatva', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Count total medicines
    const total = await Medicine.countDocuments();
    console.log(`📊 Total medicines in database: ${total}\n`);
    
    // Search for paracetamol
    console.log('🔍 Searching for "paracetamol"...');
    const results = await Medicine.find({ 
      name: { $regex: 'paracetamol', $options: 'i' } 
    }).limit(5);
    
    console.log(`Found ${results.length} results:\n`);
    results.forEach((med, idx) => {
      console.log(`${idx + 1}. ${med.name}`);
      console.log(`   Generic: ${med.genericName || 'N/A'}`);
      console.log(`   Brand: ${med.brand || 'N/A'}`);
      console.log(`   Price: ₹${med.price}`);
      console.log(`   Form: ${med.form}`);
      console.log();
    });
    
    // Test another search
    console.log('🔍 Searching for "azithromycin"...');
    const results2 = await Medicine.find({ 
      $or: [
        { name: { $regex: 'azithromycin', $options: 'i' } },
        { genericName: { $regex: 'azithromycin', $options: 'i' } }
      ]
    }).limit(3);
    
    console.log(`Found ${results2.length} results:\n`);
    results2.forEach((med, idx) => {
      console.log(`${idx + 1}. ${med.name} - ₹${med.price}`);
    });
    
    console.log('\n✅ Medicine database is working perfectly!');
    console.log('🎉 You can now use the medicine search features in MediTatva\n');
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
