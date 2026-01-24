import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2 } from 'lucide-react';
import { storage } from '../lib/storage';

export default function OrderFormModal({ user, isOpen, onClose, editOrder = null }) {
    const [orderData, setOrderData] = useState({
        customer: '',
        address: '',
        serviceType: 'Instalação',
        description: '',
        scheduledDate: '',
        scheduledTime: ''
    });

    useEffect(() => {
        if (editOrder) {
            setOrderData({
                customer: editOrder.customer || '',
                address: editOrder.address || '',
                serviceType: editOrder.serviceType || 'Instalação',
                description: editOrder.description || '',
                scheduledDate: editOrder.scheduledDate || '',
                scheduledTime: editOrder.scheduledTime || ''
            });
        } else {
            setOrderData({
                customer: '',
                address: '',
                serviceType: 'Instalação',
                description: '',
                scheduledDate: '',
                scheduledTime: ''
            });
        }
    }, [editOrder, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editOrder) {
                await storage.updateOrder(editOrder.id, {
                    ...orderData
                });
            } else {
                await storage.addOrder({
                    ...orderData,
                    status: 'pending',
                    createdBy: user?.name || 'local-user'
                });
            }

            onClose();
        } catch (err) {
            console.error("Error saving order:", err);
            alert("Erro ao salvar ordem. Verifique o console.");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {editOrder ? <Edit2 className="text-orange-600" /> : <Plus className="text-orange-600" />}
                        {editOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Cliente</label>
                            <input
                                required
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                value={orderData.customer}
                                onChange={e => setOrderData({ ...orderData, customer: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Endereço Completo</label>
                            <input
                                required
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                value={orderData.address}
                                onChange={e => setOrderData({ ...orderData, address: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Serviço</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                    value={orderData.serviceType}
                                    onChange={e => setOrderData({ ...orderData, serviceType: e.target.value })}
                                >
                                    <option>Instalação</option>
                                    <option>Suporte</option>
                                    <option>Pagamento</option>
                                    <option>Mudança de Endereço</option>
                                    <option>Troca de Equipamento</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Prioridade/Hora</label>
                                <input
                                    type="time"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={orderData.scheduledTime}
                                    onChange={e => setOrderData({ ...orderData, scheduledTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Data Agendada</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                value={orderData.scheduledDate}
                                onChange={e => setOrderData({ ...orderData, scheduledDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Detalhes do Serviço</label>
                            <textarea
                                rows="3"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                value={orderData.description}
                                onChange={e => setOrderData({ ...orderData, description: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200 mt-2"
                    >
                        {editOrder ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
                    </button>
                </form>
            </div>
        </div>
    );
}
