# EcoSync: Geo-Crowd Waste Management Platform

EcoSync is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to empower citizens to report waste issues in their city. It connects citizens with municipalities and admins to ensure efficient waste collection and management.

## 🚀 Features

- **Citizen Reporting**: Users can report waste with images, descriptions, and automatic geolocation.
- **AI Verification (Mock)**: Automatically categorizes reported waste (e.g., Plastic, Organic, Hazardous).
- **Municipality Dashboard**: Municipalities can view assigned reports and update their status (e.g., Pending, In-Progress, Completed).
- **Admin Dashboard**: Super admins have full visibility and control over all reports and users.
- **Responsive Design**: Modern, dark-themed UI built with Tailwind CSS and Lucide icons.
- **Geospatial Queries**: Uses MongoDB's 2dsphere indexing for location-based features.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Lucide React, React Hot Toast.
- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT Authentication, Multer (Image Uploads).
- **Cloud Services**: Cloudinary (Image Hosting), MongoDB Atlas (Database).

## 📁 Project Structure

```text
├── backend/          # Node.js Express server & API routes
│   ├── config/       # Database & Cloudinary configurations
│   ├── middleware/   # Auth & Role-based access middleware
│   ├── models/       # Mongoose Schemas (User, Report)
│   ├── routes/       # API endpoints
│   └── server.js     # Main entry point
├── frontend/         # React application (Vite)
│   ├── src/
│   │   ├── api.js    # API call configurations
│   │   ├── pages/    # User, Admin, and Municipality dashboards
│   │   └── App.jsx   # Routing and app logic
│   └── vercel.json   # Vercel deployment configuration
└── vercel.json       # Root deployment configuration (optional)
```

## ⚙️ Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Rakeshb0/Geo-crowd-waste-management-.git
   cd Geo-crowd-waste-management-
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   FRONTEND_URL=http://localhost:5173
   ```
   Run the server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

## 🌐 Deployment

### Backend (Render)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Set all keys from the backend `.env` in the Render dashboard.

### Frontend (Vercel)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: 
  - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`

## 👤 Demo Credentials

- **Admin**: `admin@ecosync.com` / `password123`
- **Municipality**: `muni@example.com` / `password123`
- **Citizen**: Create a new account via the Sign Up page.

## 📄 License

This project is licensed under the ISC License.
