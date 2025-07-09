import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BriefcaseIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ClockIcon,
  AcademicCapIcon,
  UserGroupIcon,
  LightBulbIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const CareerInsights = () => {
  const { user } = useAuth();
  const [selectedIndustry, setSelectedIndustry] = useState('technology');
  const [selectedRegion, setSelectedRegion] = useState('united-states');
  const [careerData, setCareerData] = useState(null);
  const [loading, setLoading] = useState(false);

  const industries = [
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'engineering', name: 'Engineering', icon: '⚙️' },
    { id: 'creative', name: 'Creative & Design', icon: '🎨' },
    { id: 'business', name: 'Business', icon: '📊' },
    { id: 'science', name: 'Science & Research', icon: '🔬' }
  ];

  const regions = [
    { id: 'united-states', name: 'United States' },
    { id: 'canada', name: 'Canada' },
    { id: 'europe', name: 'Europe' },
    { id: 'asia-pacific', name: 'Asia-Pacific' },
    { id: 'global', name: 'Global' }
  ];

  // Mock career data
  const mockCareerData = {
    technology: {
      overview: {
        total_jobs: 847000,
        growth_rate: 12.4,
        median_salary: 95000,
        job_satisfaction: 4.2
      },
      top_roles: [
        {
          title: 'Software Engineer',
          demand: 'Very High',
          salary_range: '$85,000 - $160,000',
          growth_projection: '+15%',
          education_required: 'Bachelor\'s Degree',
          skills: ['JavaScript', 'Python', 'React', 'Node.js'],
          pathway_match: 92
        },
        {
          title: 'Data Scientist',
          demand: 'High',
          salary_range: '$90,000 - $180,000',
          growth_projection: '+22%',
          education_required: 'Bachelor\'s/Master\'s Degree',
          skills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
          pathway_match: 88
        },
        {
          title: 'UX/UI Designer',
          demand: 'High',
          salary_range: '$70,000 - $140,000',
          growth_projection: '+18%',
          education_required: 'Bachelor\'s Degree or Portfolio',
          skills: ['Figma', 'Design Thinking', 'Prototyping', 'User Research'],
          pathway_match: 75
        },
        {
          title: 'DevOps Engineer',
          demand: 'Very High',
          salary_range: '$95,000 - $170,000',
          growth_projection: '+20%',
          education_required: 'Bachelor\'s Degree',
          skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
          pathway_match: 82
        }
      ],
      skills_in_demand: [
        { skill: 'Artificial Intelligence', demand: 95 },
        { skill: 'Cloud Computing', demand: 88 },
        { skill: 'Cybersecurity', demand: 91 },
        { skill: 'Data Analysis', demand: 85 },
        { skill: 'Mobile Development', demand: 78 }
      ],
      market_trends: [
        'Remote work continues to be prevalent, with 73% of tech jobs offering remote options',
        'AI and machine learning roles are growing 35% faster than other tech positions',
        'Cybersecurity professionals are in critical demand due to increasing digital threats',
        'Cloud computing skills are essential across all technology roles'
      ]
    }
  };

  useEffect(() => {
    loadCareerData();
  }, [selectedIndustry, selectedRegion]);

  const loadCareerData = async () => {
    setLoading(true);
    try {
      // Use mock data for now
      setTimeout(() => {
        setCareerData(mockCareerData[selectedIndustry] || mockCareerData.technology);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load career data:', error);
      setCareerData(mockCareerData.technology);
      setLoading(false);
    }
  };

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'Very High': return 'text-white bg-gray-600';
      case 'High': return 'text-white bg-gray-500';
      case 'Medium': return 'text-gray-900 bg-gray-400';
      case 'Low': return 'text-gray-900 bg-gray-300';
      default: return 'text-white bg-gray-500';
    }
  };

  const RoleCard = ({ role }) => (
    <div className="starguide-card hover:border-gray-500 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">{role.title}</h3>
          <div className="flex items-center space-x-3 mb-3">
            <span className={`badge ${getDemandColor(role.demand)}`}>
              {role.demand} Demand
            </span>
            <span className="text-gray-400 text-sm">{role.education_required}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-300 font-bold text-lg">{role.pathway_match}%</div>
          <div className="text-gray-400 text-sm">Match</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="text-gray-400 mb-1">Salary Range</div>
          <div className="text-white font-medium">{role.salary_range}</div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Growth Projection</div>
          <div className="text-white font-medium">{role.growth_projection}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-gray-400 text-sm mb-2">Key Skills:</div>
        <div className="flex flex-wrap gap-2">
          {role.skills.map((skill, index) => (
            <span key={index} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button className="text-gray-400 hover:text-white transition-colors text-sm">
          View Pathway →
        </button>
        <button className="btn-primary text-sm">
          <BriefcaseIcon className="w-4 h-4 mr-1" />
          Explore Role
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <ChartBarIcon className="w-8 h-8 text-gray-400 mr-3" />
            Career Insights
          </h1>
          <p className="text-gray-400">Explore career opportunities and industry trends</p>
        </div>
        
        <div className="flex gap-4">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="form-input"
          >
            {industries.map(industry => (
              <option key={industry.id} value={industry.id}>
                {industry.icon} {industry.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="form-input"
          >
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      ) : careerData && (
        <>
          {/* Industry Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="starguide-card text-center">
              <BriefcaseIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-1">
                {careerData.overview.total_jobs.toLocaleString()}
              </h3>
              <p className="text-gray-400 text-sm">Available Jobs</p>
            </div>
            
            <div className="starguide-card text-center">
              <ArrowTrendingUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-1">
                +{careerData.overview.growth_rate}%
              </h3>
              <p className="text-gray-400 text-sm">Growth Rate</p>
            </div>
            
            <div className="starguide-card text-center">
              <CurrencyDollarIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-1">
                ${careerData.overview.median_salary.toLocaleString()}
              </h3>
              <p className="text-gray-400 text-sm">Median Salary</p>
            </div>
            
            <div className="starguide-card text-center">
              <UserGroupIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-1">
                {careerData.overview.job_satisfaction}/5
              </h3>
              <p className="text-gray-400 text-sm">Job Satisfaction</p>
            </div>
          </div>

          {/* Top Career Roles */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Top Career Opportunities in {industries.find(i => i.id === selectedIndustry)?.name}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {careerData.top_roles.map((role, index) => (
                <RoleCard key={index} role={role} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills in Demand */}
            <div className="starguide-card">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <LightBulbIcon className="w-6 h-6 text-gray-400 mr-2" />
                Skills in Demand
              </h2>
              
              <div className="space-y-4">
                {careerData.skills_in_demand.map((skillData, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white font-medium">{skillData.skill}</span>
                      <span className="text-gray-400">{skillData.demand}% demand</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${skillData.demand}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 btn-secondary">
                View Skill Development Pathways
              </button>
            </div>

            {/* Market Trends */}
            <div className="starguide-card">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <TrendingUpIcon className="w-6 h-6 text-gray-400 mr-2" />
                Market Trends
              </h2>
              
              <div className="space-y-4">
                {careerData.market_trends.map((trend, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-300 text-sm leading-relaxed">{trend}</p>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 btn-secondary">
                View Detailed Market Report
              </button>
            </div>
          </div>

          {/* Career Planning Tools */}
          <div className="starguide-card">
            <h2 className="text-2xl font-bold text-white mb-6">Career Planning Tools</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Skills Gap Analysis</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Identify the skills you need to develop for your target role
                </p>
                <button className="btn-primary w-full">
                  Start Analysis
                </button>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Professional Network</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Connect with professionals in your field of interest
                </p>
                <button className="btn-primary w-full">
                  Explore Network
                </button>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Career Timeline</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Create a personalized career development timeline
                </p>
                <button className="btn-primary w-full">
                  Build Timeline
                </button>
              </div>
            </div>
          </div>

          {/* External Resources */}
          <div className="starguide-card">
            <h2 className="text-2xl font-bold text-white mb-6">External Career Resources</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Bureau of Labor Statistics', url: '#', description: 'Official employment projections and data' },
                { name: 'LinkedIn Learning', url: '#', description: 'Professional skill development courses' },
                { name: 'Glassdoor', url: '#', description: 'Salary information and company reviews' },
                { name: 'Indeed Career Guide', url: '#', description: 'Job search tips and career advice' },
                { name: 'Coursera for Business', url: '#', description: 'Professional certificates and degrees' },
                { name: 'AngelList', url: '#', description: 'Startup and tech company opportunities' }
              ].map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <div>
                    <h3 className="text-white font-medium">{resource.name}</h3>
                    <p className="text-gray-400 text-sm">{resource.description}</p>
                  </div>
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CareerInsights;