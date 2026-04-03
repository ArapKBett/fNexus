import React, { useState, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SearchPanel from './components/SearchPanel';
import UploadPanel from './components/UploadPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import ContactsTable from './components/ContactsTable';
import Toast from './components/Toast';

function App() {
  const location = useLocation();
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '⬡', section: 'core' },
    { path: '/search', label: 'Search Contacts', icon: '⌕', section: 'core' },
    { path: '/contacts', label: 'All Contacts', icon: '⊞', section: 'core' },
    { path: '/upload', label: 'Import Data', icon: '⇪', section: 'data' },
    { path: '/analytics', label: 'Analytics', icon: '⊿', section: 'data' },
  ];

  const getPageTitle = () => {
    const found = navItems.find(n => n.path === location.pathname);
    return found ? found.label.toUpperCase() : 'NEXUS';
  };

  return (
    <>
      <div className="hex-bg" />
      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">N</div>
            <div>
              <div className="logo-text">NEXUS</div>
              <div className="logo-sub">Contact Intel</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-title">Operations</div>
            {navItems.filter(n => n.section === 'core').map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}

            <div className="nav-section-title" style={{ marginTop: 16 }}>Data</div>
            {navItems.filter(n => n.section === 'data').map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-status">
              <span className="status-dot" />
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <header className="header">
            <span className="header-title">// {getPageTitle()}</span>
            <div className="header-actions">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                NEXUS v1.0 — French Outreach Program
              </span>
            </div>
          </header>

          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard addToast={addToast} />} />
              <Route path="/search" element={<SearchPanel addToast={addToast} />} />
              <Route path="/contacts" element={<ContactsTable addToast={addToast} />} />
              <Route path="/upload" element={<UploadPanel addToast={addToast} />} />
              <Route path="/analytics" element={<AnalyticsPanel addToast={addToast} />} />
            </Routes>
          </div>
        </main>
      </div>

      <Toast toasts={toasts} />
    </>
  );
}

export default App;
