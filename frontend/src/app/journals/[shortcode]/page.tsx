// Server component wrapper that exports generateStaticParams
import JournalClient from './JournalClient';

// Force static generation
export const dynamic = 'force-static';
export const dynamicParams = true;

// Required for static export
export async function generateStaticParams(): Promise<Array<{ shortcode: string }>> {
  // Return empty array - routes will be handled client-side
  return [];
}

export default function JournalPage() {
  return <JournalClient />;
}
