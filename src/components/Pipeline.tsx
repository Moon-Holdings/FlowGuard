import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, DollarSign, Clock, User, ChevronRight, ArrowRightLeft } from 'lucide-react';
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

  const getDealsByStage = (stage: string) => deals.filter(d => d.stage === stage);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <ArrowRightLeft className="w-3.5 h-3.5" /> Pipeline Board
        </h2>
        <button className="p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Pipeline</p>
          <p className="text-xl font-black text-slate-900">
            ${(deals.reduce((acc, d) => acc + d.value, 0) / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Active Deals</p>
          <p className="text-xl font-black text-blue-600">
            {deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length}
          </p>
        </div>
      </div>

      {/* Kanban View */}
      <div className="space-y-8">
        {STAGES.map((stage) => (
          <div key={stage.id} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {stage.label}
                </h3>
                <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                  {getDealsByStage(stage.id).length}
                </span>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
              {getDealsByStage(stage.id).length === 0 ? (
                <div className="min-w-[200px] h-28 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center text-[10px] text-slate-300 uppercase font-black tracking-widest">
                  Empty Stage
                </div>
              ) : (
                getDealsByStage(stage.id).map((deal) => (
                  <motion.div 
                    key={deal.id}
                    layoutId={deal.id.toString()}
                    className="min-w-[260px] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-bold text-slate-900 truncate pr-2">{deal.customer_name}</h4>
                      <button className="text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-[11px] text-slate-400 mb-5 line-clamp-1 font-medium">{deal.subject}</p>
                    
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-1 text-slate-900 font-black text-sm">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        {deal.value.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-[9px] font-bold uppercase tracking-tight">
                        <Clock className="w-3 h-3" />
                        {new Date(deal.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {STAGES.filter(s => s.id !== stage.id).slice(0, 2).map(s => (
                        <button 
                          key={s.id}
                          onClick={() => updateDealStage(deal.id, s.id)}
                          className="py-2 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {s.label.split(' ')[0]}
                        </button>
                      ))}
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
