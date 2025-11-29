// Server component wrapper that exports generateStaticParams
import ArticleClient from './ArticleClient';

// Force static generation
export const dynamic = 'force-static';
export const dynamicParams = true;

// Required for static export
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  // Return empty array - routes will be handled client-side
  return [];
}

export default function ArticlePage() {
  return <ArticleClient />;
}
