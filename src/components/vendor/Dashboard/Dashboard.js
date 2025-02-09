import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/common/Card";
import { 
  FileText, Users, Clock, 
  Award, BookOpen, TrendingUp, Shield, 
  PlusCircle,  
  BarChart3, 
  ArrowRight,
  Settings,
  Download,
  UserX,
  Zap,
  ClipboardList,
  TrendingDown
} from 'lucide-react';
import Layout from '../../layout/Layout';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const getMetricValueColor = (title) => {
  const colors = {
    'Total Tests': 'text-blue-600',
    'Active Candidates': 'text-green-600',
    'Pass Rate': 'text-amber-600',
    'Avg Time Spent': 'text-purple-600'
  };
  return colors[title] || colors['Total Tests'];
};



// Add this helper function with the other helper functions at the top
const getMetricIcon = (title) => {
  const icons = {
    'Total Tests': <FileText className="h-5 w-5 text-blue-500" />,
    'Active Candidates': <Users className="h-5 w-5 text-green-500" />,
    'Pass Rate': <Award className="h-5 w-5 text-amber-500" />,
    'Avg Time Spent': <Clock className="h-5 w-5 text-purple-500" />
  };
  return icons[title] || icons['Total Tests'];
};

// Add this helper function with the other helper functions at the top
const getMetricBgColor = (title) => {
  const colors = {
    'Total Tests': 'bg-blue-50',
    'Active Candidates': 'bg-green-50',
    'Pass Rate': 'bg-amber-50',
    'Avg Time Spent': 'bg-purple-50'
  };
  return colors[title] || colors['Total Tests'];
};

// Add this helper function for metric colors
const getMetricColor = (title) => {
  const colors = {
    'Total Tests': 'bg-blue-100 text-blue-600',
    'Active Candidates': 'bg-green-100 text-green-600',
    'Pass Rate': 'bg-purple-100 text-purple-600',
    'Avg Time Spent': 'bg-amber-100 text-amber-600'
  };
  return colors[title] || 'bg-gray-100 text-gray-600';
};

