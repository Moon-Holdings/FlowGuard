import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, DollarSign, Clock, User, ChevronRight } from 'lucide-react';
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
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Pipeline Dashboard</h2>
        <button className="p-2 bg-[#005FB8] text-white rounded-lg shadow-sm hover:bg-[#004a8f] transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Value</p>
          <p className="text-lg font-bold text-[#005FB8]">
            ${deals.reduce((acc, d) => acc + d.value, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Active Deals</p>
          <p className="text-lg font-bold text-gray-900">
            {deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length}
          </p>
        </div>
      </div>

      {/* Kanban View (Simplified for Mobile Taskpane) */}
      <div className="space-y-8">
        {STAGES.map((stage) => (
          <div key={stage.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {stage.label}
                </h3>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                  {getDealsByStage(stage.id).length}
                </span>
              </div>
              <button className="text-[10px] text-[#005FB8] font-bold">View All</button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {getDealsByStage(stage.id).length === 0 ? (
                <div className="min-w-[200px] h-24 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-[10px] text-gray-300 uppercase font-bold">
                  No deals
                </div>
              ) : (
                getDealsByStage(stage.id).map((deal) => (
                  <motion.div 
                    key={deal.id}
                    layoutId={deal.id.toString()}
                    className="min-w-[240px] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-bold text-gray-900 truncate pr-2">{deal.customer_name}</h4>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-4 line-clamp-1">{deal.subject}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#005FB8] font-bold text-xs">
                        <DollarSign className="w-3 h-3" />
                        {deal.value.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                        <Clock className="w-3 h-3" />
                        {new Date(deal.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {STAGES.filter(s => s.id !== stage.id).slice(0, 2).map(s => (
                        <button 
                          key={s.id}
                          onClick={() => updateDealStage(deal.id, s.id)}
                          className="flex-1 py-1.5 border border-gray-100 rounded-lg text-[9px] font-bold uppercase text-gray-500 hover:bg-gray-50"
                        >
                          Move to {s.label.split(' ')[0]}
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
