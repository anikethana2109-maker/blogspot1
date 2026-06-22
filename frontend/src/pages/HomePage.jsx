import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/api';
import PostCard from '../components/PostCard';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchPosts(page);
    }
  }, [page]);

  const fetchPosts = async (pageNum) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts?page=${pageNum}&limit=6`);
      setPosts(res.data.posts);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      fetchPosts(1);
      setSearchParams({});
      return;
    }

    setSearching(true);
    setLoading(true);
    try {
      const res = await api.get(`/posts/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setPosts(res.data);
      setPagination(null);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    fetchPosts(1);
    setSearchParams({});
  };

  const goToPage = (p) => {
    setSearchParams({ page: p.toString() });
  };

  return (
    <div className="page fade-in">
      {/* Hero */}
      <section className="hero container">
        <h1>
          Discover <span className="gradient-text">Ideas</span> That
          <br />
          Shape Tomorrow
        </h1>
        <p>
          A curated space for developers, thinkers, and creators to share insights, stories, and knowledge.
        </p>
      </section>

      {/* Search */}
      <div className="container">
        <form className="search-container" onSubmit={handleSearch} id="search-form">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleSearchClear}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Posts Grid */}
      <div className="container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No posts found</h3>
            <p>{searchQuery ? 'Try a different search term' : 'Check back soon for new content!'}</p>
          </div>
        ) : (
          <>
            {searchQuery && !pagination && (
              <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                Found {posts.length} result{posts.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}

            <div className="posts-grid" id="posts-grid">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="pagination" id="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                >
                  ← Prev
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-btn ${p === page ? 'active' : ''}`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pagination.pages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