// Enhanced MetricCard with hover effects and animations
const MetricCard = ({ title, value, trend, subtitle, details }) => {
  const formatValue = () => {
    switch (title) {
      case 'Avg Time Spent':
        // Add console.log to debug the value
        console.log('Avg Time Spent raw value:', value);
        const minutes = Math.round(parseInt(value) / 60);
        console.log('Converted to minutes:', minutes);
        return `${minutes}m`;
      
      case 'Pass Rate':
        return `${value}%`;
      
      default:
        return value;
    }
  };

  const getMetricIcon = () => {
    switch (title) {
      case 'Total Tests':
        return <ClipboardList className="w-7 h-7" />;
      case 'Active Candidates':
        return <Users className="w-7 h-7" />;
      case 'Pass Rate':
        return <TrendingUp className="w-7 h-7" />;
      case 'Avg Time Spent':
        return <Clock className="w-7 h-7" />;
      default:
        return null;
    }
  };

  const getDetailText = () => {
    switch (title) {
      case 'Total Tests':
        return `${details?.active || 0} active • ${details?.draft || 0} draft`;
      case 'Active Candidates':
        return `${details?.thisWeek || 0} this week`;
      case 'Pass Rate':
        return `${details?.passed || 0} of ${details?.completed || 0} passed`;
      case 'Avg Time Spent':
        return `${details?.distribution?.over60min || 0} tests > 1h`;
      default:
        return subtitle;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${getMetricColor(title)}`}>
          {getMetricIcon()}
        </div>
        {trend !== undefined && (
          <TrendBadge value={trend} />
        )}
      </div>
      
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">
          {formatValue()}
        </span>
      </div>
      <p className="text-gray-500 text-sm mt-1">
        {getDetailText()}
      </p>
    </div>
  );
};

// Update the trend badge component
const TrendBadge = ({ value }) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  return (
    <div className={`
      flex items-center px-2.5 py-0.5 rounded-full text-sm
      ${isPositive ? 'bg-green-100 text-green-800' : 
        isNeutral ? 'bg-gray-100 text-gray-800' : 
        'bg-red-100 text-red-800'}
    `}>
      {!isNeutral && (
        <span className="mr-1">
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </span>
      )}
      <span>{isNeutral ? 'No change' : `${Math.abs(value)}%`}</span>
    </div>
  );
};

// Update the metrics data structure
const getMetrics = (dashboardData) => [
  {
    title: 'Total Tests',
    value: dashboardData?.totalTests?.value || 0,
    trend: dashboardData?.totalTests?.trend,
    subtitle: dashboardData?.totalTests?.subtitle || 'Total active assessments',
    details: dashboardData?.totalTests?.details
  },
  {
    title: 'Active Candidates',
    value: dashboardData?.activeCandidates?.value || 0,
    trend: dashboardData?.activeCandidates?.trend,
    subtitle: dashboardData?.activeCandidates?.subtitle || 'In last 30 days',
    details: dashboardData?.activeCandidates?.details
  },
  {
    title: 'Pass Rate',
    value: dashboardData?.passRate?.value || 0,
    trend: dashboardData?.passRate?.trend,
    subtitle: dashboardData?.passRate?.subtitle || 'Pass rate in last 30 days',
    details: dashboardData?.passRate?.details
  },
  {
    title: 'Avg Time Spent',
    value: Math.round(parseInt(dashboardData?.avgTimeSpent?.value || 0) / 60), // Convert seconds to minutes
    trend: dashboardData?.avgTimeSpent?.trend,
    subtitle: dashboardData?.avgTimeSpent?.subtitle || 'Average test duration',
    details: dashboardData?.avgTimeSpent?.details
  }
];

// Add display name for better debugging
MetricCard.displayName = 'MetricCard';

// Add TimeRangeSelector Component
// const TimeRangeSelector = ({ activeRange, onRangeChange }) => { ... }

// Add this new pill progress indicator component
// const PillProgressIndicator = ({ value, isHighScore, trend }) => { ... }

// Add this helper function at the top with other helpers
const trimText = (text, maxLength = 16) => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Update the AssessmentProgressCard component
const AssessmentProgressCard = ({ title, category, duration, passingScore, totalScore, status, difficulty }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      className="p-4 hover:bg-gray-50/50 transition-all duration-300 cursor-pointer"
      onClick={() => navigate('/vendor/tests')}
    >
      <div className="flex items-center justify-between">
        {/* Left: Icon and Test Info */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1" title={title}>
              {trimText(title)}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span>{category}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{duration} mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Created Today */}
        <div className="text-sm text-gray-500">
          Created Today
        </div>

        {/* Right: Passing Score, Difficulty, Status */}
        <div className="flex items-center space-x-8">
          {/* Passing Score */}
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {passingScore}/{totalScore}
            </div>
            <div className="text-xs text-gray-500">
              Passing Score
            </div>
          </div>

          {/* Difficulty */}
          <span className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
            {difficulty}
          </span>

          {/* Status */}
          <div className="flex items-center space-x-1.5">
            <div className={`h-2 w-2 rounded-full ${
              status === 'published' ? 'bg-green-500' : 'bg-amber-500'
            }`} />
            <span className={`text-sm font-medium ${
              status === 'published' ? 'text-green-600' : 'text-amber-600'
            }`}>
              {status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Add this new modern skill card component
const ModernSkillCard = ({ skill, score }) => {
  const getSkillConfig = (skillName, value) => {
    const configs = {
      'Problem Solving': {
        icon: Zap,
        color: value >= 85 ? 'blue' : 'indigo',
        bgPattern: 'radial-gradient(circle at 100% 100%, #dbeafe 0%, transparent 50%)'
      },
      'Code Quality': {
        icon: FileText,
        color: value >= 80 ? 'violet' : 'purple',
        bgPattern: 'radial-gradient(circle at 0% 0%, #ede9fe 0%, transparent 50%)'
      },
      'Performance': {
        icon: TrendingUp,
        color: value >= 90 ? 'green' : 'emerald',
        bgPattern: 'radial-gradient(circle at 100% 0%, #dcfce7 0%, transparent 50%)'
      },
      'Security': {
        icon: Shield,
        color: value >= 85 ? 'cyan' : 'sky',
        bgPattern: 'radial-gradient(circle at 0% 100%, #cffafe 0%, transparent 50%)'
      },
      'Best Practices': {
        icon: Award,
        color: value >= 90 ? 'amber' : 'yellow',
        bgPattern: 'radial-gradient(circle at 50% 50%, #fef3c7 0%, transparent 50%)'
      }
    };
    return configs[skillName] || configs['Problem Solving'];
  };

  const config = getSkillConfig(skill, score);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-gray-100 h-full"
      style={{ background: config.bgPattern }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className={`p-2.5 rounded-xl bg-${config.color}-50 ring-1 ring-${config.color}-100`}
          >
            <Icon className={`h-5 w-5 text-${config.color}-500`} />
          </motion.div>
          <div>
            <h3 className="font-semibold text-gray-800">{skill}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-xs font-medium text-${config.color}-500`}>
                {score >= 90 ? 'Expert' : score >= 80 ? 'Advanced' : 'Intermediate'}
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-1.5 h-1.5 rounded-full bg-${config.color}-400`}
              />
            </div>
          </div>
        </div>
        
        <motion.div 
          className={`text-2xl font-bold text-${config.color}-500`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {score}%
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute h-full rounded-full bg-gradient-to-r from-${config.color}-400 to-${config.color}-500`}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-${config.color}-50`}>
            <Users className={`h-3.5 w-3.5 text-${config.color}-400`} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600">Candidates</div>
            <div className="text-sm font-semibold text-gray-800">{Math.round(score * 1.5)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-${config.color}-50`}>
            <TrendingUp className={`h-3.5 w-3.5 text-${config.color}-400`} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600">Growth</div>
            <div className="text-sm font-semibold text-gray-800">+{Math.round(score/10)}%</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Add this new component for circular progress
