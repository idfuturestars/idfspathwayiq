import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import StarLogo from './StarLogo';
import { 
  HomeIcon,
  UserGroupIcon,
  BookOpenIcon,
  TrophyIcon,
  ChartBarIcon,
  StarIcon,
  QuestionMarkCircleIcon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard', color: '#6b7280' },
    { name: 'Talent Compass', icon: AcademicCapIcon, path: '/talent-compass', color: '#6b7280' },
    { name: 'Pathway Guide', icon: ChatBubbleLeftRightIcon, path: '/pathway-guide', color: '#6b7280' },
    { name: 'Learning Journeys', icon: MapIcon, path: '/learning-journeys', color: '#6b7280' },
    { name: 'Learning Circles', icon: UserGroupIcon, path: '/learning-circles', color: '#6b7280' },
    { name: 'Progress Tracker', icon: ChartBarIcon, path: '/trajectory', color: '#6b7280' },
    { name: 'Milestone Tracker', icon: TrophyIcon, path: '/milestone-tracker', color: '#6b7280' },
    { name: 'Achievements', icon: StarIcon, path: '/pathway-achievements', color: '#6b7280' },
    { name: 'Navigator Hub', icon: QuestionMarkCircleIcon, path: '/navigator-hub', color: '#6b7280' },
    { name: 'Career Insights', icon: BriefcaseIcon, path: '/career-insights', color: '#6b7280' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="starguide-container">
      {/* Header */}
      <header className="starguide-header">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
          
          <StarLogo size={40} className="mr-3" />
          <div>
            <h1 className="text-xl font-bold text-white">PathwayIQ</h1>
            <p className="text-xs text-gray-400">by IDFS Navigator™</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search pathways, insights, or resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <BellIcon className="w-6 h-6 text-gray-400" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-gray-400">Level {user?.level} • {user?.xp} Points</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`starguide-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <nav className="py-4">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`nav-item w-full text-left ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon 
                className="nav-item-icon" 
                style={{ color: isActive(item.path) ? '#ffffff' : '#6b7280' }}
              />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="starguide-content">
        {children}
      </main>

      {/* Right Sidebar */}
      <aside className="starguide-right-sidebar hidden lg:block">
        <div className="p-6">
          {/* User Progress */}
          <div className="starguide-card mb-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Level Progress</span>
                  <span className="text-white">{user?.xp % 100}/100 Points</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="bg-gray-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(user?.xp % 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{user?.level}</p>
                  <p className="text-xs text-gray-400">Level</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-400">{user?.xp}</p>
                  <p className="text-xs text-gray-400">Total Points</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="starguide-card mb-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/learning-journeys')}
                className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <MapIcon className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-white">Explore Pathways</span>
                </div>
              </button>
              <button 
                onClick={() => navigate('/learning-circles')}
                className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <UserGroupIcon className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-white">Join Learning Circle</span>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="starguide-card">
            <h3 className="text-lg font-semibold mb-4 text-white">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-gray-300">Completed Web Development module</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                <span className="text-gray-300">Joined Python Learning Circle</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                <span className="text-gray-300">Earned Pathway Explorer achievement</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;