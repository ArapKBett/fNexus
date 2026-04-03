import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import ContactModal from './ContactModal';
import AddContactModal from './AddContactModal';

export default function ContactsTable({ addToast }) {
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [sort, setSort] = useState('updated_at');
  const [order, setOrder] = useState('DESC');

  const loadContacts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.searchContacts({ page, limit: 25, sort, order });
      setContacts(data.contacts);
      setPagination(data.pagination);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [sort, order, addToast]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  const handleSort = (col) => {
    if (sort === col) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSort(col);
      setOrder('ASC');
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === contacts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contacts.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} contacts?`)) return;
    try {
      await api.bulkDelete([...selected]);
      addToast(`${selected.size} contacts deleted`, 'success');
      setSelected(new Set());
      loadContacts(pagination.page);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await api.deleteContact(id);
      addToast('Contact deleted', 'success');
      setSelectedContact(null);
      loadContacts(pagination.page);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const SortIcon = ({ col }) => {
    if (sort !== col) return <span style={{ opacity: 0.3 }}>↕</span>;
    return <span>{order === 'ASC' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
          {pagination.total} CONTACTS IN DATABASE
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selected.size > 0 && (
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
              Delete {selected.size} Selected
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            + Add Contact
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>LOADING CONTACTS...</span>
        </div>
      ) : contacts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⊞</div>
          <div className="empty-state-text">No contacts in database</div>
          <div className="empty-state-hint">Import data or add contacts manually to get started</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selected.size === contacts.length && contacts.length > 0}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th onClick={() => handleSort('first_name')}>Name <SortIcon col="first_name" /></th>
                <th onClick={() => handleSort('company')}>Company <SortIcon col="company" /></th>
                <th onClick={() => handleSort('city')}>City <SortIcon col="city" /></th>
                <th>WhatsApp</th>
                <th>Telegram</th>
                <th>Email</th>
                <th onClick={() => handleSort('updated_at')}>Updated <SortIcon col="updated_at" /></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedContact(contact)}>
                  <td onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {contact.first_name} {contact.last_name}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{contact.company || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{contact.city || '—'}</td>
                  <td>
                    {contact.whatsapp_number ? (
                      <span className="badge whatsapp"><span className="badge-dot" /> {contact.whatsapp_status}</span>
                    ) : <span className="badge unknown">—</span>}
                  </td>
                  <td>
                    {contact.telegram_handle ? (
                      <span className="badge telegram"><span className="badge-dot" /> {contact.telegram_status}</span>
                    ) : <span className="badge unknown">—</span>}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{contact.email || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    {contact.updated_at ? new Date(contact.updated_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <div className="pagination-info">
              Page {pagination.page} of {pagination.pages || 1} ({pagination.total} total)
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled={pagination.page <= 1} onClick={() => loadContacts(pagination.page - 1)}>
                ← PREV
              </button>
              <button className="pagination-btn" disabled={pagination.page >= pagination.pages} onClick={() => loadContacts(pagination.page + 1)}>
                NEXT →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {selectedContact && (
        <ContactModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onDelete={handleDelete}
          onSave={async (updated) => {
            try {
              await api.updateContact(selectedContact.id, updated);
              addToast('Contact updated', 'success');
              setSelectedContact(null);
              loadContacts(pagination.page);
            } catch (err) {
              addToast(err.message, 'error');
            }
          }}
        />
      )}

      {/* Add Contact Modal */}
      {showAdd && (
        <AddContactModal
          onClose={() => setShowAdd(false)}
          onSave={async (data) => {
            try {
              await api.createContact(data);
              addToast('Contact created', 'success');
              setShowAdd(false);
              loadContacts(1);
            } catch (err) {
              addToast(err.message, 'error');
            }
          }}
        />
      )}
    </div>
  );
}
