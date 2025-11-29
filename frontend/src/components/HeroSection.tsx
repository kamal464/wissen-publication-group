import Link from 'next/link';

const subjects = [
  'Economics & Finance',
  'Engineering',
  'Information Science',
  'Life Science',
  'Medicine',
  'Social Science & Education'
];

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__decorations">
        <span className="hero__decoration hero__decoration--square-1" />
        <span className="hero__decoration hero__decoration--square-2" />
        <span className="hero__decoration hero__decoration--square-3" />
      </div>

      <span className="hero__light hero__light--top-right" />
      <span className="hero__light hero__light--bottom-left" />

      <div className="hero__particles">
        <span className="hero__particle hero__particle--1" />
        <span className="hero__particle hero__particle--2" />
        <span className="hero__particle hero__particle--3" />
        <span className="hero__particle hero__particle--4" />
        <span className="hero__particle hero__particle--5" />
      </div>

      <div className="hero__container">
        <div className="hero__grid">
          <div className="hero__content">
            <span className="hero__eyebrow">JOURNALS</span>
            <h1 className="hero__title">Discover Journals by Renowned Databases</h1>
            <p className="hero__subtitle">
              Explore an expansive catalogue of academic journals and research papers curated for scholars, professionals, and curious readers around the globe.
            </p>
            <div className="hero__actions">
              <Link href="/journals" className="btn btn--primary">
                Explore Journals
              </Link>
            </div>
          </div>

          <aside className="hero__panel" aria-label="Journal search and subjects">
            <form className="hero__search" role="search">
              <span className="hero__search-label">SEARCH OUR COLLECTION</span>
              <div className="hero__search-bar">
                <input
                  type="search"
                  className="hero__search-input"
                  placeholder="What are you looking for?"
                  aria-label="Search journals or articles"
                />
                <button type="submit" className="hero__search-button">
                  Search
                </button>
              </div>
            </form>

            <div className="hero__subjects">
              {subjects.map((subject) => (
                <Link key={subject} href={`/subjects/${subject.toLowerCase().replace(/[^a-z]+/g, '-')}`} className="hero__subject">
                  {subject}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
