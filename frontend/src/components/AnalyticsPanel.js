import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function BarChart({ data, labelKey, valueKey, color = 'blue', maxItems = 10 }) {
  const items = data.slice(0, maxItems);
  const max = Math.max(...items.map(d => d[valueKey]), 1);

  return (
    <div className="bar-chart">
      {items.map((item, i) => (
        <div key={i} className="bar-row">
          <div className="bar-label" title={item[labelKey]}>{item[labelKey] || 'Unknown'}</div>
          <div className="bar-track">
            <div
              className={`bar-fill ${color}`}
              style={{ width: `${(item[valueKey] / max) * 100}%` }}
            />
          </div>
          <div className="bar-value">{item[valueKey]}</div>
        </div>
      ))}
      {items.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          No data available
        </div>
      )}
    </div>
  );
}

function DonutStat({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
        background: `conic-gradient(${color} ${pct * 3.6}deg, var(--bg-tertiary) 0)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)'
        }}>
          {pct}%
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default function AnalyticsPanel({ addToast }) {
  const [overview, setOverview] = useState(null);
  const [cityData, setCityData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [coverage, setCoverage] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getOverview(),
      api.getByCity(),
      api.getByCompany(),
      api.getBySource(),
      api.getPlatformCoverage(),
      api.getGrowth(),
    ])
      .then(([ov, city, company, source, cov, gr]) => {
        setOverview(ov);
        setCityData(city);
        setCompanyData(company);
        setSourceData(source);
        setCoverage(cov);
        setGrowth(gr);
      })
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <span>COMPUTING ANALYTICS...</span>
      </div>
    );
  }

  if (!overview) return null;
  const { stats } = overview;

  return (
    <div>
      {/* Platform Coverage Overview */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Platform Coverage</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24 }}>
            <DonutStat label="WhatsApp" value={stats.whatsappActive} total={stats.totalContacts} color="var(--whatsapp)" />
            <DonutStat label="Telegram" value={stats.telegramActive} total={stats.totalContacts} color="var(--telegram)" />
            <DonutStat label="Both" value={stats.bothPlatforms} total={stats.totalContacts} color="var(--accent-purple)" />
            <DonutStat label="No Platform" value={Math.max(0, stats.noPlatform)} total={stats.totalContacts} color="var(--accent-red)" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Contacts by City</span>
          </div>
          <div className="card-body">
            <BarChart data={cityData} labelKey="city" valueKey="count" color="blue" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Contacts by Company</span>
          </div>
          <div className="card-body">
            <BarChart data={companyData} labelKey="company" valueKey="count" color="purple" />
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Data Sources</span>
          </div>
          <div className="card-body">
            <BarChart data={sourceData} labelKey="source" valueKey="count" color="cyan" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Contact Growth (Last 30 Days)</span>
          </div>
          <div className="card-body">
            {growth.length > 0 ? (
              <BarChart data={growth} labelKey="date" valueKey="count" color="green" maxItems={30} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                No growth data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Platform Status Breakdown */}
      {coverage && (
        <div className="grid-2" style={{ marginTop: 24 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">WhatsApp Status</span>
            </div>
            <div className="card-body">
              {coverage.whatsapp.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                  marginBottom: 8
                }}>
                  <span className={`badge ${s.status}`}>
                    <span className="badge-dot" /> {s.status}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Telegram Status</span>
            </div>
            <div className="card-body">
              {coverage.telegram.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                  marginBottom: 8
                }}>
                  <span className={`badge ${s.status}`}>
                    <span className="badge-dot" /> {s.status}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* City Platform Breakdown */}
      {cityData.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <span className="card-title">City Platform Breakdown</span>
          </div>
          <div className="data-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Total</th>
                  <th>WhatsApp</th>
                  <th>Telegram</th>
                  <th>WA Coverage</th>
                  <th>TG Coverage</th>
                </tr>
              </thead>
              <tbody>
                {cityData.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{c.city}</td>
                    <td>{c.count}</td>
                    <td style={{ color: 'var(--whatsapp)' }}>{c.whatsapp_count}</td>
                    <td style={{ color: 'var(--telegram)' }}>{c.telegram_count}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(c.whatsapp_count / c.count) * 100}%`, background: 'var(--whatsapp)', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', minWidth: 35 }}>
                          {Math.round((c.whatsapp_count / c.count) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(c.telegram_count / c.count) * 100}%`, background: 'var(--telegram)', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', minWidth: 35 }}>
                          {Math.round((c.telegram_count / c.count) * 100)}%
                        </span>
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
  );
}
