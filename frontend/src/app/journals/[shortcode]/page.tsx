// Server component wrapper that exports generateStaticParams
import JournalClient from './JournalClient';

// Required for static export
export async function generateStaticParams(): Promise<Array<{ shortcode: string }>> {
  // Return empty array - routes will be handled client-side
  return [];
}

export default function JournalPage() {
  return <JournalClient />;
}
