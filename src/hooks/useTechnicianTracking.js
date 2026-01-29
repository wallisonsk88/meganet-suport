import { useEffect } from 'react';
import { storage } from '../lib/storage';

export function useTechnicianTracking(user) {
    useEffect(() => {
        if (!user || user.role !== 'tecnico') return;

        const sendLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            await storage.saveTechnicianLocation(
                                user.id,
                                user.name,
                                position.coords.latitude,
                                position.coords.longitude
                            );
                            console.log('Localização enviada:', position.coords.latitude, position.coords.longitude);
                        } catch (err) {
                            console.error('Erro ao enviar localização:', err);
                        }
                    },
                    (error) => {
                        console.error('Erro de geolocalização:', error.message);
                    },
                    { enableHighAccuracy: true }
                );
            }
        };

        // Envia a primeira vez imediatamente
        sendLocation();

        // Configura o intervalo de 1 minuto (60000ms)
        const intervalId = setInterval(sendLocation, 60000);

        return () => clearInterval(intervalId);
    }, [user]);
}
