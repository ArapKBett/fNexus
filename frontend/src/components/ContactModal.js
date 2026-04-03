import React, { useState } from 'react';

export default function ContactModal({ contact, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...contact });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(form);
    setEditing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {editing ? '// EDIT CONTACT' : '// CONTACT DETAILS'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {editing ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={form.first_name || ''} onChange={e => handleChange('first_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={form.last_name || ''} onChange={e => handleChange('last_name', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={form.email || ''} onChange={e => handleChange('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-input" value={form.company || ''} onChange={e => handleChange('company', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input className="form-input" value={form.position || ''} onChange={e => handleChange('position', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.city || ''} onChange={e => handleChange('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" value={form.country || ''} onChange={e => handleChange('country', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input className="form-input" value={form.whatsapp_number || ''} onChange={e => handleChange('whatsapp_number', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp Status</label>
                  <select className="form-select" value={form.whatsapp_status || 'unknown'} onChange={e => handleChange('whatsapp_status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="unknown">Unknown</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Telegram Handle</label>
                  <input className="form-input" value={form.telegram_handle || ''} onChange={e => handleChange('telegram_handle', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telegram Status</label>
                  <select className="form-select" value={form.telegram_status || 'unknown'} onChange={e => handleChange('telegram_status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="unknown">Unknown</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <input className="form-input" value={form.tags || ''} onChange={e => handleChange('tags', e.target.value)} placeholder="e.g. vip, prospect, paris" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes || ''} onChange={e => handleChange('notes', e.target.value)} />
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {/* Name & basic info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-blue-dim)', border: '1px solid var(--border-default)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent-blue)'
                }}>
                  {(contact.first_name?.[0] || '')}{(contact.last_name?.[0] || '')}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {contact.first_name} {contact.last_name}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {contact.position ? `${contact.position} at ` : ''}{contact.company || 'No company'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {contact.city}{contact.city && contact.country ? ', ' : ''}{contact.country}
                  </div>
                </div>
              </div>

              {/* Platform cards */}
              <div className="grid-2">
                <div style={{
                  background: contact.whatsapp_number ? 'var(--whatsapp-dim)' : 'var(--bg-tertiary)',
                  border: `1px solid ${contact.whatsapp_number ? 'rgba(37,211,102,0.2)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)', padding: 16
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                    WhatsApp
                  </div>
                  {contact.whatsapp_number ? (
                    <>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--whatsapp)', fontWeight: 600 }}>
                        {contact.whatsapp_number}
                      </div>
                      <span className={`badge ${contact.whatsapp_status}`} style={{ marginTop: 8 }}>
                        <span className="badge-dot" /> {contact.whatsapp_status}
                      </span>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data available</div>
                  )}
                </div>

                <div style={{
                  background: contact.telegram_handle ? 'var(--telegram-dim)' : 'var(--bg-tertiary)',
                  border: `1px solid ${contact.telegram_handle ? 'rgba(0,136,204,0.2)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)', padding: 16
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                    Telegram
                  </div>
                  {contact.telegram_handle ? (
                    <>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--telegram)', fontWeight: 600 }}>
                        @{contact.telegram_handle}
                      </div>
                      <span className={`badge ${contact.telegram_status}`} style={{ marginTop: 8 }}>
                        <span className="badge-dot" /> {contact.telegram_status}
                      </span>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data available</div>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Email', contact.email],
                  ['Phone', contact.phone],
                  ['Source', contact.source],
                  ['Tags', contact.tags],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 13, color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {contact.notes && (
                <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Notes
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {contact.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {editing ? (
            <>
              <button className="btn" onClick={() => { setForm({ ...contact }); setEditing(false); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </>
          ) : (
            <>
              {onDelete && (
                <button className="btn btn-danger" onClick={() => onDelete(contact.id)}>Delete</button>
              )}
              <button className="btn" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn" onClick={onClose}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
