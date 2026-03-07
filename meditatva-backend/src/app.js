require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration - allow frontend and any origin in development
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173', // Vite default
  'http://localhost:3000',
  'http://localhost:8080'
];

// Add all .vercel.app domains in production
const isVercelDomain = (origin) => {
  return origin && (origin.endsWith('.vercel.app') || origin.endsWith('.vercel.com'));
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, check whitelist or Vercel domains
    if (allowedOrigins.includes(origin) || isVercelDomain(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meditatva';

// Health check (needs to work even if DB is not ready)
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isConnected = dbState === 1;

  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? 'ok' : 'starting',
    message: isConnected ? 'MediTatva API is running' : 'Database connecting...',
    database: isConnected ? 'connected' : 'disconnected',
    ready: isConnected
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MediTatva Pharmacy Management API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      medicines: '/api/medicines',
      medicinesSearch: '/api/medicines/search?q=<query>',
      invoices: '/api/invoices',
      inventory: '/api/inventory',
      realtime: '/api/realtime/inventory',
      health: '/health'
    }
  });
});

// API connectivity test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    server: 'MediTatva Backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
const medicineRoutes = require('./routes/medicine');
const invoiceRoutes = require('./routes/invoice');
const inventoryRoutes = require('./routes/inventory');
const voiceCallRoutes = require('./routes/voiceCall');
const reportAnalyzerRoutes = require('./routes/reportAnalyzer');

// Realtime Service
const realtimeService = require('./services/realtimeService');

// Import Voice Assistant Route
const voiceAssistantRoutes = require('./routes/voiceAssistant');
const medicineAnalyserRoutes = require('./routes/medicineAnalyser');

// Import CSV-based Medicine Search Route
const { router: medicineSearchRouter, loadMedicines } = require('./routes/medicineSearch');
const medicineCompareAIRouter = require('./routes/medicineCompareAI');
const aiRoutes = require('./routes/aiRoutes');

// API Routes
// Register AI routes first (MediTatva AI Engine)
app.use('/api/ai', aiRoutes); // MediTatva AI Engine - Medicine comparison, health analysis
// Register CSV-based medicine search
app.use('/api/medicines', medicineSearchRouter); // CSV-based search & substitutes
app.use('/api/medicines', medicineCompareAIRouter); // AI-powered comparison
app.use('/api/medicines', medicineRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/voice-call', voiceCallRoutes);
app.use('/api/voice-assistant', voiceAssistantRoutes);
app.use('/api/report-analyzer', reportAnalyzerRoutes);
app.use('/api/medicine-analyser', medicineAnalyserRoutes);

// SSE Endpoint for real-time inventory updates
app.get('/api/realtime/inventory', (req, res) => {
  console.log('📡 New SSE connection request from:', req.headers.origin || 'unknown');

  try {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection message
    res.write(': connected\n\n');

    // Add client to realtime service
    realtimeService.addClient(res);

    // Send initial data
    const Inventory = require('./models/Inventory');
    realtimeService.sendInitialInventory(res, Inventory);

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (error) {
        console.error('❌ Heartbeat error:', error);
        clearInterval(heartbeat);
      }
    }, 30000); // Every 30 seconds

    // Cleanup on disconnect
    req.on('close', () => {
      console.log('📡 SSE client disconnected');
      clearInterval(heartbeat);
      realtimeService.removeClient(res);
    });

    // Handle errors
    req.on('error', (error) => {
      console.error('❌ SSE connection error:', error);
      clearInterval(heartbeat);
      realtimeService.removeClient(res);
    });
  } catch (error) {
    console.error('❌ Failed to establish SSE connection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to establish real-time connection'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// MODIFIED: Start server even if MongoDB is unavailable (for voice calls)
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces

console.log('🔄 Connecting to MongoDB...');
console.log(`📍 MongoDB URI: ${MONGODB_URI}`);

// Connection options with increased timeout
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000,
  family: 4 // Force IPv4
};

// Start server function
function startServer(dbConnected = false) {
  console.log('🔧 Registering API routes...');
  console.log('   - /api/medicines');
  console.log('   - /api/invoices');
  console.log('   - /api/inventory');
  console.log('   - /api/voice-call ✅ (Works without DB)');
  console.log('   - /api/voice-assistant ✅ (Works without DB)');

  // Load medicine CSV data
  console.log('📦 Loading medicine dataset from CSV...');
  loadMedicines()
    .then(() => {
      console.log('✅ Medicine CSV data loaded successfully');

      app.listen(PORT, HOST, () => {
        console.log('═══════════════════════════════════════');
        if (dbConnected) {
          console.log('✅ SERVER READY (Database Connected)');
        } else {
          console.log('⚠️  SERVER READY (Database Unavailable)');
          console.log('   Voice calls will work');
          console.log('   Other features need MongoDB');
        }
        console.log(`🚀 Server running on ${HOST}:${PORT}`);
        console.log(`📍 API: http://localhost:${PORT}/api`);
        console.log(`🏥 Health: http://localhost:${PORT}/health`);
        console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
        console.log(`📞 Voice: http://localhost:${PORT}/api/voice-call/test`);
        console.log(`💊 Medicine Search: http://localhost:${PORT}/api/medicines/search?q=paracetamol`);
        console.log(`🔄 Substitutes: http://localhost:${PORT}/api/medicines/substitutes?name=paracetamol`);
        console.log('═══════════════════════════════════════');
      });
    })
    .catch(error => {
      console.error('❌ Failed to load medicine CSV:', error);
      console.warn('⚠️  Starting server without medicine data');

      app.listen(PORT, HOST, () => {
        console.log('═══════════════════════════════════════');
        console.log('⚠️  SERVER READY (No Medicine Data)');
        console.log(`🚀 Server running on ${HOST}:${PORT}`);
        console.log('═══════════════════════════════════════');
      });
    });
}

// Try MongoDB connection
mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    startServer(true);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️  Starting server WITHOUT database');
    console.warn('   Voice call features will work');
    console.warn('   Medicine, Invoice, Inventory features will fail');
    console.warn('   To fix: Start MongoDB or use MongoDB Atlas');
    startServer(false);
  });

// Handle MongoDB disconnection gracefully
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected - some features may not work');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

module.exports = app;
