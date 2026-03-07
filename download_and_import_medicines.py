#!/usr/bin/env python3
"""
Download A-Z Medicine Dataset of India from Kaggle and convert to CSV
Dataset: https://www.kaggle.com/datasets/shudhanshusingh/az-medicine-dataset-of-india
"""

import os
import sys

print("=" * 60)
print("🏥 MediTatva - Medicine Dataset Importer")
print("=" * 60)
print()

# Step 1: Install required packages
print("📦 Step 1: Installing required packages...")
os.system("pip install -q kagglehub pandas")

# Step 2: Import packages
print("📥 Step 2: Importing packages...")
try:
    import kagglehub
    from kagglehub import KaggleDatasetAdapter
    import pandas as pd
    print("✅ Packages imported successfully\n")
except ImportError as e:
    print(f"❌ Error importing packages: {e}")
    print("Please run: pip install kagglehub pandas")
    sys.exit(1)

# Step 3: Download dataset from Kaggle
print("🌐 Step 3: Downloading dataset from Kaggle...")
print("Dataset: shudhanshusingh/az-medicine-dataset-of-india")
print("This may take a few minutes...\n")

try:
    # First, download the dataset to see available files
    path = kagglehub.dataset_download("shudhanshusingh/az-medicine-dataset-of-india")
    print(f"✅ Dataset downloaded to: {path}\n")
    
    # List available files
    print("📁 Available files in dataset:")
    import glob
    files = glob.glob(os.path.join(path, "*"))
    for i, file in enumerate(files, 1):
        file_name = os.path.basename(file)
        file_size = os.path.getsize(file) / 1024  # KB
        print(f"   {i}. {file_name} ({file_size:.2f} KB)")
    print()
    
    # Find CSV file
    csv_files = glob.glob(os.path.join(path, "*.csv"))
    if not csv_files:
        print("❌ No CSV files found in dataset")
        sys.exit(1)
    
    # Load the first CSV file
    csv_file = csv_files[0]
    print(f"📂 Loading: {os.path.basename(csv_file)}\n")
    
    df = pd.read_csv(csv_file)
    
    print(f"✅ Dataset loaded successfully!")
    print(f"📊 Total records: {len(df)}")
    print(f"📋 Columns: {list(df.columns)}\n")
    
except Exception as e:
    print(f"❌ Error downloading dataset: {e}")
    print("\n💡 Troubleshooting:")
    print("1. Make sure you have a Kaggle account")
    print("2. Set up Kaggle API credentials:")
    print("   - Go to https://www.kaggle.com/settings/account")
    print("   - Click 'Create New Token'")
    print("   - Download kaggle.json")
    print("   - Place it at: ~/.kaggle/kaggle.json")
    print("   - Run: chmod 600 ~/.kaggle/kaggle.json")
    sys.exit(1)

# Step 4: Preview data
print("👀 Step 4: Previewing data...")
print("\nFirst 5 records:")
print(df.head())
print("\nData types:")
print(df.dtypes)
print(f"\nMissing values:")
print(df.isnull().sum())
print()

# Step 5: Clean and prepare data
print("🧹 Step 5: Cleaning data...")
initial_count = len(df)

# Remove rows with missing critical fields
if 'name' in df.columns:
    df = df.dropna(subset=['name'])
elif 'Medicine Name' in df.columns:
    df = df.dropna(subset=['Medicine Name'])
elif 'product_name' in df.columns:
    df = df.dropna(subset=['product_name'])

# Remove duplicates
df = df.drop_duplicates()

cleaned_count = len(df)
removed_count = initial_count - cleaned_count

print(f"✅ Cleaned {removed_count} invalid/duplicate records")
print(f"📊 Clean records: {cleaned_count}\n")

# Step 6: Save to CSV
print("💾 Step 6: Saving to CSV...")
csv_path = "/workspaces/MediTatva/A_Z_medicines_dataset_of_India.csv"

try:
    df.to_csv(csv_path, index=False, encoding='utf-8')
    file_size = os.path.getsize(csv_path) / (1024 * 1024)  # Convert to MB
    print(f"✅ CSV saved: {csv_path}")
    print(f"📁 File size: {file_size:.2f} MB\n")
except Exception as e:
    print(f"❌ Error saving CSV: {e}")
    sys.exit(1)

# Step 7: Show summary
print("=" * 60)
print("📋 DATASET SUMMARY")
print("=" * 60)
print(f"Total medicines: {len(df)}")
print(f"CSV location: {csv_path}")
print(f"File size: {file_size:.2f} MB")
print()

# Show column mapping suggestions
print("📊 Available columns in dataset:")
for i, col in enumerate(df.columns, 1):
    print(f"   {i}. {col}")
print()

# Step 8: Instructions for next step
print("=" * 60)
print("✅ DOWNLOAD COMPLETE!")
print("=" * 60)
print()
print("🚀 Next Step: Import to MongoDB")
print()
print("Run these commands:")
print()
print("   cd /workspaces/MediTatva/meditatva-backend")
print("   npm install csv-parser")
print("   node src/scripts/importMedicinesFromCSV.js")
print()
print("=" * 60)