const CircularProgress = ({ progress, status }) => {
  const getStatusColors = (status) => {
    const colors = {
      'Completed': 'text-green-500 bg-green-50',
      'In Progress': 'text-blue-500 bg-blue-50',
      'Pending': 'text-amber-500 bg-amber-50',
      'Failed': 'text-red-500 bg-red-50',
      'Expired': 'text-gray-500 bg-gray-50'
    };
    return colors[status] || colors['Pending'];
  };

  const statusColor = getStatusColors(status);

  return (
    <div className="relative inline-flex">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`h-12 w-12 rounded-full ${statusColor} flex items-center justify-center`}
      >
        <div className="relative">
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            styles={buildStyles({
              rotation: 0,
              strokeLinecap: 'round',
              textSize: '24px',
              pathTransitionDuration: 0.5,
              pathColor: status === 'Completed' ? '#22c55e' :
                         status === 'In Progress' ? '#3b82f6' :
                         status === 'Pending' ? '#f59e0b' :
                         status === 'Failed' ? '#ef4444' : '#6b7280',
              textColor: status === 'Completed' ? '#22c55e' :
                        status === 'In Progress' ? '#3b82f6' :
                        status === 'Pending' ? '#f59e0b' :
                        status === 'Failed' ? '#ef4444' : '#6b7280',
              trailColor: '#f3f4f6',
            })}
          />
        </div>
      </motion.div>
    </div>
  );
};

