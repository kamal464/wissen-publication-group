'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  
  // Don't wrap login page with AdminLayout - it has its own full-page layout
  // Handle both with and without trailing slash
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/';
  
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  // For all other admin routes, use AdminLayout
  return <AdminLayout>{children}</AdminLayout>;
}
