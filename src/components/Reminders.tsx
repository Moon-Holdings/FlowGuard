import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, MessageSquare, CheckCircle2, Send, Clock, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function Reminders() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEscalations();
  }, []);

  const fetchEscalations = async () => {
    try {
      const res = await fetch('/api/escalations');
      const overdueDeals = await res.json();
      
      const mapped = overdueDeals.map((deal: any) => ({
        id: deal.id,
        type: 'escalation',
        title: `Overdue: ${deal.customer_name}`,
        desc: `Deal "${deal.subject}" has been idle for >24h in ${deal.stage} stage.`,
        severity: 'high',
        action: 'Approve Draft'
      }));

      // Add some static reminders if no real escalations
      if (mapped.length === 0) {
        mapped.push({
          id: 'static-1',
          type: 'reminder',
          title: 'Draft Monitor',
          desc: '3 customer drafts idle for >30min.',
          severity: 'med',
          action: 'Review Drafts'
        });
      }

      setReminders(mapped);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-100 text-red-700';
      case 'med': return 'bg-orange-50 border-orange-100 text-orange-700';
      default: return 'bg-blue-50 border-blue-100 text-blue-700';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'escalation': return ShieldAlert;
      case 'reminder': return Clock;
      default: return Bell;
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5" /> Active Alerts
        </h2>
        <span className="bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
          {reminders.length} Critical
        </span>
      </div>

      {/* Summary Action */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Send className="w-20 h-20 text-blue-400" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-1">Daily Pulse</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">You have {reminders.length} items requiring immediate attention to maintain SLA.</p>
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-900/20">
            <MessageSquare className="w-4 h-4" /> Generate Manager Report
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {reminders.map((item) => {
          const Icon = getIcon(item.type);
          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-5 rounded-3xl border flex gap-4 shadow-sm transition-all hover:shadow-md ${getSeverityStyles(item.severity)}`}
            >
              <div className="mt-1">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black mb-1">{item.title}</h4>
                <p className="text-xs opacity-80 mb-4 leading-relaxed font-medium">{item.desc}</p>
                <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                  {item.action} <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
