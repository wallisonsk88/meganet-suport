import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Image, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { storage } from '../lib/storage';

export default function ChatWidget({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [hasUnread, setHasUnread] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const chatBoxRef = useRef(null);
    const fileInputRef = useRef(null);
    const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')); // Som de notificação padrão

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // 1. Fetch initial messages
        const fetchMessages = async () => {
            const data = await storage.getMessages();
            setMessages(data);
            scrollToBottom();
        };

        fetchMessages();

        // 2. Subscribe to Realtime
        const channel = supabase
            .channel('realtime:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const isNewOtherMessage = payload.new.sender_name !== user.name;

                setMessages((prev) => [...prev, payload.new]);

                if (isNewOtherMessage) {
                    notificationSound.current.play().catch(e => console.log('Audio error:', e));
                }

                if (!isOpen) {
                    setHasUnread(true);
                } else {
                    scrollToBottom();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, user.name]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setHasUnread(false);
        }
    }, [isOpen, messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        // Check if there is a message or a file to upload
        if ((!newMessage.trim() && !fileInputRef.current?.files[0]) || !user) return;

        try {
            let imageUrl = null;
            if (fileInputRef.current?.files[0]) {
                setIsUploading(true);
                imageUrl = await storage.uploadChatImage(fileInputRef.current.files[0]);
                setIsUploading(false);
            }

            await storage.sendMessage(newMessage, user.name, imageUrl);

            // Allow sending another message
            setNewMessage('');
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error) {
            console.error("Error sending message:", error);
            setIsUploading(false);
            alert("Erro ao enviar mensagem. Tente novamente.");
        }
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div
                    ref={chatBoxRef}
                    className="bg-white w-80 sm:w-96 h-[500px] mb-4 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-500 w-2.5 h-2.5 rounded-full animate-pulse"></div>
                            <h3 className="font-bold">Chat da Equipe</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <Minimize2 size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-400 text-sm mt-10">
                                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Comece a conversa...</p>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isMe = msg.sender_name === user.name;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-baseline gap-2 mb-1`}>
                                        <span className="text-xs font-bold text-slate-600">
                                            {isMe ? 'Você' : msg.sender_name}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm break-words shadow-sm
                            ${isMe ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                        {msg.image_url && (
                                            <div className="mb-2">
                                                <img
                                                    src={msg.image_url}
                                                    alt="Anexo"
                                                    className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 max-h-48 object-cover"
                                                    onClick={() => window.open(msg.image_url, '_blank')}
                                                />
                                            </div>
                                        )}
                                        {msg.content && <p>{msg.content}</p>}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0 items-center">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-slate-400 hover:text-orange-600 p-2 rounded-xl transition-colors"
                            title="Enviar imagem"
                        >
                            <Image size={20} />
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={() => {
                                // Force re-render to update button state or show preview if needed
                                // For now just relies on fileInputRef check in submit
                            }}
                        />

                        <input
                            type="text"
                            className="flex-1 px-4 py-2 bg-slate-100 rounded-xl border-transparent focus:bg-white focus:border-orange-500 focus:ring-0 text-sm transition-all outline-none"
                            placeholder="Digite sua mensagem..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />

                        <button
                            type="submit"
                            disabled={isUploading}
                            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors flex items-center justify-center"
                        >
                            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 relative
            ${isOpen ? 'bg-slate-700 text-white rotate-0' : 'bg-orange-600 text-white rotate-0'}`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}

                {/* Unread Indicator */}
                {!isOpen && hasUnread && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce"></span>
                )}
            </button>
        </div>
    );
}
