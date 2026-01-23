import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { storage } from '../lib/storage';

export default function CompleteOrderModal({ order, onClose }) {
    const [techName, setTechName] = useState('');

    if (!order) return null;

    const handleCompleteOrder = async () => {
        if (!techName.trim()) return;

        try {
            await storage.updateOrder(order.id, {
                status: 'completed',
                technician: techName,
                completedAt: new Date().toISOString()
            });
            onClose();
        } catch (err) {
            console.error("Error completing order:", err);
            alert("Erro ao finalizar ordem.");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className="p-6 text-center border-b">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold">Finalizar Atendimento</h2>
                    <p className="text-slate-500 text-sm">Cliente: {order.customer}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-3 border border-amber-100">
                        <AlertCircle className="text-amber-600 shrink-0" size={20} />
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                            Atenção: A identificação do técnico é obrigatória para encerrar a ordem de serviço.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Técnico Responsável</label>
                        <input
                            autoFocus
                            required
                            placeholder="Digite seu nome completo"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
                            value={techName}
                            onChange={e => setTechName(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={!techName.trim()}
                            onClick={handleCompleteOrder}
                            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200"
                        >
                            Confirmar Conclusão
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
