import { supabase } from './supabase'

export const storage = {
    // --- AUTHENTICATION ---
    getAuthenticatedUser: () => {
        const data = localStorage.getItem('mega_suporte_auth_user');
        return data ? JSON.parse(data) : null;
    },

    setAuthenticatedUser: (user) => {
        if (user) {
            localStorage.setItem('mega_suporte_auth_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('mega_suporte_auth_user');
        }
        window.dispatchEvent(new Event('auth-update'));
    },

    login: async (username, password) => {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('name', username)
            .eq('password', password)
            .single();

        if (error || !users) {
            return { success: false, message: 'Usuário ou senha incorretos' };
        }

        const { password: _, ...userWithoutPassword } = users;
        storage.setAuthenticatedUser(userWithoutPassword);
        return { success: true, user: userWithoutPassword };
    },

    logout: () => {
        storage.setAuthenticatedUser(null);
    },

    // --- ORDERS ---
    getOrders: async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        return (data || []).map(order => ({
            ...order,
            serviceType: order.service_type,
            scheduledDate: order.scheduled_date,
            scheduledTime: order.scheduled_time,
            createdBy: order.created_by,
            completedAt: order.completed_at
        }));
    },

    addOrder: async (order) => {
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                customer: order.customer,
                address: order.address,
                service_type: order.serviceType,
                description: order.description,
                scheduled_date: order.scheduledDate,
                scheduled_time: order.scheduledTime,
                status: 'pending',
                created_by: order.createdBy
            }])
            .select()
            .single();

        if (error) throw error;
        window.dispatchEvent(new Event('storage-update'));
        return data;
    },

    updateOrder: async (id, updates) => {
        const { error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        window.dispatchEvent(new Event('storage-update'));
    },

    deleteOrder: async (id) => {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) throw error;
        window.dispatchEvent(new Event('storage-update'));
    },

    // --- USER MANAGEMENT ---
    getUsers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data || [];
    },

    addUser: async (user) => {
        const { data, error } = await supabase
            .from('users')
            .insert([user])
            .select()
            .single();

        if (error) throw error;
        window.dispatchEvent(new Event('users-update'));
        return data;
    },

    deleteUser: async (id) => {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
        window.dispatchEvent(new Event('users-update'));
    }
};

export const auth = {
    currentUser: storage.getAuthenticatedUser()
};
