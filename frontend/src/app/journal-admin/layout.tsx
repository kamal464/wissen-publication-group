'use client';

import { usePathname } from 'next/navigation';
import JournalAdminLayout from '@/components/journal-admin/JournalAdminLayout';

interface JournalAdminLayoutProps {
  children: React.ReactNode;
}

export default function JournalAdminLayoutWrapper({ children }: JournalAdminLayoutProps) {
  const pathname = usePathname();
  
  // Don't wrap login page with JournalAdminLayout - it has its own full-page layout
  // Handle both with and without trailing slash
  const isLoginPage = pathname === '/journal-admin/login' || pathname === '/journal-admin/login/';
  
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  // For all other journal-admin routes, use JournalAdminLayout
  return <JournalAdminLayout>{children}</JournalAdminLayout>;
}







