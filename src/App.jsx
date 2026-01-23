import React, { useState, useEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';

// Icons & Libs
import { storage } from './lib/storage';

// Components
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import SearchBar from './components/SearchBar';
import OrderCard from './components/OrderCard';
import OrderFormModal from './components/OrderFormModal';
import CompleteOrderModal from './components/CompleteOrderModal';
import UserManagementModal from './components/UserManagementModal';
import Login from './components/Login';

export default function App() {
  const [currentUser, setCurrentUser] = useState(storage.getAuthenticatedUser());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
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
    return () => window.removeEventListener('storage-update', handleStorageUpdate);
  }, [currentUser]);

  // Role Permissions
  const permissions = useMemo(() => {
    if (!currentUser) return null;
    const roles = {
      admin: { canCreate: true, canEdit: true, canDelete: true, canComplete: true, canManageUsers: true },
      recepcao: { canCreate: true, canEdit: true, canDelete: false, canComplete: false, canManageUsers: false },
      tecnico: { canCreate: false, canEdit: false, canDelete: false, canComplete: true, canManageUsers: false }
    };
    return roles[currentUser.role] || roles.tecnico;
  }, [currentUser]);

  // 3. Logic & Sorting
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      if (a.status === 'pending' && b.status === 'completed') return -1;
      if (a.status === 'completed' && b.status === 'pending') return 1;

      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateA - dateB;
    }).filter(os =>
      os.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

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

  const handleDeleteClick = async (id) => {
    if (!permissions?.canDelete) return;
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onAddClick={handleAddClick}
        onManageUsersClick={() => setIsUsersModalOpen(true)}
        canCreate={permissions.canCreate}
        canManageUsers={permissions.canManageUsers}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <StatsBar orders={orders} />
        </div>

        {/* Timeline */}
        <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8">
          {sortedOrders.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center -ml-12">
              <FileText className="mx-auto text-slate-300 mb-2" size={48} />
              <p className="text-slate-500">Nenhuma ordem de serviço encontrada.</p>
            </div>
          ) : (
            sortedOrders.map((os) => (
              <OrderCard
                key={os.id}
                os={os}
                onCompleteClick={(order) => setCompletingOrder(order)}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                permissions={permissions}
              />
            ))
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
        order={completingOrder}
        onClose={() => setCompletingOrder(null)}
      />

      <UserManagementModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
      />
    </div>
  );
}
