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
        // Map updates to snake_case
        const mappedUpdates = {};
        if (updates.customer) mappedUpdates.customer = updates.customer;
        if (updates.address) mappedUpdates.address = updates.address;
        if (updates.serviceType) mappedUpdates.service_type = updates.serviceType;
        if (updates.description) mappedUpdates.description = updates.description;
        if (updates.scheduledDate) mappedUpdates.scheduled_date = updates.scheduledDate;
        if (updates.scheduledTime) mappedUpdates.scheduled_time = updates.scheduledTime;
        if (updates.status) mappedUpdates.status = updates.status;
        if (updates.resolution) mappedUpdates.resolution = updates.resolution;
        if (updates.technician) mappedUpdates.technician = updates.technician;
        if (updates.completedAt) mappedUpdates.completed_at = updates.completedAt;
        if (updates.createdBy) mappedUpdates.created_by = updates.createdBy;

        // If specific snake_case keys were passed directly, keep them too (just in case)
        if (updates.service_type) mappedUpdates.service_type = updates.service_type;
        if (updates.scheduled_date) mappedUpdates.scheduled_date = updates.scheduled_date;
        if (updates.scheduled_time) mappedUpdates.scheduled_time = updates.scheduled_time;
        if (updates.completed_at) mappedUpdates.completed_at = updates.completed_at;
        if (updates.created_by) mappedUpdates.created_by = updates.created_by;

        const { error } = await supabase
            .from('orders')
            .update(mappedUpdates)
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
    },

    // --- CHAT ---
    getMessages: async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
        return data || [];
    },

    sendMessage: async (content, senderName, imageUrl = null) => {
        const { error } = await supabase
            .from('messages')
            .insert([{
                content,
                sender_name: senderName,
                image_url: imageUrl
            }]);

        if (error) throw error;
    },

    uploadChatImage: async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('chat-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('chat-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};

export const auth = {
    currentUser: storage.getAuthenticatedUser()
};
