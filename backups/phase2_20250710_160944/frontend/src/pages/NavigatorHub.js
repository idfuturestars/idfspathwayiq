import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  UserGroupIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const NavigatorHub = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    category: 'technical',
    subject: '',
    message: '',
    urgency: 'normal'
  });

  const supportCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: LightBulbIcon,
      description: 'New to PathwayIQ? Start here for basic navigation and setup'
    },
    {
      id: 'pathways',
      title: 'Learning Pathways',
      icon: BookOpenIcon,
      description: 'Help with pathway selection, progress tracking, and recommendations'
    },
    {
      id: 'academic',
      title: 'Academic Support',
      icon: AcademicCapIcon,
      description: 'College prep, study strategies, and academic planning assistance'
    },
    {
      id: 'career',
      title: 'Career Guidance',
      icon: BriefcaseIcon,
      description: 'Career planning, job search, and professional development support'
    },
    {
      id: 'technical',
      title: 'Technical Issues',
      icon: ExclamationTriangleIcon,
      description: 'Platform bugs, login problems, and technical troubleshooting'
    },
    {
      id: 'community',
      title: 'Community & Circles',
      icon: UserGroupIcon,
      description: 'Help with learning circles, community features, and collaboration'
    }
  ];

  const faqData = {
    'getting-started': [
      {
        question: 'How do I choose the right learning pathway?',
        answer: 'Use the Talent Compass assessment to identify your strengths and interests. Based on your results, PathwayIQ will recommend personalized learning pathways that align with your goals and current skill level.'
      },
      {
        question: 'What is the difference between academic and career pathways?',
        answer: 'Academic pathways focus on educational progression (K-12, college prep, graduate studies), while career pathways are designed around specific professional goals and skill development for particular industries or roles.'
      },
      {
        question: 'How do I track my progress?',
        answer: 'Your progress is automatically tracked in the Milestone Tracker. You can view completed modules, earned achievements, and your overall pathway completion percentage in your dashboard.'
      }
    ],
    'pathways': [
      {
        question: 'Can I switch between different pathways?',
        answer: 'Yes! You can explore multiple pathways simultaneously or switch focus as your interests evolve. Your progress in each pathway is saved independently.'
      },
      {
        question: 'How long does it take to complete a pathway?',
        answer: 'Pathway duration varies based on complexity and your study pace. Academic pathways typically take 8-16 weeks, while skill-specific pathways may take 4-12 weeks with consistent effort.'
      },
      {
        question: 'What happens when I complete a pathway?',
        answer: 'Upon completion, you receive a verified certificate, unlock advanced pathways, and gain access to career-specific resources and opportunities.'
      }
    ],
    'academic': [
      {
        question: 'How can PathwayIQ help with college preparation?',
        answer: 'Our college prep pathways include SAT/ACT preparation, essay writing support, college selection guidance, and financial aid resources. We also connect you with academic mentors and peer study groups.'
      },
      {
        question: 'Do you offer support for graduate school planning?',
        answer: 'Yes! We provide graduate school pathways including GRE/GMAT prep, research methodology training, and application guidance for various graduate programs.'
      }
    ],
    'career': [
      {
        question: 'How do I transition to a new career field?',
        answer: 'Our career transition pathways provide step-by-step guidance including skill gap analysis, required certifications, networking strategies, and industry-specific preparation.'
      },
      {
        question: 'Can I connect with professionals in my field of interest?',
        answer: 'Yes! Through our professional network, you can schedule mentoring sessions with industry experts and join career-focused learning circles.'
      }
    ],
    'technical': [
      {
        question: 'I\'m having trouble logging in. What should I do?',
        answer: 'Try resetting your password using the "Forgot Password" link. If issues persist, clear your browser cache or try a different browser. Contact our technical support team for further assistance.'
      },
      {
        question: 'Why isn\'t my progress saving?',
        answer: 'Ensure you have a stable internet connection and that you\'re completing modules fully before navigating away. If the problem continues, please contact technical support with details about your browser and device.'
      }
    ],
    'community': [
      {
        question: 'How do I join a learning circle?',
        answer: 'Browse available learning circles in the Learning Circles section, filter by your interests, and click "Join Circle" on circles that match your goals and schedule.'
      },
      {
        question: 'Can I create my own learning circle?',
        answer: 'Absolutely! Click "Create Circle" in the Learning Circles section, set your focus area, schedule, and invite others to join your collaborative learning journey.'
      }
    ]
  };

  const quickActions = [
    {
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      icon: ChatBubbleLeftRightIcon,
      action: () => alert('Live chat would open here'),
      available: true
    },
    {
      title: 'Schedule Consultation',
      description: 'Book a one-on-one guidance session',
      icon: ClockIcon,
      action: () => alert('Consultation scheduler would open here'),
      available: true
    },
    {
      title: 'Report Technical Issue',
      description: 'Submit a detailed technical support request',
      icon: ExclamationTriangleIcon,
      action: () => setShowContactForm(true),
      available: true
    },
    {
      title: 'Contact Mentor',
      description: 'Reach out to your assigned pathway mentor',
      icon: UserGroupIcon,
      action: () => alert('Mentor contact would open here'),
      available: user?.mentor_assigned
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Support request submitted! We\'ll get back to you within 24 hours.');
    setShowContactForm(false);
    setContactForm({
      category: 'technical',
      subject: '',
      message: '',
      urgency: 'normal'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <QuestionMarkCircleIcon className="w-8 h-8 text-gray-400 mr-3" />
            Navigator Hub
          </h1>
          <p className="text-gray-400">Get help, find answers, and connect with support</p>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-white">24/7</div>
          <div className="text-gray-400 text-sm">Support Available</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            disabled={!action.available}
            className={`starguide-card text-left hover:border-gray-500 transition-all duration-300 ${
              !action.available ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            <action.icon className={`w-8 h-8 mb-3 ${action.available ? 'text-gray-400' : 'text-gray-600'}`} />
            <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
            <p className="text-gray-400 text-sm">{action.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Categories */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-white mb-6">Support Categories</h2>
          <div className="space-y-3">
            {supportCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gray-700 border border-gray-600'
                    : 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                }`}
              >
                <div className="flex items-center mb-2">
                  <category.icon className="w-5 h-5 text-gray-400 mr-3" />
                  <h3 className="text-white font-semibold">{category.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{category.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-6">
            Frequently Asked Questions
            {supportCategories.find(cat => cat.id === selectedCategory) && (
              <span className="text-lg font-normal text-gray-400 ml-3">
                - {supportCategories.find(cat => cat.id === selectedCategory).title}
              </span>
            )}
          </h2>
          
          <div className="space-y-4">
            {faqData[selectedCategory]?.map((faq, index) => (
              <div key={index} className="starguide-card">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-start">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-gray-300 leading-relaxed ml-7">{faq.answer}</p>
              </div>
            )) || (
              <div className="starguide-card text-center py-8">
                <QuestionMarkCircleIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No FAQs available for this category yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="starguide-card text-center">
          <EnvelopeIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
          <p className="text-gray-400 text-sm mb-3">Get detailed help via email</p>
          <a href="mailto:support@pathwayiq.com" className="text-gray-300 hover:text-white transition-colors">
            support@pathwayiq.com
          </a>
        </div>
        
        <div className="starguide-card text-center">
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
          <p className="text-gray-400 text-sm mb-3">Instant support during business hours</p>
          <p className="text-gray-300">Mon-Fri: 9 AM - 8 PM EST</p>
        </div>
        
        <div className="starguide-card text-center">
          <PhoneIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Phone Support</h3>
          <p className="text-gray-400 text-sm mb-3">Speak with a support specialist</p>
          <a href="tel:+1-800-PATHWAY" className="text-gray-300 hover:text-white transition-colors">
            1-800-PATHWAY
          </a>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Contact Support</h3>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="form-label">Category</label>
                <select
                  value={contactForm.category}
                  onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                  className="form-input"
                >
                  <option value="technical">Technical Issue</option>
                  <option value="pathways">Pathway Guidance</option>
                  <option value="academic">Academic Support</option>
                  <option value="career">Career Guidance</option>
                  <option value="billing">Billing Question</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="form-input"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="form-input"
                  rows="4"
                  placeholder="Please provide detailed information about your issue"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Urgency</label>
                <select
                  value={contactForm.urgency}
                  onChange={(e) => setContactForm({...contactForm, urgency: e.target.value})}
                  className="form-input"
                >
                  <option value="low">Low - General question</option>
                  <option value="normal">Normal - Standard support</option>
                  <option value="high">High - Urgent issue</option>
                  <option value="critical">Critical - System down</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigatorHub;