import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export default function UploadPanel({ addToast }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const fileRef = useRef();

  useEffect(() => {
    api.getUploadHistory().then(setHistory).catch(() => {});
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const data = await api.uploadFile(file);
      setResult(data);
      addToast(`Imported ${data.imported} contacts from ${data.filename}`, 'success');
      api.getUploadHistory().then(setHistory);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div>
      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.json"
          onChange={e => handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div className="loading-overlay" style={{ padding: 0 }}>
            <div className="spinner" />
            <span>PROCESSING FILE...</span>
          </div>
        ) : (
          <>
            <div className="upload-icon">⇪</div>
            <div className="upload-text">
              Drop your CSV or JSON file here, or click to browse
            </div>
            <div className="upload-hint">
              Supports CSV and JSON formats. Maximum file size: 50MB.
              <br />
              French column names (Prenom, Nom, Telephone, etc.) are automatically mapped.
            </div>
          </>
        )}
      </div>

      {/* Upload Result */}
      {result && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <span className="card-title">Import Results</span>
            <span className={`badge ${result.imported > 0 ? 'active' : 'inactive'}`}>
              {result.imported > 0 ? 'SUCCESS' : 'FAILED'}
            </span>
          </div>
          <div className="card-body">
            <div className="stats-grid" style={{ marginBottom: 0 }}>
              <div className="stat-card blue">
                <div className="stat-label">Total Records</div>
                <div className="stat-value">{result.total}</div>
              </div>
              <div className="stat-card green">
                <div className="stat-label">Imported</div>
                <div className="stat-value">{result.imported}</div>
              </div>
              <div className="stat-card orange">
                <div className="stat-label">Skipped</div>
                <div className="stat-value">{result.skipped}</div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Errors
                </div>
                {result.errors.map((err, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', background: 'var(--accent-red-dim)',
                    borderRadius: 'var(--radius-sm)', marginBottom: 4,
                    fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-red)'
                  }}>
                    {err}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSV Format Guide */}
      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">CSV Format</span>
          </div>
          <div className="card-body">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 2 }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Required columns:</div>
              <code style={{ color: 'var(--accent-green)' }}>first_name</code> or <code style={{ color: 'var(--accent-green)' }}>prenom</code><br />
              <code style={{ color: 'var(--accent-green)' }}>last_name</code> or <code style={{ color: 'var(--accent-green)' }}>nom</code><br />
              <div style={{ color: 'var(--text-muted)', marginTop: 12, marginBottom: 8 }}>Optional columns:</div>
              <code>email, phone/telephone, company/entreprise</code><br />
              <code>position/poste, city/ville, country/pays</code><br />
              <code>whatsapp, telegram, tags, notes</code>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">JSON Format</span>
          </div>
          <div className="card-body">
            <pre style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)', padding: 12, borderRadius: 'var(--radius-md)',
              overflow: 'auto', lineHeight: 1.6
            }}>
{`[
  {
    "first_name": "Marie",
    "last_name": "Dupont",
    "email": "m.dupont@email.fr",
    "phone": "+33612345678",
    "company": "TechCorp",
    "city": "Paris",
    "whatsapp_number": "+33612345678",
    "telegram_handle": "mdupont"
  }
]`}
            </pre>
          </div>
        </div>
      </div>

      {/* Upload History */}
      {history.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <span className="card-title">Import History</span>
          </div>
          <div className="data-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Total</th>
                  <th>Imported</th>
                  <th>Skipped</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{h.filename}</td>
                    <td>{h.records_total}</td>
                    <td style={{ color: 'var(--accent-green)' }}>{h.records_imported}</td>
                    <td style={{ color: h.records_skipped > 0 ? 'var(--accent-orange)' : 'var(--text-muted)' }}>
                      {h.records_skipped}
                    </td>
                    <td><span className={`badge ${h.status === 'completed' ? 'active' : 'unknown'}`}>{h.status}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(h.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
