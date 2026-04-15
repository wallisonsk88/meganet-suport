import React from 'react';

export default function StatsBar({ orders }) {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;

    return (
        <div className="flex gap-2">
            <div className="flex-1 bg-orange-900/20 px-4 py-3 rounded-xl border border-orange-900/30 flex items-center gap-3">
                <div className="text-orange-500 font-bold text-xl">{pendingCount}</div>
                <div className="text-xs text-orange-400 leading-tight uppercase font-bold">Pendentes</div>
            </div>
            <div className="flex-1 bg-emerald-900/20 px-4 py-3 rounded-xl border border-emerald-900/30 flex items-center gap-3">
                <div className="text-emerald-500 font-bold text-xl">{completedCount}</div>
                <div className="text-xs text-emerald-400 leading-tight uppercase font-bold">Concluídas</div>
            </div>
        </div>
    );
}
