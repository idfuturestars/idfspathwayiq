import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  AcademicCapIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const SOSStation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('request-help');
  const [tickets, setTickets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    subject: '',
    priority: 'medium',
    category: 'concept'
  });

  // Mock tickets data
  const mockTickets = [
    {
      id: 1,
      title: 'Understanding React Hooks',
      description: 'I\'m struggling with useEffect and useState. Can someone explain when to use each one?',
      subject: 'React',
      category: 'concept',
      priority: 'medium',
      status: 'open',
      student: user?.username || 'You',
      assignedTo: null,
      createdAt: new Date('2024-01-20T10:30:00'),
      updatedAt: new Date('2024-01-20T10:30:00'),
      responses: 0
    },
    {
      id: 2,
      title: 'JavaScript Closure Confusion',
      description: 'I don\'t understand how closures work in JavaScript. The examples in the lesson are confusing.',
      subject: 'JavaScript',
      category: 'concept',
      priority: 'high',
      status: 'assigned',
      student: 'student123',
      assignedTo: 'Prof. Smith',
      createdAt: new Date('2024-01-20T09:15:00'),
      updatedAt: new Date('2024-01-20T11:45:00'),
      responses: 3
    },
    {
      id: 3,
      title: 'Python List Comprehension Error',
      description: 'Getting a syntax error in my list comprehension. Code: [x for x in range(10) if x % 2 = 0]',
      subject: 'Python',
      category: 'debug',
      priority: 'medium',
      status: 'resolved',
      student: 'pythonlearner',
      assignedTo: 'Dr. Johnson',
      createdAt: new Date('2024-01-19T14:20:00'),
      updatedAt: new Date('2024-01-19T16:30:00'),
      responses: 5
    }
  ];

  const subjects = [
    'JavaScript', 'Python', 'React', 'Node.js', 'CSS', 'HTML',
    'Algorithms', 'Data Structures', 'Databases', 'DevOps'
  ];

  const categories = [
    { id: 'concept', label: 'Concept Explanation', icon: BookOpenIcon },
    { id: 'debug', label: 'Debug Code', icon: ExclamationTriangleIcon },
    { id: 'review', label: 'Code Review', icon: CheckCircleIcon },
    { id: 'guidance', label: 'Learning Guidance', icon: AcademicCapIcon }
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: 'bg-green-500' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { id: 'high', label: 'High', color: 'bg-red-500' },
    { id: 'urgent', label: 'Urgent', color: 'bg-purple-500' }
  ];

  useEffect(() => {
    setTickets(mockTickets);
  }, []);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const newTicket = {
      id: tickets.length + 1,
      ...createForm,
      status: 'open',
      student: user?.username || 'You',
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: 0
    };
    
    setTickets([newTicket, ...tickets]);
    setShowCreateModal(false);
    setCreateForm({
      title: '',
      description: '',
      subject: '',
      priority: 'medium',
      category: 'concept'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'assigned': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    return priorities.find(p => p.id === priority)?.color || 'bg-gray-500';
  };

  const getCategoryIcon = (category) => {
    return categories.find(c => c.id === category)?.icon || BookOpenIcon;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const TicketCard = ({ ticket }) => {
    const CategoryIcon = getCategoryIcon(ticket.category);
    const isOwner = ticket.student === user?.username || ticket.student === 'You';
    
    return (
      <div className="starguide-card hover:border-blue-500/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-white mr-3">{ticket.title}</h3>
              {isOwner && (
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">YOUR REQUEST</span>
              )}
            </div>
            
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{ticket.description}</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <CategoryIcon className="w-4 h-4 mr-1 text-gray-400" />
                <span className="text-gray-400 text-sm">{categories.find(c => c.id === ticket.category)?.label}</span>
              </div>
              
              <span className="badge badge-info">{ticket.subject}</span>
              
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${getPriorityColor(ticket.priority)}`}></div>
                <span className="text-gray-400 text-sm">{ticket.priority}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)} text-white mb-2`}>
              {ticket.status.toUpperCase()}
            </div>
            <p className="text-gray-500 text-sm">{formatTimeAgo(ticket.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              {ticket.student}
            </div>
            
            {ticket.assignedTo && (
              <div className="flex items-center">
                <AcademicCapIcon className="w-4 h-4 mr-1 text-green-500" />
                {ticket.assignedTo}
              </div>
            )}
            
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
              {ticket.responses} responses
            </div>
          </div>
          
          <button className="btn-secondary text-sm px-4 py-1">
            View Details
          </button>
        </div>
      </div>
    );
  };

  const userTickets = tickets.filter(ticket => 
    ticket.student === user?.username || ticket.student === 'You'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
            SOS Station
          </h1>
          <p className="text-gray-400">Get help from teachers and mentors when you're stuck</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Request Help
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="starguide-card text-center">
          <ClockIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{tickets.filter(t => t.status === 'open').length}</p>
          <p className="text-gray-400 text-sm">Open Requests</p>
        </div>
        
        <div className="starguide-card text-center">
          <AcademicCapIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{tickets.filter(t => t.status === 'assigned').length}</p>
          <p className="text-gray-400 text-sm">Being Helped</p>
        </div>
        
        <div className="starguide-card text-center">
          <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{tickets.filter(t => t.status === 'resolved').length}</p>
          <p className="text-gray-400 text-sm">Resolved</p>
        </div>
        
        <div className="starguide-card text-center">
          <UserIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{userTickets.length}</p>
          <p className="text-gray-400 text-sm">Your Requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'request-help', label: 'Request Help' },
          { id: 'my-requests', label: 'My Requests' },
          { id: 'help-others', label: 'Help Others' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-red-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Request Help Tab */}
      {activeTab === 'request-help' && (
        <div className="space-y-6">
          <div className="starguide-card">
            <h2 className="text-2xl font-semibold text-white mb-6">How SOS Station Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Submit Request</h3>
                <p className="text-gray-400 text-sm">Describe your problem or question in detail</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Get Assigned</h3>
                <p className="text-gray-400 text-sm">A teacher or mentor will be assigned to help you</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Get Help</h3>
                <p className="text-gray-400 text-sm">Receive personalized assistance and guidance</p>
              </div>
            </div>
          </div>

          <div className="starguide-card">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Help Requests</h2>
            <div className="space-y-4">
              {tickets.filter(t => t.status !== 'closed').slice(0, 5).map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'my-requests' && (
        <div className="space-y-6">
          {userTickets.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No help requests yet</h3>
              <p className="text-gray-500 mb-6">When you need help, don't hesitate to ask!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Request Help Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help Others Tab */}
      {activeTab === 'help-others' && (
        <div className="space-y-6">
          <div className="starguide-card">
            <h2 className="text-xl font-semibold text-white mb-4">Available to Help</h2>
            <p className="text-gray-400 mb-6">Help fellow students and earn XP by sharing your knowledge</p>
            
            <div className="space-y-4">
              {tickets.filter(t => t.status === 'open' && t.student !== user?.username && t.student !== 'You').map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Request Help</h2>
            
            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Briefly describe your problem"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    required
                    className="form-input"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm({...createForm, subject: e.target.value})}
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    required
                    className="form-input"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Priority</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {priorities.map(priority => (
                    <label
                      key={priority.id}
                      className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        createForm.priority === priority.id
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority.id}
                        checked={createForm.priority === priority.id}
                        onChange={(e) => setCreateForm({...createForm, priority: e.target.value})}
                        className="sr-only"
                      />
                      <div className={`w-3 h-3 rounded-full mr-3 ${priority.color}`}></div>
                      <span className="text-white text-sm">{priority.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  required
                  className="form-input"
                  rows="6"
                  placeholder="Provide as much detail as possible about your problem. Include any error messages, code snippets, or specific areas where you're stuck."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                />
                <p className="text-gray-500 text-sm mt-2">
                  💡 Tip: The more details you provide, the better help you'll receive!
                </p>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOSStation;