import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, DollarSign, Clock, User, ChevronRight, ArrowRightLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { Deal } from '../types';

const STAGES = [
  { id: 'new', label: 'New Inquiry', color: 'bg-blue-500' },
  { id: 'sent', label: 'Quote Sent', color: 'bg-purple-500' },
  { id: 'waiting', label: 'Waiting', color: 'bg-orange-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-gray-500' }
];

export default function Pipeline() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFinished, setShowFinished] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/deals');
      const data = await res.json();
      setDeals(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const updateDealStage = async (id: number, newStage: string) => {
    try {
      await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      fetchDeals();
    } catch (e) {
      console.error(e);
    }
  };

  const markDealFinished = async (id: number, finished: boolean) => {
    try {
      await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_finished: finished ? 1 : 0 })
      });
      fetchDeals();
    } catch (e) {
      console.error(e);
    }
  };

  const getDealsByStage = (stage: string) => 
    deals.filter(d => d.stage === stage && (showFinished || !d.is_finished));

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Pipeline Board
          </h2>
          <button 
            onClick={() => setShowFinished(!showFinished)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
              showFinished ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}
          >
            {showFinished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showFinished ? 'All Deals' : 'Active Only'}
          </button>
        </div>
        <button className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Metrics Summary - Modern Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">Total Pipeline Value</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            ${(deals.reduce((acc, d) => acc + d.value, 0) / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">Active Opportunities</p>
          <p className="text-3xl font-black text-blue-600 tracking-tight">
            {deals.filter(d => d.stage !== 'won' && d.stage !== 'lost' && !d.is_finished).length}
          </p>
        </div>
      </div>

      {/* Kanban View - Vertical Scrollable Stages */}
      <div className="space-y-12">
        {STAGES.map((stage) => (
          <div key={stage.id} className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${stage.color} shadow-lg shadow-${stage.color.split('-')[1]}-200`}></div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">
                  {stage.label}
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black">
                  {getDealsByStage(stage.id).length}
                </span>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sm:-mx-8 sm:px-8">
              {getDealsByStage(stage.id).length === 0 ? (
                <div className="min-w-[280px] h-40 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-[10px] text-slate-300 uppercase font-black tracking-[0.2em] gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  No Deals in {stage.label.split(' ')[0]}
                </div>
              ) : (
                getDealsByStage(stage.id).map((deal) => (
                  <motion.div 
                    key={deal.id}
                    layoutId={deal.id.toString()}
                    className={`min-w-[300px] bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${deal.is_finished ? 'opacity-60' : ''}`}
                  >
                    {deal.is_finished && (
                      <div className="absolute top-0 right-0 p-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <h4 className={`text-base font-black truncate pr-8 tracking-tight ${deal.is_finished ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {deal.customer_name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{deal.subject.slice(0, 30)}...</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-1.5 text-slate-900 font-black text-lg tracking-tight">
                        <span className="text-slate-400 text-sm">$</span>
                        {deal.value.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(deal.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        {STAGES.filter(s => s.id !== stage.id).slice(0, 2).map(s => (
                          <button 
                            key={s.id}
                            onClick={() => updateDealStage(deal.id, s.id)}
                            className="py-3 bg-slate-50 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                          >
                            {s.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => markDealFinished(deal.id, !deal.is_finished)}
                        className={`p-3 rounded-2xl transition-all shadow-sm ${deal.is_finished ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'}`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
