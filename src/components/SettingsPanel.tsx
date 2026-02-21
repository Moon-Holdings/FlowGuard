import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Save, 
  Globe,
  Users,
  History,
  AlertTriangle,
  Download,
  FileCode
} from 'lucide-react';
import { Settings } from '../types';

interface SettingsPanelProps {
  isRtl: boolean;
  setIsRtl: (val: boolean) => void;
}

export default function SettingsPanel({ isRtl, setIsRtl }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [newVip, setNewVip] = useState('');
  const [saving, setSaving] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchAuditLogs();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(data);
  };

  const fetchAuditLogs = async () => {
    const res = await fetch('/api/audit');
    const data = await res.json();
    setAuditLogs(data);
  };

  const downloadManifest = async () => {
    try {
      // We fetch the manifest.xml from the server
      const response = await fetch('/manifest.xml');
      const text = await response.text();
      
      const blob = new Blob([text], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'manifest.xml';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading manifest:', error);
    }
  };

  const saveSettings = async (updated: Settings) => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'rules', value: updated.rules })
    });
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'vips', value: updated.vips })
    });
    setSaving(false);
    setSettings(updated);
  };

  const addVip = () => {
    if (!newVip || !settings) return;
    const updated = { ...settings, vips: [...settings.vips, newVip] };
    saveSettings(updated);
    setNewVip('');
  };

  const removeVip = (vip: string) => {
    if (!settings) return;
    const updated = { ...settings, vips: settings.vips.filter(v => v !== vip) };
    saveSettings(updated);
  };

  if (!settings) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Enterprise Settings</h2>
        {saving && <span className="text-[10px] text-[#005FB8] font-bold animate-pulse">Saving...</span>}
      </div>

      {/* Deployment & Download */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
          <FileCode className="w-4 h-4" /> Deployment
        </h3>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold mb-1">Outlook Manifest</p>
          <p className="text-[10px] text-gray-500 mb-4">
            Download the configuration file to sideload FlowGuard into your Outlook. 
            This version is configured for <span className="font-mono text-[#005FB8]">https://localhost:3000</span>.
          </p>
          <button 
            onClick={downloadManifest}
            className="w-full bg-[#005FB8] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#004a8f] transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Download manifest.xml
          </button>
        </div>
      </section>

      {/* Language & RTL */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
          <Globe className="w-4 h-4" /> Interface & Language
        </h3>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">RTL Support (Hebrew)</p>
            <p className="text-[10px] text-gray-500">Toggle right-to-left layout for local teams.</p>
          </div>
          <button 
            onClick={() => setIsRtl(!isRtl)}
            className={`w-12 h-6 rounded-full transition-colors relative ${isRtl ? 'bg-[#005FB8]' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isRtl ? 'right-1' : 'left-1'}`}></div>
          </button>
        </div>
      </section>

      {/* VIP Management */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
          <Shield className="w-4 h-4" /> VIP Domains & Emails
        </h3>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newVip}
              onChange={(e) => setNewVip(e.target.value)}
              placeholder="e.g. client.co.il"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005FB8]/20"
            />
            <button 
              onClick={addVip}
              className="bg-[#005FB8] text-white p-2 rounded-lg hover:bg-[#004a8f]"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.vips.map((vip) => (
              <span key={vip} className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                {vip}
                <button onClick={() => removeVip(vip)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Escalation Rules */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Escalation Logic
        </h3>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Manager Email</label>
            <input 
              type="email" 
              value={settings.rules.manager_email}
              onChange={(e) => saveSettings({ ...settings, rules: { ...settings.rules, manager_email: e.target.value } })}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">VIP SLA (Hours)</label>
              <input 
                type="number" 
                value={settings.rules.vip_sla_hours}
                onChange={(e) => saveSettings({ ...settings, rules: { ...settings.rules, vip_sla_hours: parseInt(e.target.value) } })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Standard SLA (Hours)</label>
              <input 
                type="number" 
                defaultValue={48}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Audit Log */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
          <History className="w-4 h-4" /> Audit Log
        </h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="max-h-40 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 border-b border-gray-50 last:border-0 flex justify-between items-center">
                <div>
                  <p className="text-xs font-medium text-gray-900">{log.action}</p>
                  <p className="text-[9px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
                <span className="text-[9px] text-gray-400 font-mono">#{log.deal_id || 'SYS'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Sharing */}
      <section className="space-y-3 pb-10">
        <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
          <Users className="w-4 h-4" /> Team Sharing
        </h3>
        <div className="bg-[#005FB8] p-4 rounded-2xl text-white shadow-lg">
          <p className="text-sm font-bold mb-1">Collaborative Pipeline</p>
          <p className="text-xs opacity-80 mb-4">Share your deals and escalations with the IT Sales BU.</p>
          <button className="w-full bg-white/20 hover:bg-white/30 py-2 rounded-xl text-xs font-bold transition-colors">
            Invite Team Members
          </button>
        </div>
      </section>
    </div>
  );
}
