import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function CommentSection({ postId, initialComments = [] }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: newComment.trim() });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const res = await api.put(`/comments/${commentId}`, { content: editContent.trim() });
      setComments(comments.map(c => c.id === commentId ? res.data : c));
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  return (
    <div className="comments-section" id="comments-section">
      <h2>💬 Comments ({comments.length})</h2>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            className="form-textarea"
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            id="comment-input"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newComment.trim() || submitting}
              id="submit-comment-btn"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <p style={{ marginBottom: 'var(--space-md)' }}>
            <Link to="/login">Login</Link> to join the conversation
          </p>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💭</div>
          <h3>No comments yet</h3>
          <p>Be the first to share your thoughts!</p>
        </div>
      ) : (
        comments.map((comment) => (
          <div className="comment" key={comment.id} id={`comment-${comment.id}`}>
            <div className="comment-avatar">
              {getInitial(comment.author?.name)}
            </div>
            <div className="comment-body">
              <div className="comment-header">
                <Link to={`/profile/${comment.author?.id}`} className="comment-author">
                  {comment.author?.name}
                </Link>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>

              {editingId === comment.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <textarea
                    className="form-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(comment.id)}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="comment-content">{comment.content}</p>
              )}

              {user && editingId !== comment.id && (
                <div className="comment-actions">
                  {user.id === comment.author?.id && (
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(comment)}>Edit</button>
                  )}
                  {(user.id === comment.author?.id || user.role === 'admin') && (
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(comment.id)}>Delete</button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
