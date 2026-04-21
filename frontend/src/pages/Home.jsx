import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <Trash2 className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight">EcoSync Waste Platform</h1>
        <p className="text-xl text-gray-400 mb-8">
          Report illegal dumping, track cleanup efforts, and help municipalities keep our city clean through AI-powered waste detection.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/user')}
            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            I am a Citizen
          </button>
          <button 
            onClick={() => navigate('/municipality')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            I am a Municipality
          </button>
          <button 
            onClick={() => navigate('/admin')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            I am an Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
