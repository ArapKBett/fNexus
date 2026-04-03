import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Dashboard({ addToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getOverview()
      .then(setData)
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <span>INITIALIZING NEXUS DASHBOARD...</span>
      </div>
    );
  }

  if (!data) return null;
  const { stats } = data;

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue" onClick={() => navigate('/contacts')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Total Contacts</div>
          <div className="stat-value">{stats.totalContacts.toLocaleString()}</div>
          <div className="stat-sub">in database</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">WhatsApp</div>
          <div className="stat-value">{stats.whatsappActive.toLocaleString()}</div>
          <div className="stat-sub">contacts with WhatsApp</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-label">Telegram</div>
          <div className="stat-value">{stats.telegramActive.toLocaleString()}</div>
          <div className="stat-sub">contacts with Telegram</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Both Platforms</div>
          <div className="stat-value">{stats.bothPlatforms.toLocaleString()}</div>
          <div className="stat-sub">reachable on both</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Searches</div>
          <div className="stat-value">{stats.totalSearches.toLocaleString()}</div>
          <div className="stat-sub">queries executed</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">No Platform</div>
          <div className="stat-value">{Math.max(0, stats.noPlatform).toLocaleString()}</div>
          <div className="stat-sub">missing messaging data</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Searches */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Searches</span>
            <button className="btn btn-sm" onClick={() => navigate('/search')}>
              View All →
            </button>
          </div>
          <div className="card-body">
            {data.recentSearches.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⌕</div>
                <div className="empty-state-text">No searches yet</div>
                <div className="empty-state-hint">Use the search panel to query contacts</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.recentSearches.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)', fontSize: 12
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {s.query || '(all contacts)'}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {s.results_count} results
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Imports</span>
            <button className="btn btn-sm" onClick={() => navigate('/upload')}>
              Import →
            </button>
          </div>
          <div className="card-body">
            {data.recentUploads.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⇪</div>
                <div className="empty-state-text">No data imported</div>
                <div className="empty-state-hint">Upload CSV or JSON files to populate the database</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.recentUploads.map((u, i) => (
                  <div key={i} style={{
                    padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {u.filename}
                      </span>
                      <span className={`badge ${u.status === 'completed' ? 'active' : 'unknown'}`}>
                        {u.status}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {u.records_imported} imported / {u.records_skipped} skipped
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <span className="card-title">Quick Actions</span>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/search')}>
            ⌕ Search Contacts
          </button>
          <button className="btn" onClick={() => navigate('/upload')}>
            ⇪ Import Data
          </button>
          <button className="btn" onClick={() => navigate('/analytics')}>
            ⊿ View Analytics
          </button>
          <button className="btn" onClick={() => navigate('/contacts')}>
            ⊞ Browse All
          </button>
        </div>
      </div>
    </div>
  );
}
