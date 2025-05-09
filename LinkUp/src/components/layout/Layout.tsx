
/**
 * Main Layout Component for LinkUp
 * 
 * Provides the common layout structure for all pages in the application,
 * including the navigation bar and scrollable main content area.
 */
import React from 'react';
import Navbar from './Navbar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LayoutProps {
  children: React.ReactNode;  // Content to be rendered within the layout
}

/**
 * Layout Component
 * 
 * Creates a consistent page structure with:
 * - Fixed navbar at the top
 * - Scrollable content area
 * - Consistent padding and container width
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render in the layout
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col">
      {/* Navigation bar fixed at the top */}
      <Navbar />
      
      {/* Scrollable main content area */}
      <ScrollArea className="flex-1">
        <main className="container mx-auto py-6 px-4">
          {children}
        </main>
      </ScrollArea>
    </div>
  );
};

export default Layout;
