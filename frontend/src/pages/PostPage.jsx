import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import CommentSection from '../components/CommentSection';

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      console.error('Failed to fetch post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const readingTime = (content) => {
    const words = content?.split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Simple markdown-to-HTML renderer
  const renderContent = (content) => {
    if (!content) return '';

    let html = content
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Paragraphs (double newlines)
      .replace(/\n\n/g, '</p><p>')
      // Single newlines within paragraphs
      .replace(/\n/g, '<br />');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');

    return `<p>${html}</p>`;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page container">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Post Not Found</h3>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === post.author?.id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="page fade-in">
      <div className="container-narrow">
        {/* Post Header */}
        <div className="post-header">
          <h1>{post.title}</h1>
          <div className="post-author-bar">
            <Link to={`/profile/${post.author?.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', textDecoration: 'none', color: 'inherit' }}>
              <div className="post-author-avatar-lg">
                {getInitial(post.author?.name)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>
                  {post.author?.name}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {formatDate(post.createdAt)} · {readingTime(post.content)} min read
                </div>
              </div>
            </Link>
          </div>

          {/* Author / Admin actions */}
          {(isAuthor || isAdmin) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
              {isAuthor && (
                <Link to={`/edit/${post.id}`} className="btn btn-secondary btn-sm">
                  ✏ Edit
                </Link>
              )}
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                🗑 Delete
              </button>
            </div>
          )}
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <img
            src={post.coverImage.startsWith('/') ? `http://localhost:3001${post.coverImage}` : post.coverImage}
            alt={post.title}
            className="post-cover-lg"
          />
        )}

        {/* Post Content */}
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />

        {/* Comments */}
        <CommentSection postId={post.id} initialComments={post.comments || []} />
      </div>
    </div>
  );
}
