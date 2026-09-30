import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ShieldAlert, Map, AlertTriangle, Target } from 'lucide-react';

const SOCKET_URL = 'http://localhost:8000';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.error(err));

    const socket = io(SOCKET_URL);

    socket.on('new_alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Alerts & Incidents</h1>
          <p className="text-text-muted">Detected threats mapped to MITRE ATT&CK framework</p>
        </div>
      </div>

      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center justify-center text-text-muted">
            <ShieldAlert size={48} className="mb-4 opacity-20" />
            <p>No alerts detected. Environment is secure.</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div key={i} className="bg-surface border border-border hover:border-border/80 rounded-xl p-5 flex flex-col md:flex-row gap-6 transition-all duration-300">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                    ${alert.severity === 'critical' ? 'bg-danger/10 text-danger border-danger/20' : 
                      alert.severity === 'high' ? 'bg-warning/10 text-warning border-warning/20' : 
                      'bg-primary/10 text-primary border-primary/20'}`}>
                    {alert.severity}
                  </span>
                  <h3 className="text-lg font-semibold">{alert.rule_name}</h3>
                  <span className="text-xs text-text-muted ml-auto">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-text-muted mb-4">{alert.description}</p>
                
                <div className="flex flex-wrap gap-4">
                  {alert.mitre_tactic && (
                    <div className="flex items-center text-xs bg-background border border-border px-3 py-1.5 rounded-lg">
                      <Target size={14} className="mr-2 text-primary" />
                      <span className="text-text-muted mr-1">Tactic:</span> 
                      <span className="font-medium">{alert.mitre_tactic}</span>
                    </div>
                  )}
                  {alert.mitre_technique && (
                    <div className="flex items-center text-xs bg-background border border-border px-3 py-1.5 rounded-lg">
                      <Map size={14} className="mr-2 text-primary" />
                      <span className="text-text-muted mr-1">Technique:</span> 
                      <span className="font-medium">{alert.mitre_technique}</span>
                    </div>
                  )}
                  {alert.source_ips?.length > 0 && (
                    <div className="flex items-center text-xs bg-background border border-border px-3 py-1.5 rounded-lg">
                      <AlertTriangle size={14} className="mr-2 text-danger" />
                      <span className="text-text-muted mr-1">Source:</span> 
                      <span className="font-medium text-danger">{alert.source_ips.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors shadow-primary-glow">
                  Investigate
                </button>
                <button className="px-4 py-2 bg-background border border-border hover:bg-surface-hover rounded-lg text-sm font-medium transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
