import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Star, ChevronRight, Mail, Search, Sparkles, Plus, Inbox } from 'lucide-react';
import { EmailItem, Settings, Deal } from '../types';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'motion/react';

interface InboxTriageProps {
  currentEmail: any;
}

export default function InboxTriage({ currentEmail }: InboxTriageProps) {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [extractedDeal, setExtractedDeal] = useState<Partial<Deal> | null>(null);

  useEffect(() => {
    const init = async () => {
      const s = await fetchSettings();
      generateMockEmails(s);
    };
    init();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const calculatePriority = (email: any, settings: Settings | null): 'High' | 'Med' | 'Low' => {
    if (!settings) return 'Low';
    
    const body = (email.subject + " " + email.sender).toLowerCase();
    const isVip = settings.vips.some(v => email.sender.toLowerCase().includes(v.toLowerCase()));
    const hasKeywords = settings.rules.urgent_keywords.some(k => body.includes(k.toLowerCase()));
    
    const hoursOld = Math.floor((Date.now() - email.receivedAt.getTime()) / (1000 * 60 * 60));

    if (hasKeywords || isVip || (email.isUnread && hoursOld > 48)) return 'High';
    if (email.sender.includes('@') && hoursOld > 24) return 'Med';
    return 'Low';
  };

  const generateMockEmails = (s: Settings | null) => {
    const baseMock = [
      { id: '1', sender: 'nitzan@client.il', subject: 'Urgent: Quote for 50x Dell Servers', receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), isUnread: true },
      { id: '2', sender: 'procurement@global.com', subject: 'RFQ: Networking Hardware Q1', receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 49), isUnread: true },
      { id: '3', sender: 'vendor@cisco.com', subject: 'Price update for Catalyst series', receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 25), isUnread: false },
      { id: '4', sender: 'newsletter@itnews.com', subject: 'Weekly Tech Digest', receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 1), isUnread: false }
    ];

    const processed = baseMock.map(m => ({
      ...m,
      isVip: s?.vips.some(v => m.sender.toLowerCase().includes(v.toLowerCase())) || false,
      priority: calculatePriority(m, s)
    }));

    setEmails(processed as EmailItem[]);
    setLoading(false);
  };

  const extractDealData = async () => {
    if (!currentEmail) return;
    setExtracting(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract deal information from this email subject: "${currentEmail.subject}" and sender: "${currentEmail.sender}". 
        Return JSON with: customer_name, value (number), subject, notes. 
        If value is not found, estimate based on context or return 0.`,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text);
      setExtractedDeal(data);
    } catch (e) {
      console.error("Extraction failed", e);
    } finally {
      setExtracting(false);
    }
  };

  const saveDeal = async () => {
    if (!extractedDeal) return;
    await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...extractedDeal,
        stage: 'new'
      })
    });
    setExtractedDeal(null);
    alert("Deal added to pipeline!");
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
    <div className="space-y-5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Inbox className="w-3.5 h-3.5" /> Email Triage
        </h2>
        <div className="flex gap-2">
          <button className="p-1.5 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 shadow-sm">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {currentEmail ? (
        <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${getPriorityColor(calculatePriority(currentEmail, settings))}`}>
                {calculatePriority(currentEmail, settings)} Priority
              </span>
              {settings?.vips.some(v => currentEmail.sender.toLowerCase().includes(v.toLowerCase())) && (
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1 uppercase tracking-widest">
                  <Star className="w-3 h-3 fill-amber-400" /> VIP
                </span>
              )}
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1 leading-tight">{currentEmail.subject}</h3>
          <p className="text-xs text-slate-400 font-medium">{currentEmail.sender}</p>
        </div>
      ) : (
        <div className="p-10 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
          <Mail className="w-8 h-8 text-slate-200 mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select an email to analyze</p>
        </div>
      )}

      {currentEmail && (
        <div className="p-5 bg-slate-900 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Sparkles className="w-20 h-20 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Smart Extraction
              </h3>
              {!extractedDeal && (
                <button 
                  onClick={extractDealData}
                  disabled={extracting}
                  className="text-[9px] bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest disabled:opacity-50 transition-all active:scale-95"
                >
                  {extracting ? "Scanning..." : "Run AI Scan"}
                </button>
              )}
            </div>

            {extractedDeal ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Detected Deal</span>
                    <span className="text-sm font-black text-emerald-400">${extractedDeal.value?.toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{extractedDeal.customer_name}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{extractedDeal.notes}</p>
                  
                  <button 
                    onClick={saveDeal}
                    className="w-full mt-4 bg-emerald-500 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                  >
                    <Plus className="w-4 h-4" /> Create Deal Entry
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-tight">Priority Signal</span>
                  <span className={`font-black uppercase tracking-widest ${calculatePriority(currentEmail, settings) === 'High' ? 'text-red-400' : 'text-slate-200'}`}>
                    {calculatePriority(currentEmail, settings)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-tight">Keywords</span>
                  <span className="text-slate-200 font-black uppercase tracking-tight">
                    {settings?.rules.urgent_keywords.filter(k => currentEmail.subject.toLowerCase().includes(k.toLowerCase())).join(", ") || "None"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pt-2">
        <div className="flex items-center justify-between px-1 mb-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
          <button onClick={() => {}} className="text-[9px] font-bold text-blue-600 uppercase">View All</button>
        </div>
        <div className="space-y-2">
          {emails.slice(0, 3).map(email => (
            <div key={email.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm hover:border-blue-100 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-bold text-[10px]">
                  {email.sender.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{email.subject}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tight">{email.sender}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
