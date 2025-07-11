import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon,
  UserIcon,
  AcademicCapIcon,
  LightBulbIcon,
  HeartIcon,
  HandRaisedIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  BeakerIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

const CareerExplorer = () => {
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [careerInterests, setCareerInterests] = useState([]);
  const { user } = useAuth();

  const careerClusters = [
    { id: 'healthcare', name: 'Healthcare & Medicine', icon: HeartIcon, color: 'bg-red-500' },
    { id: 'technology', name: 'Technology & IT', icon: BeakerIcon, color: 'bg-blue-500' },
    { id: 'education', name: 'Education & Training', icon: AcademicCapIcon, color: 'bg-green-500' },
    { id: 'business', name: 'Business & Finance', icon: BriefcaseIcon, color: 'bg-purple-500' },
    { id: 'skilled_trades', name: 'Skilled Trades', icon: WrenchScrewdriverIcon, color: 'bg-yellow-500' },
    { id: 'arts', name: 'Arts & Design', icon: PaintBrushIcon, color: 'bg-pink-500' },
    { id: 'social_services', name: 'Social Services', icon: HandRaisedIcon, color: 'bg-indigo-500' },
    { id: 'government', name: 'Government & Public Service', icon: BuildingOfficeIcon, color: 'bg-gray-500' },
    { id: 'law', name: 'Law & Justice', icon: ScaleIcon, color: 'bg-orange-500' },
    { id: 'hospitality', name: 'Hospitality & Tourism', icon: GlobeAltIcon, color: 'bg-teal-500' },
    { id: 'are_you_the_one', name: 'Are You The One™ - Elite Development', icon: StarIcon, color: 'bg-gradient-to-r from-purple-600 to-blue-600' }
  ];

  useEffect(() => {
    fetchAssessmentQuestions();
  }, []);

  const fetchAssessmentQuestions = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/idfs/career-assessment/questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssessmentQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching assessment questions:', error);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCareerInterestToggle = (clusterId) => {
    setCareerInterests(prev => 
      prev.includes(clusterId) 
        ? prev.filter(id => id !== clusterId)
        : [...prev, clusterId]
    );
  };

  const submitAssessment = async () => {
    if (careerInterests.length === 0) {
      alert('Please select at least one career interest area');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/idfs/career-assessment/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_responses: responses,
          career_interests: careerInterests
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to analyze career assessment');
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setResponses({});
    setCareerInterests([]);
    setCurrentQuestion(0);
    setShowResults(false);
    setResults(null);
  };

  const getClusterIcon = (clusterId) => {
    const cluster = careerClusters.find(c => c.id === clusterId);
    return cluster ? cluster.icon : BriefcaseIcon;
  };

  const getClusterName = (clusterId) => {
    const cluster = careerClusters.find(c => c.id === clusterId);
    return cluster ? cluster.name : clusterId;
  };

  const getClusterColor = (clusterId) => {
    const cluster = careerClusters.find(c => c.id === clusterId);
    return cluster ? cluster.color : 'bg-gray-500';
  };

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Career Assessment Results
            </h1>
            <p className="text-lg text-gray-600">
              Based on your responses, here are your personalized career recommendations
            </p>
          </div>

          {/* Career Clusters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Career Interest Areas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.career_clusters.map((clusterId) => {
                const Icon = getClusterIcon(clusterId);
                return (
                  <div key={clusterId} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className={`${getClusterColor(clusterId)} p-2 rounded-full`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {getClusterName(clusterId)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salary Insights */}
          {results.salary_insights && results.salary_insights.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Salary Insights
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {results.salary_insights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {insight.career_cluster}
                    </h3>
                    <div className="flex items-center text-green-600 mb-2">
                      <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm font-medium">
                        Salary data available from {insight.modules_count} sources
                      </span>
                    </div>
                    {insight.salary_data && insight.salary_data.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {insight.salary_data.map((data, i) => (
                          <div key={i} className="flex flex-wrap gap-1 mt-1">
                            {data.ranges && data.ranges.map((range, j) => (
                              <span key={j} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {range}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Pathways */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recommended Learning Pathways
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {results.recommended_pathways.map((pathway) => (
                <div key={pathway.pathway_id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {pathway.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {pathway.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Duration: {pathway.duration}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Learn More →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-x-4">
            <button
              onClick={resetAssessment}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Take Assessment Again
            </button>
            <button
              onClick={() => window.location.href = '/learning-pathways'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore Learning Pathways
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Career Interest Explorer
          </h1>
          <p className="text-lg text-gray-600">
            Discover your career interests and find the perfect learning pathway
          </p>
        </div>

        {/* Career Interest Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Step 1: Select Your Career Interest Areas
          </h2>
          <p className="text-gray-600 mb-6">
            Choose the career areas that interest you most. You can select multiple areas.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerClusters.map((cluster) => {
              const Icon = cluster.icon;
              const isSelected = careerInterests.includes(cluster.id);
              
              return (
                <div
                  key={cluster.id}
                  onClick={() => handleCareerInterestToggle(cluster.id)}
                  className={`
                    cursor-pointer border-2 rounded-lg p-4 transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${cluster.color} p-2 rounded-full`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{cluster.name}</h3>
                    </div>
                    {isSelected && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment Questions */}
        {assessmentQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Step 2: Answer Assessment Questions (Optional)
            </h2>
            <p className="text-gray-600 mb-6">
              These questions help us better understand your preferences and provide more accurate recommendations.
            </p>
            
            <div className="space-y-6">
              {assessmentQuestions.slice(0, 5).map((question, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    {index + 1}. {question.question}
                  </h3>
                  
                  {question.type === 'multiple_choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            onChange={(e) => handleResponseChange(index, e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {question.type !== 'multiple_choice' && (
                    <textarea
                      placeholder="Your response..."
                      value={responses[index] || ''}
                      onChange={(e) => handleResponseChange(index, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={submitAssessment}
            disabled={loading || careerInterests.length === 0}
            className={`
              px-8 py-3 rounded-lg font-medium text-white transition-colors
              ${loading || careerInterests.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing Your Results...</span>
              </div>
            ) : (
              'Get My Career Recommendations'
            )}
          </button>
          
          {careerInterests.length === 0 && (
            <p className="text-red-500 text-sm mt-2">
              Please select at least one career interest area to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerExplorer;