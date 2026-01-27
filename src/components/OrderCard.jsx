import React, { useState, useEffect } from 'react';
import { Clock, Check, User, Calendar, FileText, CheckCircle2, Edit2, Trash2, Package } from 'lucide-react';
import { storage } from '../lib/storage';

export default function OrderCard({ os, onCompleteClick, onEditClick, onDeleteClick, permissions, userRole }) {
    const { canEdit, canDelete, canComplete } = permissions;
    const [usedItems, setUsedItems] = useState([]);

    useEffect(() => {
        if (os.status === 'completed') {
            fetchUsedItems();
        }
    }, [os.status, os.id]);

    const fetchUsedItems = async () => {
        try {
            const items = await storage.getOrderItems(os.id);
            setUsedItems(items);
        } catch (error) {
            console.error("Erro ao carregar itens da OS:", error);
        }
    };

    return (
        <div className="relative group">
            {/* Timeline Dot */}
            <div className={`absolute -left-12 top-0 w-8 h-8 rounded-full border-4 border-slate-100 flex items-center justify-center transition-colors shadow-sm
        ${os.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-orange-600 text-white'}`}>
                {os.status === 'completed' ? <Check size={16} /> : <Clock size={16} />}
            </div>

            {/* Card */}
            <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md
        ${os.status === 'completed' ? 'border-emerald-100 opacity-80' : 'border-slate-200'}`}>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                ${os.serviceType === 'Instalação' ? 'bg-orange-100 text-orange-700' :
                                    (os.serviceType === 'Reparo' || os.serviceType === 'Suporte') ? 'bg-orange-100 text-orange-700' :
                                        os.serviceType === 'Pagamento' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-purple-100 text-purple-700'}`}>
                                {os.serviceType}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">#{os.id?.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">{os.customer}</h3>
                            <div className="flex items-center gap-1">
                                {os.status === 'pending' && canEdit && (
                                    <button
                                        onClick={() => onEditClick(os)}
                                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                        title="Editar OS"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                )}
                                {canDelete && (os.status !== 'completed' || userRole === 'admin') && (
                                    <button
                                        onClick={() => onDeleteClick(os.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir OS"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                            <User size={14} className="shrink-0" /> {os.address}
                        </p>
                    </div>

                    <div className="flex flex-col items-end text-right">
                        <div className="flex items-center gap-2 text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded-lg">
                            <Calendar size={14} />
                            <span>{new Date(os.scheduledDate).toLocaleDateString('pt-BR')}</span>
                            <Clock size={14} className="ml-1" />
                            <span>{os.scheduledTime}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-100 rounded-lg p-3 mb-4 text-sm text-slate-700 border border-slate-100">
                    <p className="font-medium mb-1 flex items-center gap-1"><FileText size={14} /> Descrição:</p>
                    {os.description}
                </div>

                {os.status === 'pending' ? (
                    canComplete && (
                        <button
                            onClick={() => onCompleteClick(os)}
                            className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <CheckCircle2 size={18} />
                            Finalizar Atendimento
                        </button>
                    )
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 border-t pt-4">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-400">Técnico:</span>
                                <span className="font-bold text-emerald-700 flex items-center gap-1">
                                    <User size={14} /> {os.technician}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-400">Concluído em:</span>
                                <span className="font-medium text-slate-600">
                                    {new Date(os.completedAt).toLocaleString('pt-BR')}
                                </span>
                            </div>
                        </div>

                        {usedItems.length > 0 && (
                            <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                                <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 flex items-center gap-1">
                                    <Package size={12} /> Materiais Utilizados
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {usedItems.map((item, idx) => (
                                        <div key={idx} className="bg-white px-2 py-1 rounded-lg border border-emerald-200 text-xs flex flex-col">
                                            <span className="font-bold text-slate-700">{item.inventory?.name}</span>
                                            <span className="text-[10px] text-slate-500">
                                                Qtd: {item.quantity} {item.inventory?.unit}
                                                {item.serial_number && ` • SN: ${item.serial_number}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
