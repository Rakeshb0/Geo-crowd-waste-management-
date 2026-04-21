import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, UploadCloud, CheckCircle, ChevronDown, User, Settings, LogOut, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createReport, getMyReports, uploadImage } from '../api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [reported, setReported] = useState(false);
  const [recentReport, setRecentReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Get Location');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (token) {
      getMyReports(token).then(setReports).catch(() => toast.error('Failed to load reports'));
    }
  }, [token, reported]); // Refetch when reported changes

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (JPG, PNG, etc).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image is too large. Please upload an image under 5MB.');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      toast.success('Image attached successfully');
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      setLocation({ latitude: 40.730610, longitude: -73.935242, address: 'Fallback Location' });
      return;
    }
    
    setLocationStatus('Locating...');
    const loadingToast = toast.loading('Securing location...');
    
    const timeout = setTimeout(() => {
      setLocation({ latitude: 40.730610, longitude: -73.935242, address: 'Estimated Location (Timeout)' });
      setLocationStatus('Location Secured (Estimated) ✓');
      toast.success('Estimated location secured', { id: loadingToast });
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeout);
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        try {
          setLocationStatus('Fetching address...');
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          const address = data.display_name || 'Verified GPS Location';
          
          setLocation({ latitude: lat, longitude: lon, address: address });
          setLocationStatus('Location Secured ✓');
          toast.success('GPS Location verified', { id: loadingToast });
        } catch (err) {
          setLocation({ latitude: lat, longitude: lon, address: 'Verified GPS Location' });
          setLocationStatus('Location Secured ✓');
          toast.success('GPS Location verified', { id: loadingToast });
        }
      },
      (error) => {
        clearTimeout(timeout);
        setLocation({ latitude: 40.730610, longitude: -73.935242, address: 'Estimated Location (Error)' });
        setLocationStatus('Location Secured (Estimated) ✓');
        toast.error('Failed to get precise GPS. Using estimate.', { id: loadingToast });
      },
      { timeout: 15000, enableHighAccuracy: true }
    );
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!token || !image) {
      toast.error("Please provide an image before submitting.");
      return;
    }
    if (!location) {
      toast.error("Please capture your location first.");
      return;
    }
    
    setIsUploading(true);
    const submitToast = toast.loading('Uploading and running AI verification...');
    
    try {
      const uploadedImageUrl = await uploadImage(image);
      const newReport = await createReport({
        imageUrl: uploadedImageUrl,
        longitude: location.longitude,
        latitude: location.latitude,
        address: location.address,
        description: description || 'No description provided'
      }, token);
      
      setRecentReport(newReport);
      setReported(true);
      setDescription('');
      setImage(null);
      setImagePreview('');
      setLocation(null);
      setLocationStatus('Get Location');
      toast.success('Report submitted successfully!', { id: submitToast });
    } catch (err) {
      console.error(err);
      toast.error('Error creating report: ' + err.message, { id: submitToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleComingSoon = (e) => {
    e.preventDefault();
    toast('This feature is coming soon!', { icon: '🚀' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-green-400">Citizen Dashboard</h1>
          
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <img src="https://ui-avatars.com/api/?name=John+Doe&background=166534&color=fff" alt="Avatar" className="w-10 h-10 rounded-full" />
              <span className="font-semibold">John Doe</span>
              <ChevronDown size={16} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                <a href="#" onClick={handleComingSoon} className="flex items-center gap-2 p-3 hover:bg-gray-700 transition-colors"><User size={16} /> My Profile</a>
                <a href="#" onClick={handleComingSoon} className="flex items-center gap-2 p-3 hover:bg-gray-700 transition-colors"><Settings size={16} /> Settings</a>
                <div className="border-t border-gray-700"></div>
                <a href="#" onClick={handleLogout} className="flex items-center gap-2 p-3 hover:bg-gray-700 text-red-400 transition-colors"><LogOut size={16} /> Logout</a>
              </div>
            )}
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Camera className="text-green-400" /> Report Waste
            </h2>
            
            {reported ? (
              <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-300 mb-2">Report Submitted!</h3>
                <p className="text-gray-300 mb-6">Our AI has verified the waste and assigned it to the nearest municipality.</p>
                
                {recentReport?.aiData && (
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6 text-left">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-purple-400" /> AI Classification
                    </h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Category Detected:</span>
                      <span className="font-bold text-purple-400">{recentReport.aiData.category}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Confidence Score:</span>
                      <span className="font-bold text-green-400">{recentReport.aiData.confidence}%</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setReported(false)}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Report Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="mx-auto max-h-32 object-contain" />
                  ) : (
                    <>
                      <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Click to select an image</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-green-400"
                    rows="3"
                    placeholder="E.g., Pile of plastic bottles near the park entrance"
                  ></textarea>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={handleGetLocation}
                    className={`p-3 rounded-lg flex items-center justify-center gap-2 flex-1 border transition-colors ${
                      location ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    <MapPin className="w-5 h-5" /> {locationStatus}
                  </button>
                  <button type="submit" disabled={!token || isUploading} className="bg-green-600 disabled:bg-gray-600 hover:bg-green-500 p-3 rounded-lg flex-2 text-white font-bold transition-colors w-full">
                    {isUploading ? 'Uploading...' : (token ? 'Submit Report' : 'Connecting...')}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-green-400">My Reports</h2>
            <div className="space-y-4">
              {reports.length === 0 ? (
                <p className="text-gray-400">No reports yet.</p>
              ) : reports.map(report => (
                <div key={report._id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center border border-gray-600">
                  <div>
                    <h4 className="font-medium">{report.description}</h4>
                    <span className="text-sm text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-3 py-1 bg-gray-800 rounded-full text-sm font-semibold border border-gray-600 ${report.status === 'assigned' ? 'text-blue-400' : 'text-gray-400'}`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
