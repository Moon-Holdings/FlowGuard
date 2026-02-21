import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUpRight, 
  ChevronRight, 
  Sparkles, 
  AlertCircle,
  DollarSign,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Deal, Settings, TabType } from '../types';

interface DashboardProps {
  setActiveTab: (tab: TabType) => void;
  currentEmail: any;
}

export default function Dashboard({ setActiveTab, currentEmail }: DashboardProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealsRes, escRes, setRes] = await Promise.all([
          fetch('/api/deals'),
          fetch('/api/escalations'),
          fetch('/api/settings')
        ]);
        
        setDeals(await dealsRes.json());
        setEscalations(await escRes.json());
        setSettings(await setRes.json());
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const totalValue = deals.reduce((acc, d) => acc + d.value, 0);
  const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
  const overdueCount = escalations.length;

  const stats = [
    { label: 'Pipeline', value: `$${(totalValue / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active', value: activeDeals, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Alerts', value: overdueCount, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initializing Command Center...</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className={`w-7 h-7 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
            <p className="text-sm font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Contextual Analysis Card */}
      {currentEmail ? (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Live Analysis</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Subject: {currentEmail.subject.slice(0, 20)}...</span>
            </div>
            <h3 className="text-lg font-bold mb-1 leading-tight">Smart Deal Detected</h3>
            <p className="text-xs text-slate-400 mb-5">Gemini identified a high-value RFQ from this sender.</p>
            <button 
              onClick={() => setActiveTab('Inbox')}
              className="bg-white text-slate-900 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95"
            >
              Extract & Triage <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select an email to begin analysis</p>
        </div>
      )}

      {/* Main Dashboard Sections */}
      <div className="grid grid-cols-1 gap-5">
        
        {/* Urgent Escalations */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Urgent Escalations
            </h3>
            <button onClick={() => setActiveTab('Reminders')} className="text-[10px] font-bold text-blue-600">View All</button>
          </div>
          <div className="space-y-2">
            {escalations.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-emerald-700 tracking-tight">All clear! No overdue responses.</p>
              </div>
            ) : (
              escalations.slice(0, 2).map((esc) => (
                <div key={esc.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{esc.customer_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Idle for 24h+</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Pipeline Pulse */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Pipeline Pulse
            </h3>
            <button onClick={() => setActiveTab('Pipeline')} className="text-[10px] font-bold text-blue-600">Full Board</button>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {deals.slice(0, 3).map((deal, idx) => (
              <div key={deal.id} className={`p-4 flex items-center justify-between ${idx !== 2 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-bold text-[10px]">
                    {deal.customer_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{deal.customer_name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{deal.stage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">${deal.value.toLocaleString()}</p>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-tight">Active</p>
                </div>
              </div>
            ))}
            {deals.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No active deals</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
