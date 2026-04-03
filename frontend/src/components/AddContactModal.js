import React, { useState } from 'react';

const EMPTY = {
  first_name: '', last_name: '', email: '', phone: '',
  company: '', position: '', city: '', country: 'France',
  whatsapp_number: '', whatsapp_status: 'unknown',
  telegram_handle: '', telegram_status: 'unknown',
  source: 'manual', tags: '', notes: ''
};

export default function AddContactModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.first_name || !form.last_name) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">// NEW CONTACT</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" value={form.first_name} onChange={e => handleChange('first_name', e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" value={form.last_name} onChange={e => handleChange('last_name', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+33..." />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" value={form.company} onChange={e => handleChange('company', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <input className="form-input" value={form.position} onChange={e => handleChange('position', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={form.city} onChange={e => handleChange('city', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input className="form-input" value={form.country} onChange={e => handleChange('country', e.target.value)} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '16px 0', paddingTop: 16 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
              Messaging Platforms
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input className="form-input" value={form.whatsapp_number} onChange={e => handleChange('whatsapp_number', e.target.value)} placeholder="+33..." />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Status</label>
              <select className="form-select" value={form.whatsapp_status} onChange={e => handleChange('whatsapp_status', e.target.value)}>
                <option value="active">Active</option>
                <option value="unknown">Unknown</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telegram Handle</label>
              <input className="form-input" value={form.telegram_handle} onChange={e => handleChange('telegram_handle', e.target.value)} placeholder="username (no @)" />
            </div>
            <div className="form-group">
              <label className="form-label">Telegram Status</label>
              <select className="form-select" value={form.telegram_status} onChange={e => handleChange('telegram_status', e.target.value)}>
                <option value="active">Active</option>
                <option value="unknown">Unknown</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <input className="form-input" value={form.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="e.g. vip, prospect, paris" />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!form.first_name || !form.last_name}
          >
            Create Contact
          </button>
        </div>
      </div>
    </div>
  );
}
