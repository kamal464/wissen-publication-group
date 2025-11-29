import JournalAdminLayout from '@/components/journal-admin/JournalAdminLayout';

interface JournalAdminLayoutProps {
  children: React.ReactNode;
}

export default function JournalAdminLayoutWrapper({ children }: JournalAdminLayoutProps) {
  return <JournalAdminLayout>{children}</JournalAdminLayout>;
}







