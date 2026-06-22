import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import PostCard from '../components/PostCard';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?.id === parseInt(id);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setProfile(res.data);
      setEditName(res.data.name);
      setEditBio(res.data.bio || '');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/users/${id}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/users/${id}`, {
        name: editName.trim(),
        bio: editBio.trim()
      });
      setProfile({ ...profile, ...res.data });
      updateUser(res.data);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page container">
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <h3>User Not Found</h3>
          <p>This profile doesn't exist.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="container">
        {/* Profile Header */}
        <div className="glass-card profile-header" id="profile-header">
          <div className="profile-avatar-lg">
            {getInitial(profile.name)}
          </div>

          <div className="profile-info" style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                />
                <textarea
                  className="form-textarea"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write a short bio..."
                  rows={2}
                />
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <h1>{profile.name}</h1>
                  {profile.role === 'admin' && <span className="badge badge-admin">Admin</span>}
                </div>
                <p style={{ marginTop: 'var(--space-xs)' }}>
                  {profile.bio || 'No bio yet.'}
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                  Member since {formatDate(profile.createdAt)}
                </p>

                <div className="profile-stats">
                  <div className="profile-stat">
                    <div className="profile-stat-value">{profile._count?.posts || 0}</div>
                    <div className="profile-stat-label">Posts</div>
                  </div>
                  <div className="profile-stat">
                    <div className="profile-stat-value">{profile._count?.comments || 0}</div>
                    <div className="profile-stat-label">Comments</div>
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditing(true)}
                    style={{ marginTop: 'var(--space-md)' }}
                    id="edit-profile-btn"
                  >
                    ✏ Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* User Posts */}
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>
          {isOwnProfile ? 'Your Posts' : `Posts by ${profile.name}`}
        </h2>

        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No posts yet</h3>
            <p>{isOwnProfile ? 'Start writing your first post!' : 'This user hasn\'t published anything yet.'}</p>
            {isOwnProfile && (
              <Link to="/create" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                ✍ Write Your First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="posts-grid" id="user-posts-grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
