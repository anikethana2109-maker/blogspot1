import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This will also delete all their posts and comments.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      setStats(prev => ({
        ...prev,
        postCount: prev.postCount - 1,
        recentPosts: prev.recentPosts.filter(p => p.id !== postId)
      }));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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

  return (
    <div className="page fade-in">
      <div className="container">
        <h1 style={{ marginBottom: 'var(--space-sm)' }}>⚙ Admin Dashboard</h1>
        <p style={{ marginBottom: 'var(--space-2xl)', color: 'var(--text-tertiary)' }}>
          Manage your blog platform
        </p>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-2xl)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-sm)' }}>
          {['overview', 'users'].map(tab => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? '📊 Overview' : '👥 Users'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <>
            {/* Stats Cards */}
            <div className="admin-stats-grid" id="admin-stats">
              <div className="glass-card admin-stat-card">
                <div className="stat-value">{stats.userCount}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="glass-card admin-stat-card">
                <div className="stat-value">{stats.postCount}</div>
                <div className="stat-label">Total Posts</div>
              </div>
              <div className="glass-card admin-stat-card">
                <div className="stat-value">{stats.commentCount}</div>
                <div className="stat-label">Total Comments</div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="admin-section">
              <h2>📝 Recent Posts</h2>
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table className="admin-table" id="admin-posts-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Comments</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPosts?.map((post) => (
                      <tr key={post.id}>
                        <td>
                          <Link to={`/post/${post.id}`} style={{ fontWeight: 500 }}>
                            {post.title}
                          </Link>
                        </td>
                        <td>{post.author?.name}</td>
                        <td>{post._count?.comments || 0}</td>
                        <td>{formatDate(post.createdAt)}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Users */}
            <div className="admin-section">
              <h2>👤 Recent Users</h2>
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers?.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge badge-${u.role}`}>{u.role}</span>
                        </td>
                        <td>{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>👥 All Users ({users.length})</h2>
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              <table className="admin-table" id="admin-users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Posts</th>
                    <th>Comments</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>
                        <Link to={`/profile/${u.id}`} style={{ fontWeight: 500 }}>
                          {u.name}
                        </Link>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td>{u._count?.posts || 0}</td>
                      <td>{u._count?.comments || 0}</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
