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
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Deal, Settings, EmailItem, TabType } from './types';

// Components
import InboxTriage from './components/InboxTriage';
import Pipeline from './components/Pipeline';
import Reminders from './components/Reminders';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('Inbox');
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
    { id: 'Inbox', icon: Inbox, label: 'Inbox' },
    { id: 'Pipeline', icon: LayoutDashboard, label: 'Pipeline' },
    { id: 'Reminders', icon: Bell, label: 'Reminders' },
    { id: 'Settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className={`min-h-screen bg-[#F8F9FA] text-[#1A1C1E] font-sans ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-[#E1E3E5] px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#005FB8] rounded-lg flex items-center justify-center text-white font-bold">
              FG
            </div>
            <h1 className="text-lg font-semibold tracking-tight">FlowGuard</h1>
          </div>
          <button 
            onClick={() => setIsRtl(!isRtl)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Toggle RTL"
          >
            <Globe className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-[#E1E3E5] flex overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 px-4 border-b-2 transition-all min-w-[80px] ${
              activeTab === tab.id 
                ? 'border-[#005FB8] text-[#005FB8]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] uppercase font-bold tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="p-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Inbox' && <InboxTriage currentEmail={currentEmail} />}
            {activeTab === 'Pipeline' && <Pipeline />}
            {activeTab === 'Reminders' && <Reminders />}
            {activeTab === 'Settings' && <SettingsPanel isRtl={isRtl} setIsRtl={setIsRtl} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Contextual Footer (Mobile-friendly) */}
      {currentEmail && activeTab !== 'Pipeline' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E1E3E5] p-3 flex items-center justify-between shadow-lg z-20">
          <div className="flex items-center gap-2 overflow-hidden">
            <ShieldCheck className="w-5 h-5 text-[#005FB8] flex-shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Active Context</p>
              <p className="text-xs font-medium truncate">{currentEmail.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Quote?</span>
              <button 
                onClick={() => setIsQuoteReply(!isQuoteReply)}
                className={`w-8 h-4 rounded-full transition-colors relative ${isQuoteReply ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isQuoteReply ? 'right-0.5' : 'left-0.5'}`}></div>
              </button>
            </label>
            <button 
              onClick={() => setActiveTab('Pipeline')}
              className="bg-[#005FB8] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#004a8f] transition-colors whitespace-nowrap"
            >
              Add to Deal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
