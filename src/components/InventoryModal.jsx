import React, { useState, useEffect } from 'react';
import { Package, X, Plus, Trash2, AlertTriangle, ArrowUpRight, ArrowDownRight, History, Image as ImageIcon } from 'lucide-react';
import { storage } from '../lib/storage';

export default function InventoryModal({ isOpen, onClose, user }) {
    const isAdmin = user?.role === 'admin';
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'history'
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Equipamento',
        description: '',
        unit: 'unid',
        currentStock: 0,
        minStock: 5,
        imageUrl: ''
    });

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const data = await storage.getInventory();
            setInventory(data);
            if (viewMode === 'history') {
                const logs = await storage.getInventoryLogs();
                setHistory(logs);
            }
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
    }, [isOpen, viewMode]);

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
                minStock: 5,
                imageUrl: ''
            });
        } catch (err) {
            console.error(err);
            alert("Erro ao adicionar item");
        }
    };

    const handleUpdateStock = async (id, currentStock, delta) => {
        if (!isAdmin) return;
        try {
            await storage.updateInventoryItem(id, { currentStock: currentStock + delta }, user?.name);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDirectUpdateStock = async (id, newStock) => {
        if (!isAdmin) return;
        try {
            await storage.updateInventoryItem(id, { currentStock: newStock }, user?.name);
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

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                                <Package size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Estoque Meganet</h2>
                                <p className="text-xs text-slate-500 font-medium">Controle e Auditoria</p>
                            </div>
                        </div>

                        {/* View Switcher */}
                        <div className="flex bg-slate-200 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Catálogo
                            </button>
                            <button
                                onClick={() => setViewMode('history')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <div className="flex items-center gap-1">
                                    <History size={14} /> Histórico
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdmin && viewMode === 'list' && (
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
                    {viewMode === 'list' ? (
                        <>
                            {/* Search Bar */}
                            <div className="mb-6 relative">
                                <input
                                    type="text"
                                    placeholder="Pesquisar item no estoque..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <Package className="absolute left-3 top-3 text-slate-400" size={18} />
                            </div>

                            {/* Add Form */}
                            {isAdding && isAdmin && (
                                <form onSubmit={handleAddItem} className="mb-8 bg-orange-50 p-6 rounded-2xl border border-orange-100 animate-in slide-in-from-top-4 duration-200">
                                    <h3 className="text-sm font-bold text-orange-800 mb-4 uppercase tracking-wider">Cadastrar Novo Produto</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 mb-1">URL da Imagem</label>
                                            <input
                                                className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                                placeholder="https://exemplo.com/foto.jpg"
                                                value={newItem.imageUrl}
                                                onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
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
                                                <option value="unid">Unid</option>
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
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Mínimo</label>
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
                                        <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md">Salvar no Catálogo</button>
                                    </div>
                                </form>
                            )}

                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                </div>
                            ) : (
                                <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estoque Atual</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Referência</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredInventory.map((item) => {
                                                const isLow = item.current_stock <= item.min_stock;
                                                return (
                                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                                    {item.image_url ? (
                                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <ImageIcon className="text-slate-300" size={20} />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 leading-tight">{item.name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.category}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col items-center">
                                                                {isAdmin ? (
                                                                    <input
                                                                        type="number"
                                                                        defaultValue={item.current_stock}
                                                                        onBlur={async (e) => {
                                                                            const val = parseInt(e.target.value);
                                                                            if (!isNaN(val) && val !== item.current_stock) {
                                                                                await handleDirectUpdateStock(item.id, val);
                                                                            }
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.target.blur();
                                                                            }
                                                                        }}
                                                                        className={`w-20 text-center text-xl font-black bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all ${isLow ? 'text-red-500 border-red-200' : 'text-slate-900 hover:border-slate-300'}`}
                                                                    />
                                                                ) : (
                                                                    <span className={`text-xl font-black ${isLow ? 'text-red-500' : 'text-slate-900'}`}>
                                                                        {item.current_stock}
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mt-1">{item.unit}</span>
                                                                {isLow && (
                                                                    <span className="text-[9px] font-black text-red-500 uppercase mt-1 animate-pulse">Estoque Crítico</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <p className="text-xs font-bold text-slate-500 bg-slate-100 py-1 rounded-lg">Mín: {item.min_stock}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {isAdmin ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleUpdateStock(item.id, item.current_stock, 1)}
                                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                                                                            title="Entrada (+1)"
                                                                        >
                                                                            <ArrowUpRight size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateStock(item.id, item.current_stock, -1)}
                                                                            className="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
                                                                            title="Saída (-1)"
                                                                        >
                                                                            <ArrowDownRight size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteItem(item.id)}
                                                                            className="p-2 bg-slate-50 text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                            title="Excluir do Catálogo"
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400 font-bold uppercase px-2 py-1 bg-slate-50 rounded-lg">Leitura</span>
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
                        </>
                    ) : (
                        /* History Mode */
                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    <History size={48} className="mx-auto mb-2 opacity-20" />
                                    <p className="font-bold">Nenhuma movimentação registrada.</p>
                                    <p className="text-xs">As alterações começarão a aparecer aqui agora.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((log) => (
                                        <div key={log.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className={`p-2 rounded-xl shrink-0 ${log.type === 'entry' ? 'bg-emerald-100 text-emerald-600' :
                                                log.type === 'exit' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-slate-100 text-slate-600'}`}>
                                                {log.type === 'entry' ? <ArrowUpRight size={20} /> :
                                                    log.type === 'exit' ? <ArrowDownRight size={20} /> :
                                                        <ImageIcon size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-bold text-slate-800 text-sm">{log.inventory?.name}</p>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(log.created_at).toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-bold ${log.type === 'entry' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                                        {log.type === 'entry' ? '+' : '-'}{log.quantity}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 leading-none">|</span>
                                                    <span className="text-xs text-slate-500 italic">"{log.notes}"</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 border-l pl-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Responsável</p>
                                                <p className="font-bold text-slate-700 text-xs">{log.user_name || 'Sistema'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
