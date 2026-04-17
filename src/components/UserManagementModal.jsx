import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Users, Key } from 'lucide-react';
import { storage } from '../lib/storage';

export default function UserManagementModal({ isOpen, onClose }) {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', role: 'tecnico', password: '' });

    const refreshUsers = async () => {
        const data = await storage.getUsers();
        setUsers(data);
    };

    useEffect(() => {
        if (isOpen) {
            refreshUsers();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUser.name.trim() || !newUser.password.trim()) {
            alert("Nome e senha são obrigatórios.");
            return;
        }

        try {
            const userToSave = {
                ...newUser,
                name: newUser.name.trim(),
                password: newUser.password.trim()
            };
            await storage.addUser(userToSave);
            await refreshUsers();
            setNewUser({ name: '', role: 'tecnico', password: '' });
        } catch (err) {
            console.error("Error adding user:", err);
            alert("Erro ao adicionar usuário.");
        }
    };

    const handleDeleteUser = async (id) => {
        if (users.length <= 1) {
            alert("Não é possível remover o último usuário.");
            return;
        }
        if (window.confirm('Excluir este usuário permanentemente?')) {
            try {
                await storage.deleteUser(id);
                await refreshUsers();
            } catch (err) {
                console.error("Error deleting user:", err);
                alert("Erro ao excluir usuário.");
            }
        }
    };

    const getRoleLabel = (role) => {
        const roles = {
            admin: 'Administrador',
            recepcao: 'Recepção',
            tecnico: 'Técnico'
        };
        return roles[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            admin: 'bg-red-100 text-red-700',
            recepcao: 'bg-orange-100 text-orange-700',
            tecnico: 'bg-emerald-100 text-emerald-700'
        };
        return colors[role] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex items-center justify-between bg-slate-100">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="text-orange-600" /> Gestão de Equipe
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Add User Form */}
                    <form onSubmit={handleAddUser} className="bg-slate-100 p-4 rounded-2xl border border-slate-200 space-y-3">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <UserPlus size={16} /> Novo Membro
                        </h3>
                        <div className="space-y-3">
                            <input
                                required
                                placeholder="Nome de Usuário (ex: wallison)"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                            />
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input
                                    required
                                    type="password"
                                    placeholder="Senha de Acesso"
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="recepcao">Recepção</option>
                                    <option value="tecnico">Técnico</option>
                                </select>
                                <button
                                    type="submit"
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-bold transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* User List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-700">Equipe Cadastrada</h3>
                        <div className="space-y-2">
                            {users.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm leading-tight">{user.name}</p>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-100 border-t">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-slate-600 font-bold hover:text-slate-800 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
