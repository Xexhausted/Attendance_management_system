import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Calendar, 
  Settings, 
  LogOut, 
  User, 
  Sun, 
  Moon,
  Home,
  BarChart3
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Attendance</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/">
              <Button 
                variant={isActive('/') ? "default" : "ghost"}
                className={`flex items-center space-x-2 ${
                  isActive('/') 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link to="/calendar">
              <Button 
                variant={isActive('/calendar') ? "default" : "ghost"}
                className={`flex items-center space-x-2 ${
                  isActive('/calendar') 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
                </Button>
            </Link>
            
            <Link to="/analytics">
              <Button 
                variant={isActive('/analytics') ? "default" : "ghost"}
                className={`flex items-center space-x-2 ${
                  isActive('/analytics') 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
                </Button>
            </Link>
            
            {user?.role === 'admin' && (
              <Link to="/analytics">
                <Button 
                  variant={isActive('/analytics') ? "default" : "ghost"}
                  className={`flex items-center space-x-2 ${
                    isActive('/analytics') 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Button>
              </Link>
            )}
          </div>

          {/* User Menu and Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button 
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 text-foreground hover:bg-accent"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-accent">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.profile_picture} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-foreground hover:bg-accent">
                  <Link to="/settings" className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="flex items-center space-x-2 text-foreground hover:bg-accent">
              <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};