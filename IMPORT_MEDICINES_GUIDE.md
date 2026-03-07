# 📦 Import Indian Medicines Dataset - Step by Step Guide

## 🎯 Overview
Import the A-Z medicines dataset of India into MediTatva's MongoDB database.

---

## ⚡ Quick Start (3 Steps)

### Step 1: Upload the CSV File
1. In VS Code Explorer (left sidebar), drag and drop your CSV file:
   `A_Z_medicines_dataset_of_India.csv`
   
2. Drop it directly into: `/workspaces/MediTatva/`

3. Verify the file appears: `/workspaces/MediTatva/A_Z_medicines_dataset_of_India.csv`

### Step 2: Install CSV Parser Package
```bash
cd /workspaces/MediTatva/meditatva-backend
npm install csv-parser
```

### Step 3: Run the Import Script
```bash
cd /workspaces/MediTatva/meditatva-backend
node src/scripts/importMedicinesFromCSV.js
```

**Alternative** (if CSV is in a different location):
```bash
node src/scripts/importMedicinesFromCSV.js /path/to/your/csvfile.csv
```

---

## 📊 What the Script Does

1. **Reads CSV file** - Parses all rows from the dataset
2. **Cleans data** - Removes invalid/empty entries
3. **Maps fields** - Converts CSV columns to Medicine model fields
4. **Imports to MongoDB** - Inserts/updates medicines in batches
5. **Shows statistics** - Displays import results

### CSV Column Mapping
The script automatically maps common CSV column names:

| CSV Column | Medicine Model Field |
|------------|---------------------|
| Medicine Name / name / product_name | name |
| Generic Name / generic_name / salt_composition | genericName |
| Brand / brand / manufacturer | brand |
| Dosage / dosage | dosage |
| Strength / strength | strength |
| Form / form / type | form |
| Active Ingredients / Composition | activeIngredients |
| Price / price / MRP / mrp | price |
| Prescription Required | requiresPrescription |
| Description / description | description |
| Uses / uses / use | uses |
| Dosage Instructions / how_to_use | dosageInstructions |
| Side Effects / side_effects | sideEffects |
| Manufacturer / manufacturer | manufacturer |
| Category / category | category |
| Therapeutic Class / therapeutic_class | therapeuticClass |

---

## 🔍 Expected Output

```
📂 Reading CSV file: /workspaces/MediTatva/A_Z_medicines_dataset_of_India.csv

✅ Connected to MongoDB

📊 CSV parsing complete!
Total rows: 18000
Valid medicines: 17800
Skipped rows: 200

💾 Importing 17800 medicines to MongoDB...

✅ Processed: 50/17800
✅ Processed: 100/17800
...
✅ Processed: 17800/17800

============================================================
📋 IMPORT COMPLETE!
============================================================
✅ Successfully inserted: 15000
🔄 Updated existing: 2800
⏭️  Skipped (invalid): 200
❌ Errors: 0
📊 Total processed: 18000
============================================================

📝 Sample imported medicines:
1. Paracetamol (Acetaminophen) - ₹15
2. Amoxicillin (Amoxicillin) - ₹85
3. Metformin (Metformin HCl) - ₹120
4. Atorvastatin (Atorvastatin Calcium) - ₹250
5. Aspirin (Acetylsalicylic Acid) - ₹30

✅ Total medicines in database: 15200

🎉 Import process completed successfully!
```

---

## 🔧 Troubleshooting

### Issue: CSV File Not Found
**Error:** `❌ Error: File not found at /workspaces/MediTatva/A_Z_medicines_dataset_of_India.csv`

**Solution:** 
- Verify file is uploaded to correct location
- Check file name spelling (case-sensitive)
- Use absolute path: `node src/scripts/importMedicinesFromCSV.js /full/path/to/file.csv`

### Issue: MongoDB Connection Error
**Error:** `❌ MongoDB connection error`

**Solution:**
1. Check if MongoDB is running:
   ```bash
   sudo systemctl status mongod
   ```
2. Start MongoDB if stopped:
   ```bash
   sudo systemctl start mongod
   ```
