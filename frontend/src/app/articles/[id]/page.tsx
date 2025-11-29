import ArticleClient from './ArticleClient';

// Required for static export - must be exported before default export
export async function generateStaticParams() {
  return [];
}

export default function ArticlePage() {
  return <ArticleClient />;
}
