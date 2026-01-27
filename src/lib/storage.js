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
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
        return (data || []).reverse();
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
    },

    // --- INVENTORY ---
    getInventory: async () => {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching inventory:', error);
            return [];
        }
        return data || [];
    },

    addInventoryItem: async (item) => {
        const { data, error } = await supabase
            .from('inventory')
            .insert([{
                name: item.name,
                category: item.category,
                description: item.description,
                unit: item.unit,
                current_stock: item.currentStock,
                min_stock: item.minStock,
                image_url: item.imageUrl
            }])
            .select()
            .single();

        if (error) throw error;

        // Log initial stock
        if (item.currentStock > 0) {
            await supabase.from('inventory_logs').insert([{
                inventory_id: data.id,
                type: 'entry',
                quantity: item.currentStock,
                new_stock: item.currentStock,
                notes: 'Cadastro inicial do item'
            }]);
        }

        window.dispatchEvent(new Event('inventory-update'));
        return data;
    },

    updateInventoryItem: async (id, updates, userName = 'Admin') => {
        // 1. Get current stock for logging
        const { data: currentItem } = await supabase.from('inventory').select('current_stock').eq('id', id).single();
        const prevStock = currentItem?.current_stock || 0;

        const mappedUpdates = {};
        if (updates.name) mappedUpdates.name = updates.name;
        if (updates.category) mappedUpdates.category = updates.category;
        if (updates.description) mappedUpdates.description = updates.description;
        if (updates.unit) mappedUpdates.unit = updates.unit;
        if (updates.currentStock !== undefined) mappedUpdates.current_stock = updates.currentStock;
        if (updates.minStock !== undefined) mappedUpdates.min_stock = updates.minStock;
        if (updates.imageUrl !== undefined) mappedUpdates.image_url = updates.imageUrl;

        const { data, error } = await supabase
            .from('inventory')
            .update(mappedUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // 2. Log change if quantity changed
        if (updates.currentStock !== undefined && updates.currentStock !== prevStock) {
            const diff = updates.currentStock - prevStock;
            await supabase.from('inventory_logs').insert([{
                inventory_id: id,
                type: diff > 0 ? 'entry' : 'adjustment',
                quantity: Math.abs(diff),
                prev_stock: prevStock,
                new_stock: updates.currentStock,
                user_name: userName,
                notes: updates.notes || 'Ajuste manual de estoque'
            }]);
        }

        window.dispatchEvent(new Event('inventory-update'));
        return data;
    },

    deleteInventoryItem: async (id) => {
        const { error } = await supabase
            .from('inventory')
            .delete()
            .eq('id', id);

        if (error) throw error;
        window.dispatchEvent(new Event('inventory-update'));
    },

    addItemsToOrder: async (orderId, items, technicianName = 'Técnico') => {
        for (const item of items) {
            // 1. Get current item for stock calculation
            const { data: currentItem, error: fetchError } = await supabase
                .from('inventory')
                .select('current_stock')
                .eq('id', item.inventoryId)
                .single();

            if (fetchError) throw fetchError;
            const prevStock = currentItem.current_stock || 0;
            const newStock = prevStock - item.quantity;

            // 2. Add to order_items
            const { error: itemError } = await supabase
                .from('order_items')
                .insert([{
                    order_id: orderId,
                    inventory_id: item.inventoryId,
                    quantity: item.quantity,
                    serial_number: item.serialNumber
                }]);

            if (itemError) throw itemError;

            // 3. Decrease stock in inventory
            const { error: stockError } = await supabase
                .from('inventory')
                .update({ current_stock: newStock })
                .eq('id', item.inventoryId);

            if (stockError) throw stockError;

            // 4. Log movement
            await supabase.from('inventory_logs').insert([{
                inventory_id: item.inventoryId,
                type: 'exit',
                quantity: item.quantity,
                prev_stock: prevStock,
                new_stock: newStock,
                order_id: orderId,
                user_name: technicianName,
                notes: `Consumido na OS #${orderId.slice(-6).toUpperCase()}`
            }]);
        }
        window.dispatchEvent(new Event('inventory-update'));
    },

    getOrderItems: async (orderId) => {
        const { data, error } = await supabase
            .from('order_items')
            .select(`
                *,
                inventory:inventory_id (name, unit)
            `)
            .eq('order_id', orderId);

        if (error) {
            console.error('Error fetching order items:', error);
            return [];
        }
        return data || [];
    },

    reopenOrder: async (orderId) => {
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'pending',
                completed_at: null,
                technician: null
            })
            .eq('id', orderId);

        if (error) throw error;
        window.dispatchEvent(new Event('storage-update'));
    },

    getInventoryLogs: async (inventoryId = null) => {
        let query = supabase.from('inventory_logs').select(`
            *,
            inventory:inventory_id (name)
        `).order('created_at', { ascending: false });

        if (inventoryId) {
            query = query.eq('inventory_id', inventoryId);
        }

        const { data, error } = await query.limit(50);
        if (error) {
            console.error('Error fetching inventory logs:', error);
            return [];
        }
        return data || [];
    }
};

export const auth = {
    currentUser: storage.getAuthenticatedUser()
};
