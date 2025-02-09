import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, FileText, Users2, LogOut, ChevronDown, 
  Code, BarChart2, Calendar, Database, Activity,
  CreditCard, PieChart, X, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/auth/useAuth';

const Header = ({ isOpen, onClose }) => (
  <div className="px-4 py-4 flex items-center border-b border-gray-100">
    <Link 
      to="/" 
      className="flex items-center"
      onClick={() => {
        // Close sidebar when navigating to home
        onClose();
      }}
    >
      <div className="flex items-center">
        <img 
          src="https://res.cloudinary.com/dfdtxogcl/images/c_scale,w_248,h_180,dpr_1.25/f_auto,q_auto/v1706606519/Picture1_215dc6b/Picture1_215dc6b.png"
          alt="Test Platform Logo"
          className={`${isOpen ? 'w-12 h-12' : 'w-10 h-10'} object-contain cursor-pointer`}
        />
        
        {isOpen && (
          <div className="ml-3 flex items-center cursor-pointer">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent font-medium text-2xl">Test</span>
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent font-medium text-2xl">Platform</span>
          </div>
        )}
      </div>
    </Link>
  </div>
);

const scrollbarStyles = `
  .sidebar-scroll {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    transition: scrollbar-color 0.3s ease;
  }
  .sidebar-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .sidebar-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .sidebar-scroll::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 4px;
  }
  .sidebar-scroll:hover {
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  .sidebar-scroll:hover::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
  }
`;

const VendorSidebar = ({ isOpen, onClose, toggleButton, logoutButton }) => {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = useMemo(() => [
    {
      label: "Dashboard",
      icon: Home,
      isExpanded: true,
      children: [
        { 
          label: "Overview",  
          path: "/vendor/dashboard", 
          icon: Activity
        },
        { 
          label: "Statistics", 
          path: "/vendor/dashboard/statistics", 
          icon: PieChart 
        }
      ]
    },
    {
      label: "Assessments",
      icon: FileText,
      children: [
        { label: "All Tests", path: "/vendor/tests" },
        { label: "Create New", path: "/vendor/tests/create" },
        { label: "Edit Test", path: "/vendor/tests/edit/:testId" },
        { label: "Question Bank", path: "/vendor/tests/questions" },
        { label: "Archive", path: "/vendor/tests/archive" }
      ]
    },
    {
      label: "Candidates",
      icon: Users2,
      children: [
        { label: "All Candidates", path: "/vendor/candidates" },
        { label: "Active", path: "/vendor/candidates/active" },
        { label: "Completed", path: "/vendor/candidates/completed" }
      ]
    },
    {
      label: "Analytics",
      icon: BarChart2,
      children: [
        { label: "Test Analytics", path: "/vendor/analytics/tests" },
        { label: "Candidate Analytics", path: "/vendor/analytics/candidates" },
        { label: "Performance Insights", path: "/vendor/analytics/insights" }
      ]
    },
    {
      label: "Schedule",
      icon: Calendar,
      children: [
        { label: "Upcoming Tests", path: "/vendor/schedule/upcoming" },
        { label: "Past Tests", path: "/vendor/schedule/past" },
        { label: "Calendar View", path: "/vendor/schedule/calendar" }
      ]
    },
    {
      label: "Payments",
      icon: CreditCard,
      children: [
        { label: "Invoices", path: "/vendor/payments/invoices" },
        { label: "Wallet", path: "/vendor/payments/wallet" }
      ]
    },
    {
      label: "Resources",
      icon: Database,
      children: [
        { label: "Documentation", path: "/vendor/resources/docs" },
        { label: "API Access", path: "/vendor/resources/api" },
        { label: "Guides", path: "/vendor/resources/guides" },
        { label: "Support", path: "/vendor/resources/support" }
      ]
    }
  ], []);

  useEffect(() => {
    const currentPath = location.pathname;
    const updateOpenMenus = () => {
      menuItems.forEach(item => {
        if (item.children?.some(child => currentPath.startsWith(child.path))) {
          setOpenMenus(prev => ({ ...prev, [item.label]: true }));
        }
      });
    };
    updateOpenMenus();
  }, [location.pathname, menuItems]);

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({...prev, [menu]: !prev[menu]}));
  };

  const SidebarSection = ({ item }) => {
    const Icon = item.icon;
    const [isHovered, setIsHovered] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
    const hasChildren = item.children?.length > 0;
    
    const isActive = item.children?.some(child => 
      location.pathname === child.path || 
      location.pathname.startsWith(child.path.replace(':testId', ''))
    ) || location.pathname.startsWith(`/vendor/${item.label.toLowerCase()}`);
    
    if (!isOpen) {
      return (
        <div 
          className="relative py-2"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setDropdownPosition({
              x: rect.right + 4,
              y: rect.top
            });
            setIsHovered(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`
            flex items-center justify-center group cursor-pointer relative px-3 py-2
            ${isActive ? 'text-blue-600 bg-blue-50 rounded-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md'}
          `}>
            <Icon size={22} className="transition-colors duration-150" />
            {hasChildren && (
              <ChevronRight 
                size={14} 
                className="absolute -right-1 text-gray-400"
              />
            )}
          </div>
          {hasChildren && isHovered && (
            <div 
              className="fixed z-[60] bg-white border shadow-lg rounded-md py-1 w-max min-w-[140px]"
              style={{ 
                top: dropdownPosition.y,
                left: dropdownPosition.x
              }}
            >
              {item.children.map((child, index) => (
                <Link
                  key={index}
                  to={child.path}
                  className={`
                    block px-4 py-2 text-sm whitespace-nowrap
                    ${location.pathname === child.path 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:bg-gray-50'
                    }
                  `}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="py-1">
        <div 
          onClick={() => toggleMenu(item.label)}
          className={`
            w-full flex items-center px-4 py-2.5 cursor-pointer rounded-md
            ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}
          `}
        >
          <Icon size={22} className="transition-colors duration-150" />
          <span className="flex-1 ml-3 text-sm font-medium">{item.label}</span>
          {hasChildren && (
            <ChevronRight 
              size={14} 
              className={`transform transition-transform duration-200 text-gray-400
                ${openMenus[item.label] ? 'rotate-90' : ''}
              `}
            />
          )}
        </div>
        {hasChildren && openMenus[item.label] && (
          <div className="pl-4 mt-1 space-y-1">
            {item.children.map((child, index) => (
              <Link
                key={index}
                to={child.path}
                className={`
                  block px-4 py-2 text-sm rounded-md
                  ${location.pathname === child.path 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:bg-gray-50'
                  }
                `}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      className="fixed inset-y-0 left-0 bg-white border-r border-gray-100 z-[50]"
    >
      <style jsx global>{scrollbarStyles}</style>
      
      <div className="h-full flex flex-col relative">
        <Header isOpen={isOpen} onClose={onClose} />
        <div className="absolute -right-3 top-5 z-50">
          {toggleButton}
        </div>
        <div className="flex-1 py-4 overflow-y-auto sidebar-scroll">
          <nav className="px-2">
            {menuItems.map((item, index) => (
              <SidebarSection key={index} item={item} />
            ))}
          </nav>
        </div>
        <div className="px-2 py-2 border-t border-gray-100">
          {logoutButton}
        </div>
      </div>
    </motion.div>
  );
};

export default VendorSidebar;
