import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, User, LogIn, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loginUser, registerUser } from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Clear any stale tokens when Login page loads
  React.useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await loginUser({ email: formData.email, password: formData.password });
        toast.success('Logged in successfully!');
      } else {
        res = await registerUser({ name: formData.name, email: formData.email, password: formData.password, role: 'user' });
        toast.success('Account created successfully!');
      }

      // Save token and role to localStorage
      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);
      localStorage.setItem('user', JSON.stringify(res));

      // Redirect based on role
      if (res.role === 'admin') navigate('/admin');
      else if (res.role === 'municipality') navigate('/municipality');
      else navigate('/user');

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick login helpers for the prototype
  const fillDemoAdmin = () => setFormData({ name: '', email: 'admin@ecosync.com', password: 'password123' });
  const fillDemoMuni = () => setFormData({ name: '', email: 'muni@example.com', password: 'password123' });

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-900 p-4 rounded-full border border-gray-700">
              <Leaf size={40} className="text-green-400" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            EcoSync Platform
          </h2>
          <p className="text-gray-400 text-center mb-8">
            {isLogin ? 'Welcome back! Please login.' : 'Create a new citizen account.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mt-6 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && (isLogin ? <LogIn size={18} /> : <ArrowRight size={18} />)}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>

          {/* Developer Demo Logins */}
          {isLogin && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center mb-3">Demo Accounts</p>
              <div className="flex gap-2 justify-center">
                <button onClick={fillDemoAdmin} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-gray-300 transition-colors">Fill Admin</button>
                <button onClick={fillDemoMuni} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-gray-300 transition-colors">Fill Municipality</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
