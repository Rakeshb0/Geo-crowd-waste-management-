const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load env vars
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

const fs = require('fs');
const User = require('./models/User');
const Report = require('./models/Report');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const { MongoMemoryServer } = require('mongodb-memory-server');

const seedDatabase = async () => {
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
        user: muni._id, // Just using muni as dummy user ID
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
};

// Mock DB Connection
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    if (!uri) {
      console.log('No MONGO_URI provided. Starting in-memory MongoDB...');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(uri, {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed after connection
    await seedDatabase();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('Waste Management Platform API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
