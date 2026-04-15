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

    const getServiceTypeStyles = (type) => {
        switch (type) {
            case 'Instalação':
                return {
                    borderLeft: 'border-l-[6px] border-l-blue-500',
                    chip: 'bg-blue-100 text-blue-700 border-blue-200',
                    dotPending: 'bg-blue-500'
                };
            case 'Suporte':
                return {
                    borderLeft: 'border-l-[6px] border-l-orange-500',
                    chip: 'bg-orange-100 text-orange-700 border-orange-200',
                    dotPending: 'bg-orange-500'
                };
            case 'Pagamento':
                return {
                    borderLeft: 'border-l-[6px] border-l-emerald-500',
                    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    dotPending: 'bg-emerald-500'
                };
            case 'Mudança de Endereço':
                return {
                    borderLeft: 'border-l-[6px] border-l-purple-500',
                    chip: 'bg-purple-100 text-purple-700 border-purple-200',
                    dotPending: 'bg-purple-500'
                };
            case 'Troca de Equipamento':
                return {
                    borderLeft: 'border-l-[6px] border-l-rose-500',
                    chip: 'bg-rose-100 text-rose-700 border-rose-200',
                    dotPending: 'bg-rose-500'
                };
            default:
                return {
                    borderLeft: 'border-l-[6px] border-l-slate-500',
                    chip: 'bg-slate-100 text-slate-700 border-slate-200',
                    dotPending: 'bg-slate-500'
                };
        }
    };

    const serviceStyle = getServiceTypeStyles(os.serviceType);

    return (
        <div className="relative group min-w-[300px]">
            {/* Card */}
            <div className={`bg-slate-900 rounded-2xl p-5 shadow-lg shadow-black/20 border transition-all hover:shadow-xl hover:shadow-black/30 ${serviceStyle.borderLeft}
        ${os.status === 'completed' ? 'border-y-emerald-900/30 border-r-emerald-900/30 opacity-80' : 'border-y-slate-800 border-r-slate-800'}`}>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2 border-transparent">
                            
                            {/* Status Icon */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white
                                ${os.status === 'completed' ? 'bg-emerald-500' : serviceStyle.dotPending}`} title={os.status === 'completed' ? 'Concluída' : 'Pendente'}>
                                {os.status === 'completed' ? <Check size={12} /> : <Clock size={12} />}
                            </div>

                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${serviceStyle.chip}`}>
                                {os.serviceType}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border
                ${os.priority === 'Baixa' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                                    os.priority === 'Alta' ? 'bg-orange-900/30 text-orange-400 border-orange-900/50' :
                                        os.priority === 'Urgente' ? 'bg-red-900 border-red-700 text-white animate-pulse' :
                                            'bg-blue-900/30 text-blue-400 border-blue-900/50'}`}>
                                {os.priority || 'Média'}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">#{os.id?.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-100">{os.customer}</h3>
                            <div className="flex items-center gap-1">
                                {os.status === 'pending' && canEdit && (
                                    <button
                                        onClick={() => onEditClick(os)}
                                        className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-orange-900/30 rounded-lg transition-colors"
                                        title="Editar OS"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                )}
                                {canDelete && (os.status !== 'completed' || userRole === 'admin') && (
                                    <button
                                        onClick={() => onDeleteClick(os.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Excluir OS"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                            <User size={14} className="shrink-0" /> {os.address}
                        </p>
                    </div>

                    <div className="flex flex-col items-end text-right">
                        <div className="flex items-center gap-2 text-slate-300 font-semibold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                            <Calendar size={14} />
                            <span>{new Date(os.scheduledDate).toLocaleDateString('pt-BR')}</span>
                            <Clock size={14} className="ml-1" />
                            <span>{os.scheduledTime}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-3 mb-4 text-sm text-slate-300 border border-slate-700">
                    <p className="font-medium mb-1 flex items-center gap-1 text-slate-400"><FileText size={14} /> Descrição:</p>
                    {os.description}
                </div>

                {os.status === 'pending' ? (
                    canComplete && (
                        <button
                            onClick={() => onCompleteClick(os)}
                            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <CheckCircle2 size={18} />
                            Finalizar Atendimento
                        </button>
                    )
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-y-2 border-t border-slate-800 pt-4">
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-500">Técnico:</span>
                                    <span className="font-bold text-emerald-500 flex items-center gap-1">
                                        <User size={14} /> {os.technician}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-500">Concluído em:</span>
                                    <span className="font-medium text-slate-400">
                                        {new Date(os.completedAt).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            {userRole === 'admin' && (
                                <button
                                    onClick={async () => {
                                        if (window.confirm("Deseja realmente REABRIR esta ordem? Ela voltará para a lista de pendentes.")) {
                                            try {
                                                await storage.reopenOrder(os.id);
                                            } catch (err) {
                                                alert("Erro ao reabrir: " + err.message);
                                            }
                                        }
                                    }}
                                    className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 bg-orange-900/20 px-3 py-1.5 rounded-lg transition-colors border border-orange-900/30"
                                >
                                    <Clock size={14} /> Reabrir OS
                                </button>
                            )}
                        </div>

                        {usedItems.length > 0 && (
                            <div className="bg-emerald-900/10 rounded-xl p-3 border border-emerald-900/30">
                                <p className="text-[10px] font-black uppercase text-emerald-500 mb-2 flex items-center gap-1">
                                    <Package size={12} /> Materiais Utilizados
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {usedItems.map((item, idx) => (
                                        <div key={idx} className="bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs flex flex-col">
                                            <span className="font-bold text-slate-200">{item.inventory?.name}</span>
                                            <span className="text-[10px] text-slate-400">
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
