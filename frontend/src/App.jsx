import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { api } from './api';
import { Activity, Bell, Settings, LogOut, RefreshCw, AlertTriangle, Info, XCircle, ShieldCheck, Mail, Database, Zap, Terminal } from 'lucide-react';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [isInjecting, setIsInjecting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // New Native React State for the purely frontend Log Details Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get('/logs');
      setLogs(response.data || response || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to connect to API');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const injectTestLog = async () => {
    setIsInjecting(true);
    try {
      const demoLogs = [
        { source: "payment-gateway", level: "error", message: "Stripe connection timeout during checkout user_9102." },
        { source: "auth-service", level: "critical", message: "Multiple unauthorized root access attempts detected from unknown IP." },
        { source: "database", level: "warning", message: "High latency detected on user_profiles table scan (1400ms)." },
        { source: "frontend-ui", level: "info", message: "User successfully updated their shipping address." }
      ];
      const randomLog = demoLogs[Math.floor(Math.random() * demoLogs.length)];
      await api.post('/logs', randomLog);
      await fetchLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsInjecting(false);
    }
  };

  const acknowledgeLog = async () => {
    if (!selectedLog) return;
    
    // Optimistic UI Update: Instantly remove it from the visual table so recruiters see immediate responsiveness
    const logIdToRemove = selectedLog.id;
    setLogs(prev => prev.filter(log => log.id !== logIdToRemove));
    setSelectedLog(null);
    
    try {
      await api.delete(`/logs/${logIdToRemove}`);
    } catch (err) {
      // Revert if API physically fails
      alert('Backend deletion failed: ' + err.message + ' (Re-syncing table)');
      await fetchLogs();
    }
  };

  const executeLogRetention = async () => {
    try {
      const res = await api.delete('/logs/system/purge');
      alert(`Success! ${res?.data?.count || 0} old logs were permanently removed from the database.`);
      fetchLogs();
    } catch (err) {
      alert("Failed to run system purge: " + err.message);
    }
  };

  const getStatusIcon = (level) => {
    switch(level?.toLowerCase()) {
      case 'critical': return <XCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'info': return <Info size={16} />;
      default: return <Activity size={16} />;
    }
  };

  // Pure Javascript Array calculations that are extremely easy to explain in an interview
  const totalLogs = Array.isArray(logs) ? logs.length : 0;
  const criticalLogsCount = Array.isArray(logs) ? logs.filter(l => l.level === 'critical' || l.level === 'error').length : 0;
  const latestLogDate = Array.isArray(logs) && logs.length > 0 ? new Date(Math.max(...logs.map(l => new Date(l.created_at || Date.now())))).toLocaleTimeString() : 'N/A';

  const renderMetrics = () => (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <div className="glass-panel" style={{ flex: '1 1 200px', padding: '24px', borderLeft: '4px solid var(--accent)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Analyzed</p>
        <h3 style={{ fontSize: '2rem', fontWeight: 600 }}>{totalLogs}</h3>
      </div>
      <div className="glass-panel" style={{ flex: '1 1 200px', padding: '24px', borderLeft: '4px solid var(--danger)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Critical Incidents</p>
        <h3 style={{ fontSize: '2rem', fontWeight: 600 }}>{criticalLogsCount}</h3>
      </div>
      <div className="glass-panel" style={{ flex: '1 1 200px', padding: '24px', borderLeft: '4px solid var(--success)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Last Activity</p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{latestLogDate}</h3>
      </div>
    </div>
  );

  const renderTable = (data) => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Level</th>
            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Message</th>
            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Category</th>
            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Severity</th>
            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map((log) => (
            <tr key={log.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <td style={{ padding: '16px' }}>
                <span className={`status-badge status-${log.level?.toLowerCase() || 'info'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {getStatusIcon(log.level)} {log.level}
                </span>
              </td>
              <td style={{ padding: '16px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.message}</td>
              <td style={{ padding: '16px' }}>{log.category || 'Unclassified'}</td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                      <div style={{ width: `${(log.severity || 0) * 10}%`, height: '100%', background: (log.severity || 0) > 7 ? 'var(--danger)' : (log.severity || 0) > 4 ? 'var(--warning)' : 'var(--success)' }}></div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.severity || 0}/10</span>
                </div>
              </td>
              <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                 <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setSelectedLog(log)}>Review</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDashboard = () => {
    return (
      <>
        {renderMetrics()}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {Array.isArray(logs) && logs.length === 0 && !isRefreshing && !error ? (
            <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No logs found! Click "Inject Demo Log" above to test the AI system dynamically.
            </div>
          ) : renderTable(logs)}
        </div>
      </>
    );
  };

  const renderAlerts = () => {
    const alertLogs = Array.isArray(logs) ? logs.filter(log => log.level === 'critical' || log.level === 'error' || (log.severity || 0) >= 7) : [];
    if (alertLogs.length === 0) {
      return (
        <div className="glass-panel" style={{ padding: '64px', textAlign: 'center', color: 'var(--success)' }}>
          <ShieldCheck size={48} style={{ margin: '0 auto 16px auto', display: 'block' }} />
          No critical alerts! Your systems are perfectly healthy.
        </div>
      );
    }
    return <div className="glass-panel" style={{ overflow: 'hidden' }}>{renderTable(alertLogs)}</div>;
  };

  const renderSettings = () => {
    return (
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: 600 }}>Preferences & Settings</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}>
            <div style={{ background: 'var(--accent-glow)', padding: '12px', borderRadius: '8px', color: 'var(--accent)' }}>
              <Mail size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>Email Notifications</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Receive instant SMTP alerts when AI marks severity above 7.</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '6px 16px' }}>Enabled</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '8px', color: 'var(--success)' }}>
              <Database size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>Log Retention</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Automatically delete system logs older than 30 days.</p>
            </div>
            <button className="btn btn-outline" style={{ padding: '6px 16px' }} onClick={executeLogRetention}>Run System Purge</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <div className="app-background"></div>
      
      {/* NATIVE REACT MODAL IMPLEMENATION */}
      {selectedLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedLog(null)}>
            <div className="glass-panel" style={{ width: '600px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto', padding: '32px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setSelectedLog(null)}>
                    <XCircle size={24} />
                </button>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getStatusIcon(selectedLog.level)} Incident Report
                </h2>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Source Module</span>
                        <p style={{ fontWeight: 500, fontSize: '1.1rem', marginTop: '4px' }}>{selectedLog.source || 'Unknown'}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>AI Assigned Category</span>
                        <p style={{ fontWeight: 500, fontSize: '1.1rem', marginTop: '4px', color: 'var(--accent)' }}>{selectedLog.category}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>AI Severity</span>
                        <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '4px', color: selectedLog.severity > 7 ? 'var(--danger)' : 'var(--warning)' }}>{selectedLog.severity} / 10</p>
                    </div>
                </div>
                <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Raw Payload Message</span>
                    <p style={{ fontFamily: 'monospace', marginTop: '8px', lineHeight: 1.5 }}>{selectedLog.message}</p>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={acknowledgeLog}>Acknowledge & Clear Incident</button>
            </div>
        </div>
      )}
      
      <aside className="sidebar glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
        <div style={{ paddingBottom: '32px', marginBottom: '24px', borderBottom: '1px solid var(--surface-border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity color="var(--accent)" />
            AI-Log Monitor
          </h2>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className={`btn nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', justifyContent: 'flex-start' }} onClick={() => setActiveTab('dashboard')}>
            <Activity size={18} /><span>Live Dashboard</span>
          </button>
          <button className={`btn nav-item ${activeTab === 'alerts' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', justifyContent: 'flex-start' }} onClick={() => setActiveTab('alerts')}>
            <Bell size={18} /><span>Alerts</span>
          </button>
          <button className={`btn nav-item ${activeTab === 'settings' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', justifyContent: 'flex-start' }} onClick={() => setActiveTab('settings')}>
            <Settings size={18} /><span>Settings</span>
          </button>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => { localStorage.clear(); window.location.href='/login' }}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px', textTransform: 'capitalize' }}>
              {activeTab === 'dashboard' ? 'System Logs' : activeTab}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'dashboard' && 'Real-time AI-powered diagnostic feed.'}
              {activeTab === 'alerts' && 'High severity incidents requiring immediate attention.'}
              {activeTab === 'settings' && 'Manage your account and AI Monitor configurations.'}
            </p>
            <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--accent)' }}>
              <Terminal size={14} />
              <span><strong>Architecture Note:</strong> AI Classification, PostgreSQL handling, and SMTP alerts are executed on the Node.js backend.</span>
            </div>
          </div>
          {activeTab !== 'settings' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" onClick={injectTestLog} disabled={isInjecting} style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(56, 189, 248, 0.1)' }}>
                <Zap size={16} /> {isInjecting ? 'AI Analyzing...' : 'Inject Demo Log'}
              </button>
              <button className="btn btn-primary" onClick={fetchLogs} disabled={isRefreshing}>
                <RefreshCw size={16} className={isRefreshing ? "spin" : ""} /> {isRefreshing ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            Error: {error}
          </div>
        )}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/users/login', { email, password });
      if (res.data && res.data.accessToken) {
         localStorage.setItem('accessToken', res.data.accessToken);
         navigate('/dashboard');
      } else if (res.accessToken) { // fallback
         localStorage.setItem('accessToken', res.accessToken);
         navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="app-background"></div>
      <div className="auth-card glass-panel">
        <h2 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '16px' }}>Enter your credentials to access logs.</p>
        
        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent)' }}>
           <strong style={{ color: 'var(--accent)' }}>Recruiter Note:</strong> This UI is the React visual client for a Node.js Microservice. The core logic (Gemini AI parsing, PostgreSQL mapping, & SMTP Email Alerts) runs externally on the server terminal.
        </div>
        
        {error && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleLogin}>
          <input 
            type="email" 
            className="input-field" 
            placeholder="name@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            className="input-field" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Recruiters and Guests:</p>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.9rem' }} 
              onClick={() => { setEmail('admin2@test.com'); setPassword('securepassword'); }}
            >
              Fill Demo Credentials
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
