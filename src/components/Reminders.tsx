import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, MessageSquare, CheckCircle2, Send, Clock, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function Reminders() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking reminders/escalations
    setTimeout(() => {
      setReminders([
        {
          id: 1,
          type: 'escalation',
          title: 'Overdue Quote: Dell Servers',
          desc: 'No reply to nitzan@client.il in 48h. Manager draft ready.',
          severity: 'high',
          action: 'Approve Draft'
        },
        {
          id: 2,
          type: 'reminder',
          title: 'Draft Monitor',
          desc: '3 customer drafts idle for >30min.',
          severity: 'med',
          action: 'Review Drafts'
        },
        {
          id: 3,
          type: 'vendor',
          title: 'Vendor ETA Missing',
          desc: 'Cisco Catalyst quote sent 24h ago. No ETA received.',
          severity: 'med',
          action: 'Follow Up'
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Reminders & Escalations</h2>
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {reminders.length} Active
        </span>
      </div>

      {/* Summary Action */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Send className="w-16 h-16 text-[#005FB8]" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Daily Summary</h3>
        <p className="text-xs text-gray-500 mb-4">You have 4 overdue quotes and 3 pending vendor ETAs.</p>
        <button className="w-full bg-[#005FB8] text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#004a8f] transition-colors">
          <MessageSquare className="w-4 h-4" /> Generate Manager Report
        </button>
      </div>

      <div className="space-y-3">
        {reminders.map((item) => {
          const Icon = getIcon(item.type);
          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-2xl border flex gap-4 ${getSeverityStyles(item.severity)}`}
            >
              <div className="mt-1">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                <p className="text-xs opacity-80 mb-3">{item.desc}</p>
                <button className="text-xs font-bold flex items-center gap-1 hover:underline">
                  {item.action} <CheckCircle2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Escalation Config Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Active Escalation Rules</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">VIP No Reply (2h)</span>
            <span className="text-green-600 font-bold">Active</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Quote Sent No ETA (24h)</span>
            <span className="text-green-600 font-bold">Active</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Manager CC on Overdue</span>
            <span className="text-gray-400">Disabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
