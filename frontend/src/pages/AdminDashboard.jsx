import React, { useState, useEffect } from 'react';
import { Users, BarChart3, Settings, ShieldAlert, ChevronDown, User, LogOut, X, MapPin, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getAllReports } from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  useEffect(() => {
    if (token) {
      fetchAllReports();
    }
  }, [token]);

  const fetchAllReports = async () => {
    try {
      const data = await getAllReports(token);
      setReports(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reports');
    }
  };

  const totalReports = reports.length;
  const activeMunicipalities = [...new Set(reports.map(r => r.assignedMunicipality?._id).filter(Boolean))].length;

  const handleComingSoon = (e) => {
    e.preventDefault();
    toast('This feature is coming soon!', { icon: '🚀' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col hidden md:flex">
        <h1 className="text-2xl font-bold text-purple-400 mb-8 flex items-center gap-2">
          <ShieldAlert /> Admin Panel
        </h1>
        
        <nav className="space-y-2 flex-1">
          <a href="#" className="flex items-center gap-3 bg-purple-900/50 text-purple-300 p-3 rounded-lg font-medium">
            <BarChart3 size={20} /> Overview
          </a>
          <a href="#" onClick={handleComingSoon} className="flex items-center gap-3 text-gray-400 hover:bg-gray-700 hover:text-white p-3 rounded-lg font-medium transition-colors">
            <Users size={20} /> Municipalities
          </a>
          <a href="#" onClick={handleComingSoon} className="flex items-center gap-3 text-gray-400 hover:bg-gray-700 hover:text-white p-3 rounded-lg font-medium transition-colors">
            <ShieldAlert size={20} /> All Reports
          </a>
        </nav>
        
        <div className="pt-6 border-t border-gray-700">
          <a href="#" onClick={handleComingSoon} className="flex items-center gap-3 text-gray-400 hover:bg-gray-700 hover:text-white p-3 rounded-lg font-medium transition-colors">
            <Settings size={20} /> Settings
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Platform Overview</h2>
          
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded-lg transition-colors text-left"
            >
              <div className="hidden sm:block text-right">
                <p className="font-bold">Super Admin</p>
                <p className="text-xs text-gray-400">admin@ecosync.com</p>
              </div>
              <img src="https://ui-avatars.com/api/?name=Super+Admin&background=7e22ce&color=fff" alt="Avatar" className="w-10 h-10 rounded-full" />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-semibold uppercase mb-2">Total Reports</h3>
            <p className="text-4xl font-bold">{totalReports}</p>
            <p className="text-green-400 text-sm mt-2">Live Data</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-semibold uppercase mb-2">Active Municipalities</h3>
            <p className="text-4xl font-bold">{activeMunicipalities || 1}</p>
            <p className="text-gray-400 text-sm mt-2">With assigned tasks</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-semibold uppercase mb-2">Avg Resolution Time</h3>
            <p className="text-4xl font-bold">Pending</p>
            <p className="text-green-400 text-sm mt-2">Requires more data</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold">All System Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-900 text-gray-400 text-sm uppercase">
                <tr>
                  <th className="p-4 whitespace-nowrap">Report Description</th>
                  <th className="p-4 whitespace-nowrap">Location</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Date</th>
                  <th className="p-4 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-sm">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-400">No reports found in the system.</td>
                  </tr>
                ) : reports.map(report => (
                  <tr key={report._id} className="hover:bg-gray-750 transition-colors">
                    <td className="p-4 font-medium max-w-[200px] truncate">{report.description}</td>
                    <td className="p-4 max-w-[150px] truncate">{report.location?.address || 'Unknown'}</td>
                    <td className="p-4 font-bold text-blue-400 capitalize">{report.status.replace('-', ' ')}</td>
                    <td className="p-4">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-white transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
              <h3 className="text-2xl font-bold">Report Details</h3>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-gray-400 text-sm uppercase mb-2">Description</h4>
                  <p className="text-lg bg-gray-900 p-4 rounded-lg border border-gray-700">{selectedReport.description}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm uppercase mb-2">Status & Assignment</h4>
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Status:</span>
                      <span className="font-bold text-blue-400 capitalize bg-blue-900/30 px-3 py-1 rounded-full">{selectedReport.status.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Assigned To:</span>
                      <span className="font-medium">City North District</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Date:</span>
                      <span className="font-medium">{new Date(selectedReport.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-gray-400 text-sm uppercase mb-2 flex items-center gap-2"><MapPin size={16} /> Location Details</h4>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="font-medium mb-1">{selectedReport.location?.address || 'Address Unknown'}</p>
                  {selectedReport.latitude && selectedReport.longitude && (
                    <p className="text-sm text-gray-500">Coordinates: {selectedReport.latitude}, {selectedReport.longitude}</p>
                  )}
                </div>
              </div>

              {selectedReport.aiData && (
                <div>
                  <h4 className="text-gray-400 text-sm uppercase mb-2 flex items-center gap-2"><Sparkles size={16} className="text-purple-400" /> AI Analysis Results</h4>
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Detected Category:</span>
                      <span className="font-bold text-purple-400">{selectedReport.aiData.category}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Confidence Score:</span>
                      <span className="font-bold text-green-400">{selectedReport.aiData.confidence}%</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport.imageUrl && (
                <div>
                  <h4 className="text-gray-400 text-sm uppercase mb-2">Attached Image</h4>
                  <img src={selectedReport.imageUrl} alt="Waste report" className="w-full rounded-lg border border-gray-700 object-cover max-h-[300px]" />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3 bg-gray-800 sticky bottom-0">
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
