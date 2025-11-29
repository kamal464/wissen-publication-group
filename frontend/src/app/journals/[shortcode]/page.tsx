// Required for static export - export must be at top level
export async function generateStaticParams() {
  return [];
}

import JournalClient from './JournalClient';

export default function JournalPage() {
  return <JournalClient />;
}
