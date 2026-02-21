import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Star, ChevronRight, Mail, Search } from 'lucide-react';
import { EmailItem, Settings } from '../types';

interface InboxTriageProps {
  currentEmail: any;
}

export default function InboxTriage({ currentEmail }: InboxTriageProps) {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    // Mocking inbox data since we can't easily fetch full inbox via Office.js without Graph
    // In a real app, you'd use Graph API or just triage the current email
    generateMockEmails();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const generateMockEmails = () => {
    const mock: EmailItem[] = [
      {
        id: '1',
        sender: 'nitzan@client.il',
        subject: 'Urgent: Quote for 50x Dell Servers',
        receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3h ago
        isUnread: true,
        priority: 'High',
        isVip: true
      },
      {
        id: '2',
        sender: 'procurement@global.com',
        subject: 'RFQ: Networking Hardware Q1',
        receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 49), // 49h ago
        isUnread: true,
        priority: 'High',
        isVip: false
      },
      {
        id: '3',
        sender: 'vendor@cisco.com',
        subject: 'Price update for Catalyst series',
        receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25h ago
        isUnread: false,
        priority: 'Med',
        isVip: false
      },
      {
        id: '4',
        sender: 'newsletter@itnews.com',
        subject: 'Weekly Tech Digest',
        receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1h ago
        isUnread: false,
        priority: 'Low',
        isVip: false
      }
    ];
    setEmails(mock);
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Med': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const formatAge = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Inbox Triage</h2>
        <div className="flex gap-2">
          <button className="p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
            <Search className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
            <Mail className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005FB8]"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <div 
              key={email.id}
              className={`p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden ${
                email.isUnread ? 'border-l-4 border-l-[#005FB8]' : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(email.priority)}`}>
                    {email.priority}
                  </span>
                  {email.isVip && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400" /> VIP
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatAge(email.receivedAt)}
                </span>
              </div>
              
              <h3 className={`text-sm mb-0.5 truncate ${email.isUnread ? 'font-bold' : 'font-medium'}`}>
                {email.subject}
              </h3>
              <p className="text-xs text-gray-500 truncate">{email.sender}</p>
              
              {email.priority === 'High' && (
                <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1 text-[10px] text-red-500 font-bold">
                  <AlertCircle className="w-3 h-3" />
                  SLA: {email.isVip ? '2h' : '48h'} Limit Exceeded
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {currentEmail && (
        <div className="mt-6 p-4 bg-[#005FB8]/5 border border-[#005FB8]/10 rounded-2xl">
          <h3 className="text-xs font-bold text-[#005FB8] uppercase mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Current Email Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Priority Score</span>
              <span className="font-bold text-red-600">High (92%)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Keywords Found</span>
              <span className="text-gray-900">"Quote", "Server"</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Action Recommended</span>
              <span className="text-gray-900 font-medium">Draft Quote Reply</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