3. Verify MONGODB_URI in `.env` file

### Issue: CSV Column Names Don't Match
**Error:** Most medicines skipped, low import count

**Solution:**
1. Open the CSV file and check actual column names
2. Edit `/workspaces/MediTatva/meditatva-backend/src/scripts/importMedicinesFromCSV.js`
3. Update the field mappings in the `medicine` object (around line 82)
4. Add your specific column names to the mapping

Example:
```javascript
name: cleanString(row['Your_Column_Name'] || row['Medicine Name']),
```

### Issue: Duplicate Medicines
**Behavior:** Script updates existing medicines instead of creating duplicates

**This is normal!** The script uses `findOneAndUpdate` with `upsert: true` to:
- Insert new medicines
- Update existing medicines with same name + genericName

---

## 📝 CSV File Format Examples

### Expected Format (Common Structures)

**Format 1: Simple**
```csv
Medicine Name,Generic Name,Price,Form,Manufacturer
Paracetamol 500mg,Acetaminophen,15,Tablet,Cipla
Amoxicillin 250mg,Amoxicillin,85,Capsule,Sun Pharma
```

**Format 2: Detailed**
```csv
name,generic_name,mrp,type,manufacturer,uses,side_effects
Metformin 500mg,Metformin HCl,120,Tablet,Dr. Reddy's,Diabetes Type 2,Nausea;Diarrhea
```

**Format 3: Comprehensive**
```csv
product_name,salt_composition,price,form,marketed_by,therapeutic_use,common_side_effects,prescription_required
Atorvastatin 10mg,Atorvastatin Calcium,250,Tablet,Pfizer,High Cholesterol,Muscle pain;Headache,Yes
```

---

## ✅ Verification

After import, verify the data:

### Check Total Count
```bash
mongosh meditatva --eval "db.medicines.countDocuments()"
```

### Sample Medicines
```bash
mongosh meditatva --eval "db.medicines.find().limit(5).pretty()"
```

### Search for Specific Medicine
```bash
mongosh meditatva --eval "db.medicines.find({name: /Paracetamol/i}).pretty()"
```

### Check API Endpoint
```bash
curl http://localhost:5000/api/medicines/search?query=paracetamol
```

---

## 🎯 Next Steps After Import

1. **Test Medicine Search**
   - Open: http://localhost:8080
   - Navigate to Medicine Analyser
   - Search for common medicines (Paracetamol, Aspirin, Metformin)

2. **Test Compare Feature**
   - Select 2 medicines to compare
   - Verify all fields display correctly

3. **Test Substitute Finder**
   - Enter a medicine name
   - Verify AI finds appropriate substitutes

4. **Update Frontend Search**
   If search is slow with large dataset:
   - Add pagination to search results
   - Implement debounced search
   - Add search filters (category, price range)

---

## 📊 Performance Notes

- **Import Speed:** ~1000-2000 medicines per minute
- **Large Datasets:** 10,000+ medicines may take 5-10 minutes
- **Database Size:** Each medicine ~1-2KB
- **Indexing:** Text indexes created automatically for fast search

---

## 🚀 Advanced: Automated Import

Create a npm script for easy re-import:

Edit `/workspaces/MediTatva/meditatva-backend/package.json`:

```json
"scripts": {
  "import-medicines": "node src/scripts/importMedicinesFromCSV.js"
}
```

Then run:
```bash
npm run import-medicines
```

---

## 💡 Tips

1. **Backup Before Import:** 
   ```bash
   mongodump --db meditatva --out backup/
   ```

2. **Clear Old Data:**
   ```bash
   mongosh meditatva --eval "db.medicines.deleteMany({})"
   ```

3. **Import Multiple CSVs:**
   ```bash
   node src/scripts/importMedicinesFromCSV.js dataset1.csv
   node src/scripts/importMedicinesFromCSV.js dataset2.csv
   ```

4. **Monitor Progress:**
   Script shows progress every 50 medicines

---

**Need Help?** Check the console output for detailed error messages!
