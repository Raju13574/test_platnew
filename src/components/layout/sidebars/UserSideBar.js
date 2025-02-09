import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, FileText, User, ChevronRight,
  BookOpen, Award, Brain, Activity, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ isOpen, onClose }) => (
  <div className="px-4 py-4 flex items-center border-b border-gray-100">
    <Link 
      to="/" 
      className="flex items-center"
      onClick={() => {
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

const UserSidebar = ({ isOpen, onClose, toggleButton, logoutButton }) => {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const menuItems = useMemo(() => [
    {
      label: "Dashboard",
      icon: Home,
      children: [
        { label: "Overview", path: "/dashboard/user" },
        { label: "Reports", path: "/dashboard/user/reports" }
      ]
    },
    {
      label: "Tests",
      icon: FileText,
      path: "/dashboard/user/tests/all"
    },
    
    {
      label: "Profile",
      icon: User,
      path: "/dashboard/user/profile"
    }
  ], []);

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({...prev, [menu]: !prev[menu]}));
  };

  const SidebarSection = ({ item }) => {
    const Icon = item.icon;
    const [isHovered, setIsHovered] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
    const hasChildren = item.children?.length > 0;
    
    const isActive = (item.path && location.pathname === item.path) ||
      item.children?.some(child => location.pathname === child.path);

    if (!isOpen) {
      return (
        <div 
          className="relative py-2"
          onMouseEnter={(e) => {
            if (hasChildren) {
              const rect = e.currentTarget.getBoundingClientRect();
              setDropdownPosition({
                x: rect.right + 4,
                y: rect.top
              });
              setIsHovered(true);
            }
          }}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link
            to={item.path || '#'}
            className={`
              flex items-center justify-center group cursor-pointer relative px-3 py-2
              ${isActive ? 'text-blue-600 bg-blue-50 rounded-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md'}
            `}
            onClick={hasChildren ? (e) => e.preventDefault() : undefined}
          >
            <Icon size={22} className="transition-colors duration-150" />
            {hasChildren && (
              <ChevronRight 
                size={14} 
                className="absolute -right-1 text-gray-400"
              />
            )}
          </Link>
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

    if (!hasChildren) {
      return (
        <Link
          to={item.path}
          className={`
            block py-1 px-4 my-1 rounded-md
            ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}
          `}
        >
          <div className="flex items-center py-2">
            <Icon size={22} className="transition-colors duration-150" />
            <span className="ml-3 text-sm font-medium">{item.label}</span>
          </div>
        </Link>
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
        <div className="mt-auto border-t border-gray-200">
          {logoutButton}
        </div>
      </div>
    </motion.div>
  );
};

export default UserSidebar;
