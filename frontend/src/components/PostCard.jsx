import { Link } from 'react-router-dom';
import { getImageUrl } from '../api/api';

export default function PostCard({ post }) {
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const readingTime = (content) => {
    const words = content?.split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <Link to={`/post/${post.id}`} className="glass-card post-card" id={`post-card-${post.id}`}>
      {post.coverImage && (
        <img
          src={getImageUrl(post.coverImage)}
          alt={post.title}
          className="post-card-cover"
        />
      )}

      <div className="post-card-meta">
        <div className="post-card-author-avatar">
          {getInitial(post.author?.name)}
        </div>
        <span>{post.author?.name}</span>
        <span>·</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>

      <h3>{post.title}</h3>

      <p className="post-card-excerpt">
        {post.excerpt || post.content?.substring(0, 150)}
      </p>

      <div className="post-card-footer">
        <span>💬 {post._count?.comments || 0} comments</span>
        <span>{readingTime(post.content)} min read</span>
      </div>
    </Link>
  );
}
