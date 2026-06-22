import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import ImageUpload from '../components/ImageUpload';

export default function EditPostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`);
      const post = res.data;

      // Only author can edit
      if (post.authorId !== user?.id && user?.role !== 'admin') {
        navigate('/');
        return;
      }

      setTitle(post.title);
      setContent(post.content);
      setExcerpt(post.excerpt || '');
      setCoverImage(post.coverImage);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.put(`/posts/${id}`, {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        coverImage
      });
      navigate(`/post/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="container-narrow">
        <div className="glass-card editor-card">
          <h1>✏ Edit Post</h1>

          {error && (
            <div className="toast-error" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }}>
              {error}
            </div>
          )}

          <form className="editor-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="editor-title-input"
              placeholder="Your post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="edit-title-input"
            />

            <div className="form-group">
              <label className="form-label">Cover Image</label>
              <ImageUpload onUpload={setCoverImage} currentImage={coverImage} />
            </div>

            <div className="form-group">
              <label className="form-label">Excerpt</label>
              <textarea
                className="form-textarea"
                placeholder="A brief summary..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content (Markdown supported)</label>
              <textarea
                className="form-textarea editor-content-area"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                id="edit-content-input"
              />
            </div>

            <div className="editor-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/post/${id}`)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting || !title.trim() || !content.trim()}
                id="update-btn"
              >
                {submitting ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
