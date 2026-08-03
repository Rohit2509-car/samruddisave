import React, { useState, useEffect } from 'react';
import { stateStore } from '../../store/StateStore';
import { AuditLog, UserProfile } from '../../types';
import { Settings, ShieldCheck, Lock, FileText, Users, Database, RotateCcw, Search } from 'lucide-react';

interface AdminPanelPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<AuditLog[]>(stateStore.getAuditLogs());
  const [profiles, setProfiles] = useState<UserProfile[]>(stateStore.getProfiles());
  const [searchLog, setSearchLog] = useState('');

  useEffect(() => {
    const unsubscribe = stateStore.subscribe(() => {
      setLogs(stateStore.getAuditLogs());
      setProfiles(stateStore.getProfiles());
    });
    return unsubscribe;
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.details.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-[#1F1F24] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            RBAC Access Tier: Super Admin
          </span>
          <h1 className="font-heading font-extrabold text-3xl text-white mt-2">
            Executive Platform Governance Desk
          </h1>
          <p className="text-xs text-slate-300">
            256-bit encrypted system audit trail, staff role governance, & plan parameter overrides
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset all demo data back to initial platform seed state?')) {
              stateStore.resetToDefaults();
            }
          }}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-5 rounded-2xl transition-all shadow-md text-xs flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="w-4 h-4" /> Reset All System Data
        </button>
      </div>

      {/* Staff Roster Grid */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8EAF8] shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-lg text-[#1F1F24]">Platform Staff Roster & Department Roles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {profiles.filter(p => p.role !== 'member').map(staff => (
            <div key={staff.id} className="p-4 bg-[#F7F8FC] border border-[#E8EAF8] rounded-2xl space-y-1">
              <span className="bg-purple-100 text-purple-900 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                {staff.role}
              </span>
              <p className="font-bold text-[#1F1F24] text-sm mt-1">{staff.full_name}</p>
              <p className="text-[11px] text-[#6C7285]">{staff.email}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 256-Bit Encrypted Audit Logs Inspector */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAF8] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8EAF8] pb-4">
          <div>
            <span className="bg-[#4F5DFF]/10 text-[#4F5DFF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              System Audit Log
            </span>
            <h3 className="font-heading font-extrabold text-2xl text-[#1F1F24] mt-1">
              256-Bit Encrypted System Audit Trail
            </h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit actions..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="w-full bg-[#F7F8FC] border border-[#E8EAF8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1F1F24] outline-none"
            />
          </div>
        </div>

        <div className="space-y-3 font-mono text-xs max-h-96 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-[#1F1F24] text-slate-200 p-4 rounded-2xl space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span className="text-[#8A7BFF] font-bold">[{log.action}]</span>
                <span>{new Date(log.timestamp).toLocaleString()} • IP: {log.ip_address}</span>
              </div>
              <p className="text-white text-xs">{log.details}</p>
              <p className="text-[10px] text-slate-400">Triggered by User: {log.user_id} ({log.user_role})</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
