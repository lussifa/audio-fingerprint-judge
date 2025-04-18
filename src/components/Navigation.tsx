
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Upload, Server } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <nav className="flex space-x-2">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-md transition-colors ${
            isActive 
              ? 'bg-primary/10 text-primary' 
              : 'hover:bg-secondary/80'
          }`
        }
      >
        <Upload className="h-4 w-4 mr-2" />
        Analyze
      </NavLink>
      <NavLink
        to="/api-train"
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-md transition-colors ${
            isActive 
              ? 'bg-primary/10 text-primary' 
              : 'hover:bg-secondary/80'
          }`
        }
      >
        <Server className="h-4 w-4 mr-2" />
        Train
      </NavLink>
    </nav>
  );
};

export default Navigation;
