import React, { useState } from 'react';
import { Wifi, Lock, User, AlertCircle } from 'lucide-react';
import { storage } from '../lib/storage';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await storage.login(username, password);

            if (result.success) {
                // storage.login already sets the authenticated user
            } else {
                setError(result.message);
                setLoading(false);
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Ocorreu um erro ao tentar entrar. Tente novamente.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="bg-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-orange-200">
                        <Wifi size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">MegaNet Suporte</h1>
                    <p className="text-slate-500 font-medium">Gestão de Ordens de Serviço</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in duration-500">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Acesse sua conta</h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100 animate-in shake duration-300">
                                <AlertCircle size={20} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Usuário</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Seu nome de usuário"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                                <input
                                    required
                                    type="password"
                                    placeholder="Sua senha secreta"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Entrar no Sistema"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-400 text-sm mt-8">
                    &copy; 2024 MegaNet Suporte - Todos os direitos reservados
                </p>
            </div>
        </div>
    );
}