// Update the CandidateTable component
const CandidateTable = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [displayLimit, setDisplayLimit] = useState(12);
  
  useEffect(() => {
    const fetchCandidateMetrics = async () => {
      try {
        const response = await apiService.get('/vendor/candidate-metrics');
        setCandidates(response.data.candidates || []);
      } catch (err) {
        console.error('Failed to fetch candidate metrics:', err);
        setCandidates([]);
      }
    };

    fetchCandidateMetrics();
  }, []);

  // Reset display limit when filters change
  useEffect(() => {
    setDisplayLimit(12);
  }, [searchQuery, selectedStatus]);

  // First filter candidates without limit
  const allFilteredCandidates = candidates.filter(candidate => {
    const matchesStatus = selectedStatus === 'all' || 
      candidate.status.replace('_', ' ').toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch = candidate.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.testType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Then apply limit for display
  const displayCandidates = allFilteredCandidates.slice(0, displayLimit);

  // Handle load more
  const handleLoadMore = () => {
    setDisplayLimit(prevLimit => prevLimit + 12);
  };

  // Format time since last activity
  const formatTimeAgo = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  // Get status styles
  const getStatusStyles = (status) => {
    const styles = {
      'mcq_completed': 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20',
      'in_progress': 'bg-green-100 text-green-800 ring-1 ring-green-600/20',
      'pending': 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20',
      'completed': 'bg-purple-100 text-purple-800 ring-1 ring-purple-600/20'
    };
    return styles[status] || styles['pending'];
  };

  // Add status filter handler
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-white sticky top-0 z-20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                Active Test Takers
                <span className="px-2.5 py-0.5 text-sm bg-blue-50 text-blue-700 rounded-full">
                  {allFilteredCandidates.length}
                </span>
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Monitor candidate test status in real-time 
                {displayCandidates.length < allFilteredCandidates.length && 
                  ` (showing ${displayCandidates.length} of ${allFilteredCandidates.length})`}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mt-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name or test type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex gap-2">
              {['all', 'completed', 'in_progress', 'pending'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-0 overflow-auto max-h-[600px]">
        <table className="w-full">
          <thead className="bg-gray-50/90 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                Candidate
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                Test Type
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                Progress
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                Status
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                Last Activity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {displayCandidates.map((candidate, index) => (
              <motion.tr 
                key={candidate.candidateId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <motion.div className="relative" whileHover={{ scale: 1.05 }}>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 
                           flex items-center justify-center text-sm font-medium text-blue-700 
                           border border-blue-100 shadow-sm">
                        {candidate.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <motion.div 
                        className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white shadow-sm 
                                 flex items-center justify-center"
                        animate={{ scale: candidate.status === 'in_progress' ? [1, 1.2, 1] : 1 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <div className={`h-2.5 w-2.5 rounded-full ${
                          candidate.status === 'in_progress' ? 'bg-green-500' : 
                          candidate.status === 'completed' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`} />
                      </motion.div>
                    </motion.div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {candidate.candidateName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Registered: {new Date(candidate.registeredDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{candidate.testType}</span>
                    <span className="text-xs text-gray-500">
                      Started: {new Date(candidate.testPeriod.start).toLocaleTimeString()}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <CircularProgress 
                      progress={candidate.progress || 0} 
                      status={candidate.status}
                    />
                    <div className="flex flex-col">
                      {candidate.score && (
                        <span className="text-sm font-medium text-gray-900">
                          {candidate.score}/100
                        </span>
                      )}
                      {candidate.timeSpent > 0 ? (
                        <span className="text-sm text-gray-500">
                          {candidate.timeSpent}m spent
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-sm text-gray-500">
                            {candidate.status === 'in_progress' ? 'Just started' : 'Not started yet'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${getStatusStyles(candidate.status)}`}>
                    {candidate.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">{formatTimeAgo(candidate.lastActivity.time)}</div>
                      <div className="text-xs text-gray-500">{candidate.lastActivity.type}</div>
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Load More Button */}
        {displayCandidates.length < allFilteredCandidates.length && (
          <div className="p-4 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 
                       hover:bg-blue-100 rounded-lg transition-colors duration-200"
            >
              Load More ({allFilteredCandidates.length - displayCandidates.length} remaining)
            </motion.button>
          </div>
        )}

        {/* Empty State */}
        {displayCandidates.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UserX className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No candidates found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

// Update the EnhancedMetricCard component to remove the initial animation
const EnhancedMetricCard = ({ metric }) => {
  if (!metric) return null;

  return (
    <div className="group h-full">
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg h-full">
        <CardContent className="p-6 h-40 flex items-center">
          <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl ${getMetricBgColor(metric.title)}`}>
                {getMetricIcon(metric.title)}
              </div>
              <span className="font-medium text-gray-800">{metric.title}</span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className={`text-3xl font-bold ${getMetricValueColor(metric.title)}`}>
                  {metric.value}
                </div>
                <span className="text-sm text-gray-500 mt-1 block">
                  {metric.subtitle}
                </span>
              </div>
              {metric.trend !== undefined && (
                <div className="flex items-center gap-1">
                  <div className={`flex items-center text-sm font-medium ${
                    metric.trend > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <TrendingUp className={`h-4 w-4 ${metric.trend < 0 && 'rotate-180'}`} />
                    {Math.abs(metric.trend)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add this date filtering utility
const getFilteredTests = (tests, timeRange) => {
  const filterDate = new Date();

  switch (timeRange) {
    case '1H':
      filterDate.setHours(filterDate.getHours() - 1);
      break;
    case '1D':
      filterDate.setDate(filterDate.getDate() - 1);
      break;
    case '7D':
      filterDate.setDate(filterDate.getDate() - 7);
      break;
    case '1M':
      filterDate.setMonth(filterDate.getMonth() - 1);
      break;
    case '1Y':
      filterDate.setFullYear(filterDate.getFullYear() - 1);
      break;
    default:
      return tests;
  }

  return tests.filter(test => new Date(test.createdAt) >= filterDate);
};

// Add this new LoadingScreen component at the top of the file
const LoadingScreen = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Shimmer loading for metrics */}
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <motion.div
                className="h-[140px] relative overflow-hidden"
                animate={{
                  backgroundColor: ['#f3f4f6', '#e5e7eb', '#f3f4f6'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main content loading skeleton */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b">
                <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Second card loading skeleton */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b">
                <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar loading skeleton */}
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b">
                  <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Update the formatTestDataForExport function
const formatTestDataForExport = (tests) => {
  return tests.map(test => ({
    'Test ID': test._id,
    'Title': test.title,
    'Description': test.description,
    'Category': test.category,
    'Difficulty': test.difficulty,
    'Duration (mins)': test.duration,
    'Total Marks': test.totalMarks,
    'Passing Marks': test.passingMarks,
    'Status': test.status,
    'Created Date': new Date(test.createdAt).toLocaleDateString(),
    'Last Updated': new Date(test.updatedAt).toLocaleDateString()
  }));
};

// Update the handleExportTests function
const handleExportTests = async (tests) => {
  try {
    // Import XLSX dynamically
    const XLSX = await import('xlsx/xlsx.mjs');
    
    // Format the data
    const exportData = formatTestDataForExport(tests);
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 24 }, // Test ID
      { wch: 30 }, // Title
      { wch: 40 }, // Description
      { wch: 15 }, // Category
      { wch: 12 }, // Difficulty
      { wch: 15 }, // Duration
      { wch: 12 }, // Total Marks
      { wch: 12 }, // Passing Marks
      { wch: 10 }, // Status
      { wch: 12 }, // Created Date
      { wch: 12 }  // Last Updated
    ];
    ws['!cols'] = colWidths;
    
    // Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tests');
    
    // Generate filename with current date
    const fileName = `tests_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Error exporting tests:', error);
    // You might want to add a toast notification here
  }
};

// Add this helper function at the top
const filterTestsByTimeRange = (tests, range) => {
  const now = new Date();
  const filterDate = new Date();

  switch (range) {
    case '1H':
      filterDate.setHours(now.getHours() - 1);
      break;
    case '1D':
      filterDate.setDate(now.getDate() - 1);
      break;
    case '7D':
      filterDate.setDate(now.getDate() - 7);
      break;
    case '1M':
      filterDate.setMonth(now.getMonth() - 1);
      break;
    case '1Y':
      filterDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return tests;
  }

  return tests.filter(test => new Date(test.createdAt) >= filterDate);
};

// Update the Dashboard component
const Dashboard = () => {
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState({
    totalTests: { value: 0, trend: 0, subtitle: 'Total assessments' },
    activeCandidates: { value: 0, trend: 0, subtitle: 'Currently testing' },
    passRate: { value: 0, trend: 0, subtitle: 'Overall pass rate' },
    avgTimeSpent: { value: 0, trend: 0, subtitle: 'Average test duration' }
  });
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tests, setTests] = useState([]);

  // Simplified time range state - only keep if you plan to implement the feature soon
  const [activeTimeRange] = useState('all');

  const [selectedTimeRange, setSelectedTimeRange] = useState('7D');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await apiService.get('/vendor/tests');
        setTests(response.data.tests);
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    fetchTests();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch metrics first
        const metricsResponse = await apiService.get('/vendor/dashboard/metrics');
        const dashboardData = {
          ...metricsResponse.data,
          activeCandidates: {
            ...metricsResponse.data.activeCandidates,
            value: metricsResponse.data.activeCandidates.value,
            subtitle: 'Currently testing'
          }
        };
        
        setMetrics(dashboardData);

        // Fetch performance metrics
        const performanceResponse = await apiService.get('/vendor/analytics/performance', {
          params: { period: activeTimeRange }
        });
        setPerformanceMetrics(performanceResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeTimeRange]);

  // Update tests when time range changes
  useEffect(() => {
    if (tests.length > 0) {
      getFilteredTests(tests, activeTimeRange);
    }
  }, [tests, activeTimeRange]);

  // Filter tests based on selected time range
  const filteredTests = filterTestsByTimeRange(tests, selectedTimeRange);

  // Early return for loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Early return for error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Replace the manual metrics transformation with getMetrics
  const topMetrics = getMetrics(metrics);

  // Transform API data for skill distribution
  const skillDistribution = [
    { 
      skill: 'Problem Solving', 
      score: performanceMetrics?.skills?.problemSolving?.score || 0 
    },
    { 
      skill: 'Code Quality', 
      score: performanceMetrics?.skills?.codeQuality?.score || 0 
    },
    { 
      skill: 'Performance', 
      score: performanceMetrics?.skills?.performance?.score || 0 
    },
    { 
      skill: 'Security', 
      score: performanceMetrics?.skills?.security?.score || 0 
    },
    { 
      skill: 'Best Practices', 
      score: performanceMetrics?.skills?.bestPractices?.score || 0 
    }
  ];

  // Add these styles at the top of your file
  const styles = {
    blurEffect: {
      WebkitFilter: 'blur(2px)',
      filter: 'blur(2px)',
      position: 'relative',
    },
    comingSoonOverlay: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      zIndex: '10',
    },
  };

  return (
    <Layout>
      <div className="space-y-8 pb-8">
        {/* Enhanced Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topMetrics.map((metric, index) => (
            <EnhancedMetricCard key={index} metric={metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Updated Assessment Overview Card */}
            <Card className="col-span-2">
              <CardHeader className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Assessment Overview
                    </CardTitle>
                    <div className="text-sm text-gray-500 mt-1">
                      {filteredTests.length} tests total
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {['1H', '1D', '7D', '1M', '1Y'].map(range => (
                        <button
                          key={range}
                          onClick={() => setSelectedTimeRange(range)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            range === selectedTimeRange
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExportTests(filteredTests)}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium 
                        bg-blue-50 text-blue-600 hover:bg-blue-100 
                        transition-colors duration-200 
                        border border-blue-200"
                      disabled={filteredTests.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </motion.button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                  </div>
                ) : filteredTests.length > 0 ? (
                  filteredTests.map((test) => (
                    <AssessmentProgressCard
                      key={test._id}
                      title={test.title}
                      category={test.category}
                      duration={test.duration}
                      passingScore={test.passingMarks}
                      totalScore={test.totalMarks}
                      status={test.status}
                      difficulty={test.difficulty}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                    <p className="text-sm text-gray-500">
                      No tests were created during this time period.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Replace UserOverviewTable with CandidateTable */}
            <CandidateTable />
          </div>

          {/* Right Side */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Frequently used actions</p>
                  </div>
                  <motion.button 
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                  </motion.button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Create New Test Button */}
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/vendor/tests/create')}
                    className="w-full p-4 rounded-xl
                      bg-blue-50/50 hover:bg-blue-50
                      border border-blue-100
                      text-blue-600
                      flex items-center justify-between
                      group transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg ring-1 ring-blue-100">
                        <PlusCircle className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Create New Test</div>
                        <div className="text-xs text-blue-500/70">Start a new assessment</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-0 
                      group-hover:translate-x-1 transition-all" />
                  </motion.button>

                  {/* Analytics Button */}
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    onClick={() => navigate('/vendor/analytics/tests')}
                    className="w-full p-4 rounded-xl
                      bg-violet-50/50 hover:bg-violet-50
                      border border-violet-100
                      text-violet-600
                      flex items-center justify-between
                      group transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg ring-1 ring-violet-100">
                        <BarChart3 className="h-5 w-5 text-violet-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Analytics</div>
                        <div className="text-xs text-violet-500/70">View insights</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-violet-400 opacity-0 group-hover:opacity-100 transform translate-x-0 
                      group-hover:translate-x-1 transition-all" />
                  </motion.button>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Skills */}
            <Card>
              <CardHeader className="border-b p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Candidate Skills</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Performance by area</p>
                  </div>
                  <select className="text-sm border rounded-lg px-3 py-2 text-gray-600 bg-white shadow-sm focus:ring-2 focus:ring-blue-100 outline-none">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last year</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-6 relative">
                <div className="space-y-4" style={styles.blurEffect}>
                  {skillDistribution.map(skill => (
                    <ModernSkillCard key={skill.skill} {...skill} />
                  ))}
                </div>
                <div style={styles.comingSoonOverlay}>
                  <div className="text-center">
                    <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Coming Soon!</p>
                    <p className="text-xs text-gray-500 mt-1">Skill analytics are on the way</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
