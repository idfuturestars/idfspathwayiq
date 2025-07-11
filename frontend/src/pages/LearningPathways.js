import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AcademicCapIcon, 
  BriefcaseIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  BookOpenIcon,
  UserGroupIcon,
  LightBulbIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const LearningPathways = () => {
  const [pathways, setPathways] = useState([]);
  const [userPathways, setUserPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [pathwayModules, setPathwayModules] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchPathways();
    fetchUserPathways();
  }, []);

  const fetchPathways = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/idfs/pathways`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPathways(data.pathways || []);
      }
    } catch (error) {
      console.error('Error fetching pathways:', error);
      setError('Failed to load learning pathways');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPathways = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/idfs/user-pathways`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPathways(data.pathways || []);
      }
    } catch (error) {
      console.error('Error fetching user pathways:', error);
    }
  };

  const fetchPathwayModules = async (pathwayType) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/idfs/pathways/${pathwayType}/modules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPathwayModules(data.modules || []);
      }
    } catch (error) {
      console.error('Error fetching pathway modules:', error);
    }
  };

  const enrollInPathway = async (pathwayType) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/idfs/user-pathway?pathway_type=${pathwayType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchUserPathways();
        alert('Successfully enrolled in pathway!');
      }
    } catch (error) {
      console.error('Error enrolling in pathway:', error);
      alert('Failed to enroll in pathway');
    }
  };

  const getPathwayIcon = (pathwayType) => {
    switch (pathwayType) {
      case 'vocational':
        return <BriefcaseIcon className="h-8 w-8" />;
      case 'community_college':
        return <AcademicCapIcon className="h-8 w-8" />;
      case 'career_assessment':
        return <ChartBarIcon className="h-8 w-8" />;
      case 'social_justice':
        return <UserGroupIcon className="h-8 w-8" />;
      default:
        return <BookOpenIcon className="h-8 w-8" />;
    }
  };

  const getPathwayColor = (pathwayType) => {
    switch (pathwayType) {
      case 'vocational':
        return 'bg-blue-500';
      case 'community_college':
        return 'bg-green-500';
      case 'career_assessment':
        return 'bg-purple-500';
      case 'social_justice':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isEnrolled = (pathwayType) => {
    return userPathways.some(up => up.pathway_type === pathwayType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            IDFS Learning Pathways
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your future with personalized educational pathways designed to help you achieve your career goals.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 text-red-400">⚠️</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* User's Active Pathways */}
        {userPathways.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Active Pathways</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userPathways.map((pathway) => (
                <div key={pathway.pathway_type} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-blue-500 mr-3">
                        {getPathwayIcon(pathway.pathway_type)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {pathway.pathway_type.replace('_', ' ').toUpperCase()}
                      </h3>
                    </div>
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{pathway.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pathway.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Started: {new Date(pathway.started_at).toLocaleDateString()}</p>
                    <p>Modules: {pathway.completed_modules.length}/{pathway.modules.length}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Pathways */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Learning Pathways</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pathways.map((pathway) => (
              <div key={pathway.pathway_id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className={`${getPathwayColor(pathway.pathway_type)} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      {getPathwayIcon(pathway.pathway_type)}
                    </div>
                    <div className="text-white text-sm font-medium">
                      {pathway.duration}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {pathway.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {pathway.description}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Target Audience:</h4>
                    <p className="text-sm text-gray-600">{pathway.target_audience}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Learning Outcomes:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {pathway.learning_outcomes.slice(0, 3).map((outcome, index) => (
                        <li key={index} className="flex items-start">
                          <StarIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => {
                        setSelectedPathway(pathway);
                        fetchPathwayModules(pathway.pathway_type);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                    >
                      View Details
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </button>
                    
                    {!isEnrolled(pathway.pathway_type) && (
                      <button
                        onClick={() => enrollInPathway(pathway.pathway_type)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Enroll Now
                      </button>
                    )}
                    
                    {isEnrolled(pathway.pathway_type) && (
                      <span className="text-green-600 text-sm font-medium">
                        Enrolled ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pathway Details Modal */}
        {selectedPathway && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPathway.name}
                  </h2>
                  <button
                    onClick={() => setSelectedPathway(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">{selectedPathway.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Duration</h3>
                    <p className="text-gray-600 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      {selectedPathway.duration}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Audience</h3>
                    <p className="text-gray-600 flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      {selectedPathway.target_audience}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Outcomes</h3>
                  <ul className="space-y-2">
                    {selectedPathway.learning_outcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start">
                        <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Course Modules ({pathwayModules.length})
                  </h3>
                  <div className="grid gap-4">
                    {pathwayModules.map((module, index) => (
                      <div key={module.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {index + 1}. {module.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {module.description}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 space-x-4">
                              <span className="flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {module.estimated_duration}
                              </span>
                              <span className="flex items-center">
                                <ChartBarIcon className="h-3 w-3 mr-1" />
                                {module.difficulty_level}
                              </span>
                              {module.salary_info && (
                                <span className="flex items-center">
                                  <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                  Salary Info Available
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedPathway(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                  {!isEnrolled(selectedPathway.pathway_type) && (
                    <button
                      onClick={() => {
                        enrollInPathway(selectedPathway.pathway_type);
                        setSelectedPathway(null);
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                      Enroll in This Pathway
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathways;