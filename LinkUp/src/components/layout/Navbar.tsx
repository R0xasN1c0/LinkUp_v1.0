
/**
 * Navigation Bar Component for LinkUp
 * 
 * Provides the main navigation interface for the application,
 * including links to major sections and user authentication controls.
 */
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Navbar Component
 * 
 * Displays:
 * - App logo and title
 * - Navigation links to main sections
 * - User authentication controls
 * 
 * Features responsive design with collapsible text labels on smaller screens
 */
const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  /**
   * Determines if a navigation link is currently active
   * @param {string} path - Route path to check
   * @returns {boolean} True if the path matches current location
   */
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  /**
   * Handles user sign out and redirects to auth page
   */
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <ScrollArea className="w-full">
        <div className="flex justify-between items-center py-4 px-6 container mx-auto">
          {/* Logo and app name */}
          <div className="flex items-center gap-2 min-w-fit">
            <img 
              src="/linkup-uploads/bdc5c01d-17e7-4823-8603-082672d9edb8.png" 
              alt="Link-Up Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold">LinkUp</span>
          </div>
          
          {/* Navigation links */}
          <div className="flex space-x-1 overflow-x-auto no-scrollbar min-w-fit px-4">
            {/* Dashboard link */}
            <Button 
              variant={isActive('/') ? "default" : "ghost"} 
              size="sm" 
              asChild
            >
              <Link to="/" className="flex items-center gap-2 whitespace-nowrap">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            
            {/* Personal calendar link */}
            <Button 
              variant={isActive('/calendar') ? "default" : "ghost"} 
              size="sm" 
              asChild
            >
              <Link to="/calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">My Calendar</span>
              </Link>
            </Button>
            
            {/* Groups link */}
            <Button 
              variant={isActive('/groups') ? "default" : "ghost"} 
              size="sm" 
              asChild
            >
              <Link to="/groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Groups</span>
              </Link>
            </Button>

            {/* Friends link */}
            <Button 
              variant={isActive('/friends') ? "default" : "ghost"} 
              size="sm" 
              asChild
            >
              <Link to="/friends" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Friends</span>
              </Link>
            </Button>

            {/* Profile link */}
            <Button 
              variant={isActive('/profile') ? "default" : "ghost"} 
              size="sm" 
              asChild
            >
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </Button>
          </div>
          
          {/* User authentication controls */}
          <div className="flex items-center gap-2 min-w-fit">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="mr-2 hidden md:inline">{user.email}</span>
                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => navigate('/auth')}>
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Navbar;
