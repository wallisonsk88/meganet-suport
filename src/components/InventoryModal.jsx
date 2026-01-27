import React, { useState, useEffect } from 'react';
import { Package, X, Plus, Trash2, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { storage } from '../lib/storage';

export default function InventoryModal({ isOpen, onClose, user }) {
    const isAdmin = user?.role === 'admin';
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Equipamento',
        description: '',
        unit: 'unid',
        currentStock: 0,
        minStock: 5
    });

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const data = await storage.getInventory();
            setInventory(data);
        } catch (err) {
            console.error("Erro ao carregar estoque:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchInventory();
        }

        const handleUpdate = () => fetchInventory();
        window.addEventListener('inventory-update', handleUpdate);
        return () => window.removeEventListener('inventory-update', handleUpdate);
    }, [isOpen]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;
        try {
            await storage.addInventoryItem(newItem);
            setIsAdding(false);
            setNewItem({
                name: '',
                category: 'Equipamento',
                description: '',
                unit: 'unid',
                currentStock: 0,
                minStock: 5
            });
        } catch (err) {
            console.error(err);
            alert("Erro ao adicionar item");
        }
    };

    const handleUpdateStock = async (id, currentStock, delta) => {
        if (!isAdmin) return;
        try {
            await storage.updateInventoryItem(id, { current_stock: currentStock + delta });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!isAdmin) return;
        if (window.confirm("Deseja realmente remover este item do catálogo?")) {
            try {
                await storage.deleteInventoryItem(id);
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                            <Package size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Controle de Estoque</h2>
                            <p className="text-xs text-slate-500 font-medium">Gestão de materiais e equipamentos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button
                                onClick={() => setIsAdding(!isAdding)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all"
                            >
                                <Plus size={18} />
                                Novo Item
                            </button>
                        )}
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {/* Add Form */}
                    {isAdding && isAdmin && (
                        <form onSubmit={handleAddItem} className="mb-8 bg-orange-50 p-6 rounded-2xl border border-orange-100 animate-in slide-in-from-top-4 duration-200">
                            <h3 className="text-sm font-bold text-orange-800 mb-4 uppercase tracking-wider">Cadastrar Novo Produto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Nome do Item</label>
                                    <input
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Ex: ONU Huawei EG8145V5"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Categoria</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        <option>Equipamento</option>
                                        <option>Material</option>
                                        <option>Ferramenta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Unidade</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                        value={newItem.unit}
                                        onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                    >
                                        <option value="unid">Unidade (peça)</option>
                                        <option value="metros">Metros</option>
                                        <option value="kits">Kits</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Qtd Inicial</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={newItem.currentStock}
                                        onChange={e => setNewItem({ ...newItem, currentStock: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Estoque Mínimo</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={newItem.minStock}
                                        onChange={e => setNewItem({ ...newItem, minStock: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button>
                                <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-bold">Salvar Item</button>
                            </div>
                        </form>
                    )}

                    {/* Table */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-hidden border border-slate-200 rounded-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Item / Descrição</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Referência</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {inventory.map((item) => {
                                        const isLow = item.current_stock <= item.min_stock;
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-800">{item.name}</p>
                                                    <p className="text-xs text-slate-400">{item.category}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-xl font-black ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                                                            {item.current_stock}
                                                        </span>
                                                        <span className="text-[10px] uppercase font-bold text-slate-400">{item.unit}</span>
                                                        {isLow && (
                                                            <span className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase mt-1">
                                                                <AlertTriangle size={10} /> Estoque Baixo
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <p className="text-xs font-bold text-slate-500 italic">Mín: {item.min_stock}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isAdmin ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateStock(item.id, item.current_stock, 1)}
                                                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                                    title="Adicionar 1"
                                                                >
                                                                    <ArrowUpRight size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStock(item.id, item.current_stock, -1)}
                                                                    className="p-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                                                                    title="Remover 1"
                                                                >
                                                                    <ArrowDownRight size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                    className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ml-2"
                                                                    title="Excluir Item"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Somente Leitura</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
