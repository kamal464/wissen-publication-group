// Required for static export - export must be at top level
export async function generateStaticParams() {
  return [];
}

import ArticleClient from './ArticleClient';

export default function ArticlePage() {
  return <ArticleClient />;
}
