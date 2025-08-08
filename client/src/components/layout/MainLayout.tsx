import React from 'react';
import AppLayout from './AppLayout';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return <AppLayout>{children}</AppLayout>;
};

export default MainLayout;
