import React, { useState, useEffect } from 'react';
import { Map as MapIcon, List, CheckCircle, Clock, AlertTriangle, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getAssignedReports, updateReportStatus } from '../api';

// Fix Leaflet marker icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MunicipalityDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const fetchReports = async () => {
    try {
      const data = await getAssignedReports(token);
      setReports(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateReportStatus(id, newStatus, token);
      fetchReports(); // Refresh data
      toast.success(`Task status updated to ${newStatus.replace('-', ' ')}`);
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update task status');
    }
  };

  const handleComingSoon = (e) => {
    e.preventDefault();
    toast('This feature is coming soon!', { icon: '🚀' });
  };

  const totalAssigned = reports.length;
  const inProgress = reports.filter(r => r.status === 'in-progress').length;
  const completed = reports.filter(r => r.status === 'completed').length;
  
  // Default map center (New York for prototype)
  const defaultCenter = [40.730610, -73.935242];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-blue-400">Municipality Dashboard</h1>
          
          <div className="relative z-50">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <img src="https://ui-avatars.com/api/?name=City+North&background=1e3a8a&color=fff" alt="Avatar" className="w-10 h-10 rounded-full" />
              <span className="font-semibold">City North District</span>
              <ChevronDown size={16} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                <a href="#" onClick={handleComingSoon} className="flex items-center gap-2 p-3 hover:bg-gray-700 transition-colors"><User size={16} /> District Profile</a>
                <a href="#" onClick={handleComingSoon} className="flex items-center gap-2 p-3 hover:bg-gray-700 transition-colors"><Settings size={16} /> Settings</a>
                <div className="border-t border-gray-700"></div>
                <a href="#" onClick={handleLogout} className="flex items-center gap-2 p-3 hover:bg-gray-700 text-red-400 transition-colors"><LogOut size={16} /> Logout</a>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="p-4 bg-blue-900/50 rounded-lg text-blue-400"><List size={24} /></div>
            <div>
              <p className="text-gray-400 text-sm">Total Assigned</p>
              <p className="text-2xl font-bold">{totalAssigned}</p>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="p-4 bg-yellow-900/50 rounded-lg text-yellow-400"><Clock size={24} /></div>
            <div>
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold">{inProgress}</p>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="p-4 bg-red-900/50 rounded-lg text-red-400"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-gray-400 text-sm">Overdue</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="p-4 bg-green-900/50 rounded-lg text-green-400"><CheckCircle size={24} /></div>
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold">{completed}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 relative z-0">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MapIcon className="text-blue-400" /> Active Tasks Map</h2>
            <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-600">
              <MapContainer center={defaultCenter} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {reports.filter(r => r.location?.coordinates).map(report => (
                  <Marker key={report._id} position={[report.location.coordinates[1], report.location.coordinates[0]]}>
                    <Popup>
                      <strong>{report.location?.address || 'Waste Report'}</strong><br/>
                      Status: {report.status}<br/>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Task List</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {reports.length === 0 ? <p className="text-gray-400">No tasks assigned.</p> : reports.map(report => (
                <div key={report._id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{report.location?.address || 'Unknown Location'}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold bg-blue-900/50 text-blue-400`}>
                      Normal
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{new Date(report.createdAt).toLocaleString()}</p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-medium text-blue-300 capitalize">{report.status.replace('-', ' ')}</span>
                    {report.status !== 'completed' && (
                      <button 
                        onClick={() => handleStatusUpdate(report._id, report.status === 'assigned' ? 'in-progress' : 'completed')}
                        className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition-colors"
                      >
                        {report.status === 'assigned' ? 'Start Task' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MunicipalityDashboard;
