import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Activity, ShieldAlert, Server, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SOCKET_URL = 'http://localhost:8000';

const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
  <div className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden group">
    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-text-muted text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-surface-hover ${colorClass.replace('from-', 'text-').split(' ')[0]}`}>
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <span className="text-success flex items-center">
          ↑ {trend}%
        </span>
        <span className="text-text-muted ml-2">vs last hour</span>
      </div>
    )}
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ total_logs: 0, total_alerts: 0, critical_alerts: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetch('http://localhost:8000/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/alerts?limit=5')
      .then(res => res.json())
      .then(data => setRecentAlerts(data))
      .catch(err => console.error(err));

    // WebSocket connection
    const socket = io(SOCKET_URL);

    socket.on('new_log', (log) => {
      setStats(prev => ({ ...prev, total_logs: prev.total_logs + 1 }));
      setChartData(prev => {
        const now = new Date().toLocaleTimeString();
        const newData = [...prev, { time: now, events: 1 }];
        if (newData.length > 20) newData.shift();
        return newData;
      });
    });

    socket.on('new_alert', (alert) => {
      setStats(prev => ({ 
        ...prev, 
        total_alerts: prev.total_alerts + 1,
        critical_alerts: alert.severity === 'critical' ? prev.critical_alerts + 1 : prev.critical_alerts
      }));
      setRecentAlerts(prev => [alert, ...prev].slice(0, 5));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">SOC Dashboard</h1>
          <p className="text-text-muted">Real-time threat monitoring and response</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Events Processed" value={stats.total_logs.toLocaleString()} icon={Activity} colorClass="from-primary to-transparent" trend="12" />
        <StatCard title="Active Alerts" value={stats.total_alerts.toLocaleString()} icon={ShieldAlert} colorClass="from-warning to-transparent" />
        <StatCard title="Critical Threats" value={stats.critical_alerts.toLocaleString()} icon={AlertTriangle} colorClass="from-danger to-transparent" />
        <StatCard title="Monitored Assets" value="42" icon={Server} colorClass="from-success to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="mr-2 text-primary" size={20} /> Event Velocity
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-text-main)' }}
                />
                <Area type="monotone" dataKey="events" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ShieldAlert className="mr-2 text-warning" size={20} /> Recent Alerts
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {recentAlerts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-text-muted">No alerts recently.</div>
            ) : (
              recentAlerts.map((alert, i) => (
                <div key={i} className="p-3 rounded-lg bg-background border border-border hover:border-border/80 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase
                      ${alert.severity === 'critical' ? 'bg-danger/20 text-danger' : 
                        alert.severity === 'high' ? 'bg-warning/20 text-warning' : 
                        'bg-primary/20 text-primary'}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-text-muted">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{alert.rule_name}</h4>
                  <p className="text-xs text-text-muted truncate">{alert.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
