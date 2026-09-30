import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Terminal, Search, Filter } from 'lucide-react';

const SOCKET_URL = 'http://localhost:8000';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/logs?limit=50')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error(err));

    const socket = io(SOCKET_URL);

    socket.on('new_log', (log) => {
      setLogs(prev => [log, ...prev].slice(0, 200)); // Keep last 200
    });

    return () => socket.disconnect();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.source_ip?.includes(searchTerm) || 
    log.event_type?.includes(searchTerm) ||
    JSON.stringify(log.details).includes(searchTerm)
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Live Logs</h1>
          <p className="text-text-muted">Real-time event stream from all sensors</p>
        </div>
      </div>

      <div className="bg-surface border border-border p-4 rounded-xl flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search IPs, event types, or details..." 
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-surface-hover flex items-center">
          <Filter size={16} className="mr-2" /> Filter
        </button>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="bg-surface-hover border-b border-border px-4 py-2 flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider">
          <div className="w-48">Timestamp</div>
          <div className="w-32">Source</div>
          <div className="w-32">Destination</div>
          <div className="w-40">Event Type</div>
          <div className="flex-1">Details</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-text-muted">
              <Terminal className="mr-2 opacity-50" size={24} /> No logs found.
            </div>
          ) : (
            filteredLogs.map((log, i) => (
              <div key={i} className="flex items-start hover:bg-surface-hover p-2 rounded transition-colors group">
                <div className="w-48 text-text-muted">{new Date(log.timestamp).toISOString()}</div>
                <div className="w-32 text-primary">{log.source_ip}</div>
                <div className="w-32">{log.destination_ip || '-'}</div>
                <div className="w-40">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium bg-background border border-border
                    ${log.event_type === 'failed_login' ? 'text-danger' : 
                      log.event_type === 'firewall_block' ? 'text-warning' : 'text-success'}`}>
                    {log.event_type}
                  </span>
                </div>
                <div className="flex-1 text-text-muted truncate group-hover:whitespace-normal group-hover:break-all">
                  {JSON.stringify(log.details)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
