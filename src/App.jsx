import React, { useState, useEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';

// Icons & Libs
import { storage } from './lib/storage';
import { supabase } from './lib/supabase';

// Components
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import SearchBar from './components/SearchBar';
import OrderCard from './components/OrderCard';
import OrderFormModal from './components/OrderFormModal';
import CompleteOrderModal from './components/CompleteOrderModal';
import UserManagementModal from './components/UserManagementModal';
import Login from './components/Login';
import ChatWidget from './components/ChatWidget';
import AdminReportsModal from './components/AdminReportsModal';
import InventoryModal from './components/InventoryModal';
import MapModal from './components/MapModal';
import { useTechnicianTracking } from './hooks/useTechnicianTracking';

export default function App() {
  const [currentUser, setCurrentUser] = useState(storage.getAuthenticatedUser());

  // Ativa o rastreamento se for técnico
  useTechnicianTracking(currentUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [completingOrder, setCompletingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Auth Sync
  useEffect(() => {
    const handleAuthUpdate = () => {
      setCurrentUser(storage.getAuthenticatedUser());
    };
    window.addEventListener('auth-update', handleAuthUpdate);
    return () => window.removeEventListener('auth-update', handleAuthUpdate);
  }, []);

  // 2. Data Fetching & Sync
  const fetchOrders = async () => {
    try {
      const data = await storage.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar ordens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    } else {
      setLoading(false);
    }

    const handleStorageUpdate = () => {
      fetchOrders();
    };

    window.addEventListener('storage-update', handleStorageUpdate);

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('realtime:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        // console.log('Realtime change received!', payload);

        if (payload.eventType === 'INSERT') {
          setOrders((prev) => [
            {
              ...payload.new,
              serviceType: payload.new.service_type,
              scheduledDate: payload.new.scheduled_date,
              scheduledTime: payload.new.scheduled_time,
              createdBy: payload.new.created_by,
              completedAt: payload.new.completed_at
            },
            ...prev
          ]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders((prev) => prev.map((order) =>
            order.id === payload.new.id
              ? {
                ...payload.new,
                serviceType: payload.new.service_type,
                scheduledDate: payload.new.scheduled_date,
                scheduledTime: payload.new.scheduled_time,
                createdBy: payload.new.created_by,
                completedAt: payload.new.completed_at
              }
              : order
          ));
        } else if (payload.eventType === 'DELETE') {
          setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      window.removeEventListener('storage-update', handleStorageUpdate);
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Role Permissions
  const permissions = useMemo(() => {
    if (!currentUser) return null;
    const roles = {
      admin: { canCreate: true, canEdit: true, canDelete: true, canComplete: true, canManageUsers: true, canViewInventory: true, canViewMap: true },
      recepcao: { canCreate: true, canEdit: true, canDelete: true, canComplete: false, canManageUsers: false, canViewInventory: true, canViewMap: true },
      tecnico: { canCreate: false, canEdit: false, canDelete: false, canComplete: true, canManageUsers: false, canViewInventory: true, canViewMap: false }
    };
    return roles[currentUser.role] || roles.tecnico;
  }, [currentUser]);

  // 3. Logic & Sorting - Pending first, then completed (recently finished at top of its group)
  const sortedOrders = useMemo(() => {
    const priorityWeight = {
      'Urgente': 4,
      'Alta': 3,
      'Média': 2,
      'Baixa': 1
    };

    return [...orders].sort((a, b) => {
      // Priority 1: Status (Pending on top, Completed below)
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;

      // Priority 2: If both are pending (The Core of the request)
      if (a.status === 'pending' && b.status === 'pending') {
        const weightA = priorityWeight[a.priority || 'Média'] || 2;
        const weightB = priorityWeight[b.priority || 'Média'] || 2;

        // If priorities are different, sort by priority weight (DESC - higher weight first)
        if (weightA !== weightB) return weightB - weightA;

        // If priorities are same, sort by schedule (ASC - oldest first for timeline)
        const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
        const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
        return dateA - dateB;
      }

      // Priority 3: If both are completed, newest at top of the completed section
      if (a.status === 'completed' && b.status === 'completed') {
        return new Date(b.completedAt) - new Date(a.completedAt);
      }

      return 0;
    }).filter(os =>
      os.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const kanbanColumns = useMemo(() => {
    const standardTypes = ['Instalação', 'Suporte', 'Pagamento', 'Mudança de Endereço', 'Troca de Equipamento'];
    const dynamicTypes = Array.from(new Set(orders.map(o => o.serviceType || 'Outros')));
    return Array.from(new Set([...standardTypes, ...dynamicTypes]));
  }, [orders]);

  // Handlers
  const handleAddClick = () => {
    if (!permissions?.canCreate) return;
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (os) => {
    if (!permissions?.canEdit) return;
    setEditingOrder(os);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id, status) => {
    if (!permissions?.canDelete) return;

    if (status === 'completed' && currentUser.role !== 'admin') {
      alert('Apenas administradores podem excluir ordens de serviço concluídas.');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      await storage.deleteOrder(id);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      storage.logout();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onAddClick={handleAddClick}
        onManageUsersClick={() => setIsUsersModalOpen(true)}
        onReportsClick={() => setIsReportsModalOpen(true)}
        onInventoryClick={() => setIsInventoryModalOpen(true)}
        onMapClick={() => setIsMapModalOpen(true)}
        canCreate={permissions.canCreate}
        canManageUsers={permissions.canManageUsers}
        canViewInventory={permissions.canViewInventory}
        canViewMap={permissions.canViewMap}
      />

      <main className="w-full max-w-[1400px] mx-auto px-4 py-6">
        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <StatsBar orders={orders} />
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory min-h-[500px]">
          {sortedOrders.length === 0 ? (
            <div className="w-full max-w-4xl bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-800 text-center flex flex-col items-center justify-center">
              <FileText className="text-slate-700 mb-4" size={64} />
              <p className="text-xl font-bold text-slate-400 mb-2">Nenhuma OS encontrada</p>
              <p className="text-sm text-slate-500">Crie uma nova Ordem de Serviço para popular o painel.</p>
            </div>
          ) : (
            kanbanColumns.map(type => {
              const columnOrders = sortedOrders.filter(os => (os.serviceType || 'Outros') === type);
              
              if (columnOrders.length === 0) return null;

              return (
                <div key={type} className="flex-shrink-0 w-[320px] sm:w-[340px] snap-start flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800/80 max-h-[calc(100vh-220px)] shadow-lg shadow-black/20">
                  {/* Column Header */}
                  <div className="p-4 pb-3 flex items-center justify-between shrink-0 border-b border-slate-800/60">
                    <h3 className="font-bold text-slate-200 text-sm">{type}</h3>
                    <span className="bg-slate-800 text-slate-400 text-xs font-black px-2 py-0.5 rounded-lg border border-slate-700">
                      {columnOrders.length}
                    </span>
                  </div>
                  
                  {/* Column Cards */}
                  <div className="flex flex-col gap-3 p-3 overflow-y-auto">
                    {columnOrders.map((os) => (
                      <OrderCard
                        key={os.id}
                        os={os}
                        onCompleteClick={(order) => setCompletingOrder(order)}
                        onEditClick={handleEditClick}
                        onDeleteClick={(id) => handleDeleteClick(id, os.status)}
                        permissions={permissions}
                        userRole={currentUser?.role}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <OrderFormModal
        user={currentUser}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOrder(null);
        }}
        editOrder={editingOrder}
      />

      <CompleteOrderModal
        user={currentUser}
        order={completingOrder}
        onClose={() => setCompletingOrder(null)}
      />

      <InventoryModal
        user={currentUser}
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
      />

      <UserManagementModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
      />

      <AdminReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        orders={orders}
      />

      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />

      <ChatWidget user={currentUser} />
    </div>
  );
}
