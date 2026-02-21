import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  LayoutDashboard, 
  Bell, 
  Settings as SettingsIcon, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Plus,
  ArrowRightLeft,
  ShieldCheck,
  Globe,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Deal, Settings, EmailItem, TabType } from './types';

// Components
import Dashboard from './components/Dashboard';
import InboxTriage from './components/InboxTriage';
import Pipeline from './components/Pipeline';
import Reminders from './components/Reminders';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('Dashboard');
  const [isRtl, setIsRtl] = useState(false);
  const [officeReady, setOfficeReady] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<any>(null);
  const [isQuoteReply, setIsQuoteReply] = useState(false);

  useEffect(() => {
    // @ts-ignore
    Office.onReady((info) => {
      if (info.host === Office.HostType.Outlook) {
        setOfficeReady(true);
        // @ts-ignore
        const item = Office.context.mailbox.item;
        if (item) {
          setCurrentEmail({
            subject: item.subject,
            sender: item.from?.emailAddress || 'Unknown',
            id: item.itemId
          });
        }
      }
    });
  }, []);

  const tabs: { id: TabType; icon: any; label: string }[] = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Command' },
    { id: 'Inbox', icon: Inbox, label: 'Triage' },
    { id: 'Pipeline', icon: ArrowRightLeft, label: 'Pipeline' },
    { id: 'Reminders', icon: Bell, label: 'Alerts' },
    { id: 'Settings', icon: SettingsIcon, label: 'Config' },
  ];

  return (
    <div className={`min-h-screen bg-[#F4F5F7] text-[#1A1C1E] font-sans ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-[#E1E3E5] px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#005FB8] rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">FlowGuard</h1>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Enterprise IT Sales</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsRtl(!isRtl)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100"
              title="Toggle RTL"
            >
              <Globe className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation - Modern Rail */}
      <nav className="bg-white border-b border-[#E1E3E5] flex overflow-x-auto no-scrollbar sticky top-[53px] z-20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-2.5 px-3 transition-all min-w-[70px] relative ${
              activeTab === tab.id 
                ? 'text-[#005FB8]' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className={`w-4 h-4 mb-1 transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`} />
            <span className="text-[9px] uppercase font-bold tracking-wider">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005FB8]"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="p-3 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {activeTab === 'Dashboard' && <Dashboard setActiveTab={setActiveTab} currentEmail={currentEmail} />}
            {activeTab === 'Inbox' && <InboxTriage currentEmail={currentEmail} />}
            {activeTab === 'Pipeline' && <Pipeline />}
            {activeTab === 'Reminders' && <Reminders />}
            {activeTab === 'Settings' && <SettingsPanel isRtl={isRtl} setIsRtl={setIsRtl} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Contextual Footer */}
      {currentEmail && activeTab !== 'Pipeline' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-slate-500" />
            </div>
            <div className="truncate">
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">Current Context</p>
              <p className="text-xs font-bold truncate text-slate-800">{currentEmail.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Quote?</span>
              <button 
                onClick={() => setIsQuoteReply(!isQuoteReply)}
                className={`w-7 h-4 rounded-full transition-colors relative ${isQuoteReply ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isQuoteReply ? 'right-0.5' : 'left-0.5'}`}></div>
              </button>
            </div>
            <button 
              onClick={() => setActiveTab('Pipeline')}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Add Deal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
