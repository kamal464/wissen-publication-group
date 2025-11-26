import AdminLayout from '@/components/admin/AdminLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
