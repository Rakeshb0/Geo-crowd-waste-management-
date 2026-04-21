const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load backend modules using relative paths to the backend directory
const authRoutes = require('../backend/routes/authRoutes');
const reportRoutes = require('../backend/routes/reportRoutes');
const uploadRoutes = require('../backend/routes/uploadRoutes');
const User = require('../backend/models/User');
const Report = require('../backend/models/Report');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// ── MongoDB Connection (cached for serverless) ────────────────────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  try {
    const conn = await mongoose.connect(uri, {
      bufferCommands: false,
    });
    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed database on first connection
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

// ── Database Seeding ──────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Seeding database...');

      // Seed Municipality
      const muni = await User.create({
        name: 'City North District',
        email: 'muni@example.com',
        password: 'password123',
        role: 'municipality'
      });

      // Seed Admin
      await User.create({
        name: 'Super Admin',
        email: 'admin@ecosync.com',
        password: 'password123',
        role: 'admin'
      });

      // Seed Reports
      await Report.create([
        {
          user: muni._id,
          assignedMunicipality: muni._id,
          image: { url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=600&auto=format&fit=crop' },
          location: { type: 'Point', coordinates: [-74.0060, 40.7128], address: 'Downtown Park' },
          description: 'Plastic bags and debris near the park entrance',
          status: 'assigned',
          aiData: { category: 'Recyclable Plastics', confidence: 92 }
        },
        {
          user: muni._id,
          assignedMunicipality: muni._id,
          image: { url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600&auto=format&fit=crop' },
          location: { type: 'Point', coordinates: [-73.9855, 40.7580], address: '5th Avenue Alley' },
          description: 'Broken public bench',
          status: 'in-progress',
          aiData: { category: 'General Waste', confidence: 88 }
        }
      ]);
      console.log('Database seeded successfully.');
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};

// ── Connect DB before handling requests ───────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Waste Management Platform API is running on Vercel ✅' });
});

// Export for Vercel Serverless
module.exports = app;
