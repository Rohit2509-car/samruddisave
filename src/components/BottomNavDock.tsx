import React from 'react';

interface BottomNavDockProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = () => {
  // Mobile bottom floating navigation dock removed as requested
  return null;
};
