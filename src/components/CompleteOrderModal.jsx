import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Package, Plus, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';

export default function CompleteOrderModal({ order, user, onClose }) {
    const [inventory, setInventory] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]); // [{ inventoryId, quantity, serialNumber, name, unit }]
    const [isInventoryLoading, setIsInventoryLoading] = useState(false);

    useEffect(() => {
        if (order) {
            fetchInventory();
        }
    }, [order]);

    const fetchInventory = async () => {
        setIsInventoryLoading(true);
        try {
            console.log("Buscando inventário para usuário:", user?.name, "Role:", user?.role);
            const data = await storage.getInventory();
            console.log("Itens de inventário encontrados:", data?.length || 0);
            setInventory(data || []);
        } catch (error) {
            console.error("Erro crítico ao carregar inventário no Modal:", error);
        } finally {
            setIsInventoryLoading(false);
        }
    };

    const handleAddItem = (inventoryItem) => {
        const existing = selectedItems.find(i => i.inventoryId === inventoryItem.id);
        if (existing) {
            setSelectedItems(selectedItems.map(i =>
                i.inventoryId === inventoryItem.id ? { ...i, quantity: i.quantity + 1 } : i
            ));
        } else {
            setSelectedItems([...selectedItems, {
                inventoryId: inventoryItem.id,
                name: inventoryItem.name,
                unit: inventoryItem.unit,
                quantity: 1,
                serialNumber: ''
            }]);
        }
    };

    const handleRemoveItem = (inventoryId) => {
        setSelectedItems(selectedItems.filter(i => i.inventoryId !== inventoryId));
    };

    const handleUpdateQuantity = (id, val) => {
        setSelectedItems(selectedItems.map(i =>
            i.inventoryId === id ? { ...i, quantity: Math.max(1, parseInt(val) || 1) } : i
        ));
    };

    const handleUpdateSerial = (id, val) => {
        setSelectedItems(selectedItems.map(i =>
            i.inventoryId === id ? { ...i, serialNumber: val } : i
        ));
    };

    if (!order) return null;

    const handleCompleteOrder = async () => {
        try {
            // 1. Save items used and update stock
            if (selectedItems.length > 0) {
                await storage.addItemsToOrder(order.id, selectedItems);
            }

            // 2. Finalize order
            await storage.updateOrder(order.id, {
                status: 'completed',
                technician: user?.name || 'Técnico',
                completedAt: new Date().toISOString()
            });

            onClose();
            setSelectedItems([]);
        } catch (err) {
            console.error("Error completing order:", err);
            alert("Erro ao finalizar ordem: " + err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className="p-6 text-center border-b bg-slate-50">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Finalizar Atendimento</h2>
                    <p className="text-slate-500 text-xs">Confirme os detalhes e os materiais utilizados.</p>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Cliente</p>
                            <p className="font-bold text-slate-900 text-sm truncate">{order.customer}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Técnico</p>
                            <p className="font-bold text-emerald-700 text-sm">{user?.name}</p>
                        </div>
                    </div>

                    {/* Inventory Selection */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Package size={18} className="text-orange-600" />
                            Materiais e Equipamentos Usados
                        </h3>

                        {/* List of used items */}
                        <div className="space-y-2 mb-4">
                            {selectedItems.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    Nenhum material selecionado.
                                </p>
                            ) : (
                                selectedItems.map((item) => (
                                    <div key={item.inventoryId} className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-700">{item.name}</span>
                                            <button onClick={() => handleRemoveItem(item.inventoryId)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="Qtd"
                                                    className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateQuantity(item.inventoryId, e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-[3]">
                                                <input
                                                    type="text"
                                                    placeholder="Número de Série (opcional)"
                                                    className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
                                                    value={item.serialNumber}
                                                    onChange={(e) => handleUpdateSerial(item.inventoryId, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add items dropdown/list */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-4 py-2 text-[10px] font-black uppercase text-slate-500 border-b">
                                Adicionar Material do Estoque
                            </div>
                            <div className="max-h-32 overflow-auto divide-y divide-slate-100">
                                {isInventoryLoading ? (
                                    <div className="p-4 text-center text-xs text-slate-400">Carregando estoque...</div>
                                ) : inventory.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-400">Nenhum item encontrado no estoque.</div>
                                ) : (
                                    inventory.map((item) => (
                                        <div
                                            key={item.id}
                                            className="px-4 py-2 flex items-center justify-between hover:bg-orange-50 cursor-pointer transition-colors"
                                            onClick={() => handleAddItem(item)}
                                        >
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">{item.name}</p>
                                                <p className="text-[10px] text-slate-400">{item.current_stock} {item.unit} disponíveis</p>
                                            </div>
                                            <Plus size={16} className="text-orange-600" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl border border-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCompleteOrder}
                        className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
                    >
                        Finalizar e Baixar Estoque
                    </button>
                </div>
            </div>
        </div>
    );
}
