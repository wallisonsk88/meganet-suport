import React from 'react';
import { Wifi, Plus, Settings, LogOut, BarChart2, User as UserIcon, Package, Map as MapIcon } from 'lucide-react';

export default function Header({ user, onLogout, onAddClick, onManageUsersClick, onReportsClick, onInventoryClick, onMapClick, canCreate, canManageUsers, canViewInventory, canViewMap }) {
    const getRoleLabel = (role) => {
        const roles = {
            admin: 'Admin',
            recepcao: 'Recepção',
            tecnico: 'Técnico'
        };
        return roles[role] || role;
    };

    return (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 shadow-sm font-sans">
            <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-600 p-2 rounded-lg text-white shadow-lg shadow-orange-900/50">
                            <Wifi size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-100 leading-none">MegaNet Suporte</h1>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-1">Gestão de Ordens de Serviço</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* User Profile Info */}
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-slate-100 leading-none">{user.name}</span>
                            <span className="text-[10px] font-black uppercase text-orange-500 tracking-tighter">{getRoleLabel(user.role)}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {canViewInventory && (
                                <button
                                    onClick={onInventoryClick}
                                    className="p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-900/20 rounded-xl transition-all"
                                    title="Controle de Estoque"
                                >
                                    <Package size={22} />
                                </button>
                            )}

                            {canViewMap && (
                                <button
                                    onClick={onMapClick}
                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-xl transition-all"
                                    title="Mapa Técnico"
                                >
                                    <MapIcon size={22} />
                                </button>
                            )}

                            {canManageUsers && (
                                <>
                                    <button
                                        onClick={onReportsClick}
                                        className="p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-900/20 rounded-xl transition-all"
                                        title="Relatórios de Atividades"
                                    >
                                        <BarChart2 size={22} />
                                    </button>
                                    <button
                                        onClick={onManageUsersClick}
                                        className="p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-900/20 rounded-xl transition-all"
                                        title="Gerenciar Equipe"
                                    >
                                        <Settings size={22} />
                                    </button>
                                </>
                            )}

                            {canCreate && (
                                <button
                                    onClick={onAddClick}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-orange-900/50 ml-1"
                                >
                                    <Plus size={20} />
                                    <span className="hidden sm:inline font-bold text-sm">Nova OS</span>
                                </button>
                            )}

                            <div className="w-px h-8 bg-slate-800 mx-1 hidden sm:block"></div>

                            <button
                                onClick={onLogout}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all"
                                title="Sair do Sistema"
                            >
                                <LogOut size={22} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile User Info Bar */}
                <div className="flex md:hidden items-center justify-between bg-slate-800 p-2.5 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-900/30 flex items-center justify-center text-orange-500">
                            <UserIcon size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-200 leading-none">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{getRoleLabel(user.role)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {canViewMap && (
                            <button
                                onClick={onMapClick}
                                className="p-1.5 text-blue-400 bg-blue-900/20 rounded-lg border border-blue-900/30"
                                title="Mapa"
                            >
                                <MapIcon size={18} />
                            </button>
                        )}
                        {canViewInventory && (
                            <button
                                onClick={onInventoryClick}
                                className="p-1.5 text-orange-400 bg-orange-900/20 rounded-lg border border-orange-900/30"
                                title="Estoque"
                            >
                                <Package size={18} />
                            </button>
                        )}
                        {canManageUsers && (
                            <>
                                <button
                                    onClick={onReportsClick}
                                    className="text-[10px] font-black uppercase text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700"
                                >
                                    Relatórios
                                </button>
                                <button
                                    onClick={onManageUsersClick}
                                    className="text-[10px] font-black uppercase text-orange-400 bg-orange-900/20 px-3 py-1.5 rounded-lg border border-orange-900/30"
                                >
                                    Equipe
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
