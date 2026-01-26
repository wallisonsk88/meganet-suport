import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { storage } from '../lib/storage';

export default function CompleteOrderModal({ order, user, onClose }) {
    if (!order) return null;

    const handleCompleteOrder = async () => {
        try {
            await storage.updateOrder(order.id, {
                status: 'completed',
                technician: user?.name || 'Técnico',
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
                    <h2 className="text-xl font-bold">Confirmação</h2>
                    <p className="text-slate-500 text-sm mt-1">Deseja realmente finalizar este atendimento?</p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-600 mb-1">Cliente</p>
                        <p className="font-semibold text-slate-900">{order.customer}</p>

                        <div className="my-3 border-t border-slate-200"></div>

                        <p className="text-sm text-slate-600 mb-1">Técnico Responsável</p>
                        <p className="font-semibold text-emerald-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {user?.name || 'Não identificado'}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCompleteOrder}
                            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
