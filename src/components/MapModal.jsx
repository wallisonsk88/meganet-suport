import React, { useEffect, useState, useRef } from 'react';
import { X, Map as MapIcon, Navigation, User, History } from 'lucide-react';
import { storage } from '../lib/storage';

export default function MapModal({ isOpen, onClose }) {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef({});

    useEffect(() => {
        if (isOpen) {
            fetchLocations();
            const interval = setInterval(fetchLocations, 30000); // Atualiza a cada 30s no mapa
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const fetchLocations = async () => {
        try {
            const data = await storage.getTechnicianLocations(120); // Últimas 2 horas
            setLocations(data);
            updateMarkers(data);
        } catch (err) {
            console.error("Erro ao carregar mapa:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const initMap = () => {
        if (!mapRef.current || mapInstance.current) return;

        // Inicia o mapa (Centralizado no Brasil por padrão ou na primeira loc encontrada)
        mapInstance.current = window.L.map(mapRef.current).setView([-15.7801, -47.9292], 4);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);
    };

    const updateMarkers = (locData) => {
        if (!mapInstance.current) return;

        // Agrupa por técnico para mostrar apenas a última posição (Real-time)
        const latestByTech = {};
        locData.forEach(loc => {
            if (!latestByTech[loc.user_id] || new Date(loc.created_at) > new Date(latestByTech[loc.user_id].created_at)) {
                latestByTech[loc.user_id] = loc;
            }
        });

        // Limpa marcadores antigos (opcional: ou atualiza posição)
        Object.values(latestByTech).forEach(loc => {
            if (markersRef.current[loc.user_id]) {
                markersRef.current[loc.user_id].setLatLng([loc.lat, loc.lng]);
            } else {
                const marker = window.L.marker([loc.lat, loc.lng])
                    .addTo(mapInstance.current)
                    .bindPopup(`<b>${loc.user_name}</b><br>Visto por último: ${new Date(loc.created_at).toLocaleTimeString()}`);
                markersRef.current[loc.user_id] = marker;
            }
        });

        // Ajusta o zoom se houver dados
        const techArray = Object.values(latestByTech);
        if (techArray.length > 0) {
            const group = new window.L.featureGroup(Object.values(markersRef.current));
            mapInstance.current.fitBounds(group.getBounds().pad(0.1));
        }
    };

    useEffect(() => {
        if (isOpen && !mapInstance.current) {
            setTimeout(initMap, 100);
        }
        return () => {
            if (!isOpen && mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
                markersRef.current = {};
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-5xl h-[80vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                            <MapIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Mapa Técnico (Tempo Real)</h2>
                            <p className="text-xs text-slate-500 font-medium">Localização atual da equipe</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 relative bg-slate-100">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    <div ref={mapRef} className="w-full h-full z-0" />
                </div>

                <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                            <span className="text-xs font-bold text-slate-600">Técnicos Online</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Atualizando a cada 30 segundos</p>
                </div>
            </div>
        </div>
    );
}
