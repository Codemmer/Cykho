import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, FileText, Activity, Settings, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Logs from './pages/Logs';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Alerts & Incidents', path: '/alerts', icon: ShieldAlert },
    { name: 'Live Logs', path: '/logs', icon: Activity },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-surface">
        <span className="text-2xl font-bold text-primary tracking-wider shadow-primary-glow">CYKHO SOC</span>
        <button className="md:hidden text-text-muted" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'text-text-muted hover:bg-surface-hover hover:text-text-main'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

const Header = ({ setIsOpen }) => {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      <button className="md:hidden text-text-muted hover:text-text-main" onClick={() => setIsOpen(true)}>
        <Menu size={24} />
      </button>
      <div className="flex-1"></div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-sm text-text-muted">System Active</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <span className="text-primary font-bold text-sm">AD</span>
        </div>
      </div>
    </header>
  );
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen bg-background overflow-hidden text-text-main">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header setIsOpen={setSidebarOpen} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="*" element={<div className="flex items-center justify-center h-full text-text-muted">Under Construction</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
