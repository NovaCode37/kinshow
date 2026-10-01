import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO, StructuredData, breadcrumbSchema, websiteSchema } from '../components/SEO';
import { getBlogPosts } from '../blogData';

const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric'
});

export default function Blog() {
  const posts = getBlogPosts();
  const categories = ['All', ...new Set(posts.map(p => p.category))];
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? posts : posts.filter(p => p.category === active);
  const [featured, ...rest] = filtered;

  return (
    <main id="content" tabIndex={-1} className="page">
      <SEO
        title="Blog — Movie & TV Guides, Lists & Reviews"
        description="Read the latest articles about movies, TV shows, and streaming on Kinshow. Guides, recommendations, lists, and tips for finding what to watch."
        url="https://kinshow.vercel.app/blog"
      />
      <StructuredData data={websiteSchema()} />
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Kinshow Blog',
        url: 'https://kinshow.vercel.app/blog',
        description: 'Guides, recommendations, lists, and tips for finding what to watch.',
        inLanguage: 'en-us',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: posts.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.title,
            url: `https://kinshow.vercel.app/blog/${p.slug}`
          }))
        }
      }} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://kinshow.vercel.app/' },
        { name: 'Blog', url: 'https://kinshow.vercel.app/blog' }
      ])} />
      <div className="page-header">
        <h1 className="page-title">Blog</h1>
        <p className="page-subtitle">Articles about movies, TV shows, and cinema discovery</p>
      </div>
      <div className="blog-filters" role="group" aria-label="Filter articles by category">
        {categories.map(c => (
          <button
            key={c}
            type="button"
            className={`blog-chip${active === c ? ' blog-chip--active' : ''}`}
            aria-pressed={active === c}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {featured && (
        <Link to={`/blog/${featured.slug}`} className="blog-featured">
          <div className="blog-featured-img">
            <img src={featured.image} alt="" />
            <span className="blog-card-category">{featured.category}</span>
          </div>
          <div className="blog-featured-body">
            <div className="blog-card-meta">
              <span>{fmtDate(featured.date)}</span>
              <span>·</span>
              <span>{featured.readTime} read</span>
            </div>
            <h2 className="blog-featured-title">{featured.title}</h2>
            <p className="blog-featured-excerpt">{featured.excerpt}</p>
            <span className="blog-card-link">Read article →</span>
          </div>
        </Link>
      )}
      {rest.length > 0 && (
        <div className="blog-grid">
          {rest.map(post => (
            <Link to={`/blog/${post.slug}`} key={post.slug} className="blog-card">
              <div className="blog-card-img">
                <img src={post.image} alt={post.title} loading="lazy" />
                <span className="blog-card-category">{post.category}</span>
              </div>
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span>{fmtDate(post.date)}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <span className="blog-card-link">Read More →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
