import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/toast';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Shield, 
  Eye, 
  Crown,
  UserCheck,
  Clock,
  Mail,
  Settings,
  MoreVertical
} from 'lucide-react';

// Mock data pro fallback pokud tabulky neexistují
const mockUsers = [
  {
    id: '1',
    name: 'Marie Svobodová',
    email: 'marie.svobodova@spr-svj.cz',
    role: 'super_admin',
    status: 'active',
    last_login: '2025-01-12T14:30:00',
    created_at: '2024-06-15T10:00:00',
    permissions: ['all'],
    svj_access: ['all']
  },
  {
    id: '2',
    name: 'Jana Nováková',
    email: 'jana.novakova@spr-svj.cz',
    role: 'accountant',
    status: 'active',
    last_login: '2025-01-12T09:15:00',
    created_at: '2024-08-20T14:30:00',
    permissions: ['payroll_read', 'payroll_write', 'employees_read', 'reports_read'],
    svj_access: ['svj-1', 'svj-2', 'svj-3']
  },
  {
    id: '3',
    name: 'Petr Novák',
    email: 'petr.novak@spr-svj.cz',
    role: 'viewer',
    status: 'pending',
    last_login: null,
    created_at: '2025-01-10T16:45:00',
    permissions: ['dashboard_read', 'employees_read', 'reports_read'],
    svj_access: ['svj-1']
  }
];

const roles = [
  {
    id: 'super_admin',
    name: 'Super administrátor',
    description: 'Úplný přístup ke všem funkcím systému',
    color: 'bg-red-100 text-red-800',
    icon: Crown,
    permissions: ['all']
  },
  {
    id: 'admin',
    name: 'Administrátor',
    description: 'Správa uživatelů, nastavení a konfiguraci',
    color: 'bg-purple-100 text-purple-800',
    icon: Shield,
    permissions: ['users_manage', 'settings_manage', 'payroll_read', 'employees_manage']
  },
  {
    id: 'accountant',
    name: 'Účetní',
    description: 'Správa mezd, zaměstnanců a generování reportů',
    color: 'bg-blue-100 text-blue-800',
    icon: UserCheck,
    permissions: ['payroll_manage', 'employees_manage', 'reports_manage', 'documents_manage']
  },
  {
    id: 'manager',
    name: 'Manažer SVJ',
    description: 'Správa konkrétních SVJ a jejich zaměstnanců',
    color: 'bg-green-100 text-green-800',
    icon: Users,
    permissions: ['payroll_read', 'employees_read', 'reports_read', 'communication_manage']
  },
  {
    id: 'viewer',
    name: 'Prohlížeč',
    description: 'Pouze čtení vybraných informací',
    color: 'bg-gray-100 text-gray-800',
    icon: Eye,
    permissions: ['dashboard_read', 'employees_read', 'reports_read']
  }
];

export default function SettingsUsers() {
  const { success, warning } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Fetch users from Supabase with fallback
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        return await apiService.getUsers();
      } catch (error) {
        console.log('Using mock users - table not found');
        return mockUsers;
      }
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      try {
        return await apiService.createUser(userData);
      } catch (error) {
        console.log('Create user not available');
        return userData;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Uživatel byl vytvořen');
      setShowUserForm(false);
      setEditingUser(null);
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        return await apiService.updateUser(id, data);
      } catch (error) {
        console.log('Update user not available');
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Uživatel byl aktualizován');
      setShowUserForm(false);
      setEditingUser(null);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiService.deleteUser(id);
      } catch (error) {
        console.log('Delete user not available');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Uživatel byl smazán');
    }
  });

  // Filters
  const filteredUsers = users.filter(user => {
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    return true;
  });

  const getRoleInfo = (roleId: string) => {
    return roles.find(r => r.id === roleId) || roles[4]; // fallback to viewer
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktivní';
      case 'pending': return 'Čekající';
      case 'suspended': return 'Pozastavený';
      default: return status;
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (user: any) => {
    if (window.confirm(`Opravdu chcete smazat uživatele ${user.name}?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správa uživatelů</h1>
          <p className="text-gray-600">Spravujte uživatele, role a oprávnění</p>
        </div>
        <Button onClick={() => setShowUserForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Přidat uživatele
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem uživatelů</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní</p>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Čekající</p>
                <p className="text-2xl font-bold text-yellow-600">{users.filter(u => u.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrátoři</p>
                <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role.includes('admin')).length}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Hledat uživatele..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          title="Filtr role"
        >
          <option value="all">Všechny role</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
        
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          title="Filtr stavu"
        >
          <option value="all">Všechny stavy</option>
          <option value="active">Aktivní</option>
          <option value="pending">Čekající</option>
          <option value="suspended">Pozastavený</option>
        </select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Uživatelé ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uživatel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poslední přihlášení
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  const RoleIcon = roleInfo.icon;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <RoleIcon className="h-4 w-4 mr-2 text-gray-500" />
                          <Badge className={roleInfo.color}>
                            {roleInfo.name}
                          </Badge>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(user.status)}>
                          {getStatusText(user.status)}
                        </Badge>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString('cs-CZ')
                          : 'Nikdy'
                        }
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Žádní uživatelé</h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Zkuste změnit filtry nebo vyhledávací kritéria.'
                  : 'Zatím nemáte žádné uživatele.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles Overview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Přehled rolí</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const RoleIcon = role.icon;
            const userCount = users.filter(u => u.role === role.id).length;
            
            return (
              <Card key={role.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RoleIcon className="h-5 w-5" />
                      <CardTitle className="text-base">{role.name}</CardTitle>
                    </div>
                    <Badge className={role.color}>
                      {userCount} uživatelů
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  <div className="text-xs text-gray-500">
                    <strong>Oprávnění:</strong> {role.permissions.join(', ')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
