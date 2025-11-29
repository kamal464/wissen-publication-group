import JournalClient from './JournalClient';

// Required for static export - must be exported before default export
export async function generateStaticParams() {
  return [];
}

export default function JournalPage() {
  return <JournalClient />;
}
