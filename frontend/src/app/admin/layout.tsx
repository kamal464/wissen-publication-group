'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  
  // Don't wrap login page with AdminLayout - it has its own full-page layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  // For all other admin routes, use AdminLayout
  return <AdminLayout>{children}</AdminLayout>;
}
