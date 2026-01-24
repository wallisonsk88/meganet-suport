import React, { useMemo } from 'react';
import { X, BarChart2, CheckCircle2, Package, Wrench, CreditCard, MapPin, Layers } from 'lucide-react';

export default function AdminReportsModal({ isOpen, onClose, orders }) {
    const stats = useMemo(() => {
        const completed = orders.filter(o => o.status === 'completed');

        const counts = {
            'Instalação': 0,
            'Suporte': 0,
            'Pagamento': 0,
            'Mudança de Endereço': 0,
            'Troca de Equipamento': 0,
            'Outros': 0
        };

        completed.forEach(order => {
            if (counts[order.serviceType] !== undefined) {
                counts[order.serviceType]++;
            } else {
                counts['Outros']++;
            }
        });

        return {
            total: completed.length,
            byType: Object.entries(counts).filter(([_, count]) => count > 0)
        };
    }, [orders]);

    if (!isOpen) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'Instalação': return <Package size={18} className="text-orange-500" />;
            case 'Suporte': return <Wrench size={18} className="text-blue-500" />;
            case 'Pagamento': return <CreditCard size={18} className="text-emerald-500" />;
            case 'Mudança de Endereço': return <MapPin size={18} className="text-purple-500" />;
            case 'Troca de Equipamento': return <Layers size={18} className="text-slate-500" />;
            default: return <CheckCircle2 size={18} className="text-slate-400" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <BarChart2 className="text-orange-600" />
                        Relatório Geral (Concluídos)
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    {stats.total === 0 ? (
                        <div className="text-center py-12">
                            <BarChart2 size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-500 font-medium">Nenhum dado disponível ainda.</p>
                            <p className="text-slate-400 text-sm mt-1">As ordens de serviço concluídas aparecerão aqui.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Hero Stat */}
                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center">
                                <p className="text-orange-600 text-sm font-bold uppercase tracking-wider mb-1">Total de Atendimentos</p>
                                <p className="text-5xl font-black text-orange-900">{stats.total}</p>
                            </div>

                            {/* Breakdown List */}
                            <div className="space-y-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Distribuição por Serviço</p>
                                {stats.byType.map(([type, count]) => (
                                    <div key={type} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-orange-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                {getIcon(type)}
                                            </div>
                                            <span className="font-bold text-slate-700">{type}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black text-slate-900">{count}</span>
                                            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-orange-500 h-full rounded-full"
                                                    style={{ width: `${(count / stats.total) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 mt-8"
                    >
                        Fechar Relatório
                    </button>
                </div>
            </div>
        </div>
    );
}
