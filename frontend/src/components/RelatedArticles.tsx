import Link from 'next/link';
import { Article } from '@/types';

type RelatedArticlesProps = {
  articles: Article[];
};

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <aside className="related-articles">
      <h3 className="related-articles__title">Related Articles</h3>
      <div className="related-articles__list">
        {articles.map((article) => (
          <article key={article.id} className="related-article">
            <Link href={`/articles/${article.id}`} className="related-article__link">
              <h4 className="related-article__title">{article.title}</h4>
              <p className="related-article__authors">
                {article.authors.map((author) => author.name).join(', ')}
              </p>
              {article.publishedAt && (
                <time className="related-article__date" dateTime={article.publishedAt} suppressHydrationWarning>
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              )}
            </Link>
          </article>
        ))}
      </div>
    </aside>
  );
}
