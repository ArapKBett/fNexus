import React, { useState, useCallback } from 'react';
import { api } from '../services/api';
import ContactModal from './ContactModal';

export default function SearchPanel({ addToast }) {
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const [city, setCity] = useState('');
  const [company, setCompany] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);

  const search = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 20 };
      if (query) params.q = query;
      if (platform) params.platform = platform;
      if (status) params.status = status;
      if (city) params.city = city;
      if (company) params.company = company;

      const data = await api.searchContacts(params);
      setResults(data);
      setPage(pageNum);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [query, platform, status, city, company, addToast]);

  const handleSubmit = (e) => {
    e.preventDefault();
    search(1);
  };

  return (
    <div>
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="search-container">
        <div className="search-bar">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search by name, email, phone, company, notes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary" style={{ margin: 4 }}>
            SCAN
          </button>
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div
            className={`filter-chip ${platform === '' ? 'active' : ''}`}
            onClick={() => setPlatform('')}
          >All Platforms</div>
          <div
            className={`filter-chip whatsapp ${platform === 'whatsapp' ? 'active' : ''}`}
            onClick={() => setPlatform(platform === 'whatsapp' ? '' : 'whatsapp')}
          >◉ WhatsApp</div>
          <div
            className={`filter-chip telegram ${platform === 'telegram' ? 'active' : ''}`}
            onClick={() => setPlatform(platform === 'telegram' ? '' : 'telegram')}
          >◈ Telegram</div>
          <div
            className={`filter-chip ${platform === 'both' ? 'active' : ''}`}
            onClick={() => setPlatform(platform === 'both' ? '' : 'both')}
          >◉◈ Both</div>

          <select
            className="form-select"
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{ width: 'auto', padding: '6px 14px', fontSize: 12, fontFamily: 'var(--font-mono)' }}
          >
            <option value="">Any Status</option>
            <option value="active">Active</option>
            <option value="unknown">Unknown</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Advanced filters */}
        <div className="filter-row" style={{ marginTop: 8 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Filter by city..."
            value={city}
            onChange={e => setCity(e.target.value)}
            style={{ width: 200, padding: '6px 14px', fontSize: 12 }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by company..."
            value={company}
            onChange={e => setCompany(e.target.value)}
            style={{ width: 200, padding: '6px 14px', fontSize: 12 }}
          />
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>SCANNING DATABASE...</span>
        </div>
      ) : results ? (
        <div>
          <div style={{ marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
            {results.pagination.total} CONTACTS FOUND — PAGE {results.pagination.page}/{results.pagination.pages || 1}
          </div>

          {results.contacts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⌕</div>
              <div className="empty-state-text">No contacts match your query</div>
              <div className="empty-state-hint">Try adjusting your search terms or filters</div>
            </div>
          ) : (
            <div className="data-table-container scan-line-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>City</th>
                    <th>WhatsApp</th>
                    <th>Telegram</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.contacts.map(contact => (
                    <tr key={contact.id}>
                      <td style={{ fontWeight: 500 }}>
                        {contact.first_name} {contact.last_name}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{contact.company || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{contact.city || '—'}</td>
                      <td>
                        {contact.whatsapp_number ? (
                          <span className="badge whatsapp">
                            <span className="badge-dot" /> {contact.whatsapp_number}
                          </span>
                        ) : (
                          <span className="badge unknown">—</span>
                        )}
                      </td>
                      <td>
                        {contact.telegram_handle ? (
                          <span className="badge telegram">
                            <span className="badge-dot" /> @{contact.telegram_handle}
                          </span>
                        ) : (
                          <span className="badge unknown">—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{contact.email || '—'}</td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() => setSelectedContact(contact)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="pagination">
                <div className="pagination-info">
                  Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, results.pagination.total)} of {results.pagination.total}
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    disabled={page <= 1}
                    onClick={() => search(page - 1)}
                  >← PREV</button>
                  <button
                    className="pagination-btn"
                    disabled={page >= results.pagination.pages}
                    onClick={() => search(page + 1)}
                  >NEXT →</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">⌕</div>
          <div className="empty-state-text">Enter a search query to begin scanning</div>
          <div className="empty-state-hint">
            Search by name, phone, email, company, or any keyword.
            Use filters to narrow results by platform and status.
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onSave={async (updated) => {
            try {
              await api.updateContact(selectedContact.id, updated);
              addToast('Contact updated', 'success');
              setSelectedContact(null);
              search(page);
            } catch (err) {
              addToast(err.message, 'error');
            }
          }}
        />
      )}
    </div>
  );
}
