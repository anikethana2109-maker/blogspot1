import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import ImageUpload from '../components/ImageUpload';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/posts', {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        coverImage
      });
      navigate(`/post/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="container-narrow">
        <div className="glass-card editor-card">
          <h1>✍ Create New Post</h1>

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
              id="post-title-input"
            />

            <div className="form-group">
              <label className="form-label">Cover Image (optional)</label>
              <ImageUpload onUpload={setCoverImage} currentImage={coverImage} />
            </div>

            <div className="form-group">
              <label className="form-label">Excerpt (optional — auto-generated if empty)</label>
              <textarea
                className="form-textarea"
                placeholder="A brief summary of your post..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                id="post-excerpt-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content (Markdown supported)</label>
              <textarea
                className="form-textarea editor-content-area"
                placeholder="Write your post content here... You can use **bold**, *italic*, ## headings, - lists, and ```code blocks```"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                id="post-content-input"
              />
            </div>

            <div className="editor-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting || !title.trim() || !content.trim()}
                id="publish-btn"
              >
                {submitting ? 'Publishing...' : '🚀 Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
