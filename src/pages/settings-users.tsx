import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  ArrowLeft,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Settings,
  Shield,
  Mail,
  Clock,
  Key,
  Eye,
  Crown,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { nhostApiService } from '@/services/nhost-api';

export default function UserSettings() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'viewer',
    svjAccess: [],
    customPermissions: []
  });
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => nhostApiService.getUsers(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => nhostApiService.getUserRoles(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => nhostApiService.getUserPermissions(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: svjList = [] } = useQuery({
    queryKey: ['svj-list'],
    queryFn: () => nhostApiService.getSVJList(),
    staleTime: 1000 * 60 * 10,
  });

  const inviteUserMutation = useMutation({
    mutationFn: (data: any) => nhostApiService.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'viewer', svjAccess: [], customPermissions: [] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => nhostApiService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const resendInviteMutation = useMutation({
    mutationFn: (userId: string) => nhostApiService.resendInvite(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
  {
    id: '1',
    name: 'Marie Svobodová',
    email: 'marie.svobodova@spr-svj.cz',
    role: 'super_admin',
    status: 'active',
    lastLogin: '2025-01-12T14:30:00',
    createdAt: '2024-06-15T10:00:00',
    permissions: ['all'],
    svjAccess: ['all'],
    avatar: 'MS'
  },
  {
    id: '2',
    name: 'Jana Nováková',
    email: 'jana.novakova@spr-svj.cz',
    role: 'accountant',
    status: 'active',
    lastLogin: '2025-01-12T09:15:00',
    createdAt: '2024-08-20T14:30:00',
    permissions: ['payroll_read', 'payroll_write', 'employees_read', 'reports_read'],
    svjAccess: ['svj-1', 'svj-2', 'svj-3'],
    avatar: 'JN'
  },
  {
    id: '3',
    name: 'Petr Novák',
    email: 'petr.novak@spr-svj.cz',
    role: 'viewer',
    status: 'pending',
    lastLogin: null,
    createdAt: '2025-01-10T16:45:00',
    permissions: ['dashboard_read', 'employees_read', 'reports_read'],
    svjAccess: ['svj-1'],
    avatar: 'PN'
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

const permissions = [
  { id: 'dashboard_read', name: 'Zobrazení dashboardu', category: 'Základní' },
  { id: 'employees_read', name: 'Zobrazení zaměstnanců', category: 'Zaměstnanci' },
  { id: 'employees_manage', name: 'Správa zaměstnanců', category: 'Zaměstnanci' },
  { id: 'payroll_read', name: 'Zobrazení mezd', category: 'Mzdy' },
  { id: 'payroll_write', name: 'Úprava mezd', category: 'Mzdy' },
  { id: 'payroll_approve', name: 'Schvalování mezd', category: 'Mzdy' },
  { id: 'payroll_manage', name: 'Plná správa mezd', category: 'Mzdy' },
  { id: 'reports_read', name: 'Zobrazení reportů', category: 'Reporty' },
  { id: 'reports_manage', name: 'Správa reportů', category: 'Reporty' },
  { id: 'documents_manage', name: 'Správa dokumentů', category: 'Dokumenty' },
  { id: 'communication_manage', name: 'Správa komunikace', category: 'Komunikace' },
  { id: 'settings_manage', name: 'Správa nastavení', category: 'Systém' },
  { id: 'users_manage', name: 'Správa uživatelů', category: 'Systém' },
  { id: 'all', name: 'Všechna oprávnění', category: 'Systém' }
];

const svjList = [
  { id: 'svj-1', name: 'Dřevařská 851/4' },
  { id: 'svj-2', name: 'Knihovky 318' },
  { id: 'svj-3', name: 'Kotlářská 670/38' },
  { id: 'all', name: 'Všechna SVJ' }
];

export default function UserSettings() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'viewer',
    svjAccess: [],
    customPermissions: []
  });

  const getRoleInfo = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role || roles[4]; // fallback to viewer
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Aktivní', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'pending':
        return { label: 'Čeká na aktivaci', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'suspended':
        return { label: 'Pozastavený', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      default:
        return { label: 'Neznámý', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    }
  };

  const handleInviteUser = () => {
    console.log('Pozývám uživatele', inviteData);
    setShowInviteModal(false);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Mažu uživatele', userId);
  };

  const handleResendInvite = (userId: string) => {
    console.log('Znovu odesílám pozvánku', userId);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na nastavení
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Uživatelé a oprávnění</h1>
          <p className="text-gray-600">Správa uživatelů, rolí a přístupových práv</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Pozvat uživatele
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Celkem uživatelů</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-sm text-gray-600">registrovaných</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Aktivní uživatelé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">připojených</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Čekající pozvánek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">nevyřízených</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Administrátoři</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'super_admin' || u.role === 'admin').length}
            </div>
            <p className="text-sm text-gray-600">s plnými právy</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Seznam uživatelů</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              const statusInfo = getStatusInfo(user.status);
              const RoleIcon = roleInfo.icon;
              const StatusIcon = statusInfo.icon;

              return (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">{user.avatar}</span>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={roleInfo.color}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleInfo.name}
                        </Badge>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className="text-sm text-gray-600">
                        {user.lastLogin ? 
                          `Naposledy: ${new Date(user.lastLogin).toLocaleDateString('cs-CZ')}` :
                          'Nikdy nepřihlášen'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        Registrován: {new Date(user.createdAt).toLocaleDateString('cs-CZ')}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {user.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResendInvite(user.id)}
                          className="flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          Znovu poslat
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {user.role !== 'super_admin' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Roles Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Přehled rolí</CardTitle>
          <CardDescription>Dostupné role a jejich oprávnění</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => {
              const RoleIcon = role.icon;
              const userCount = users.filter(u => u.role === role.id).length;
              
              return (
                <div key={role.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <RoleIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-gray-600">{userCount} uživatelů</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map(perm => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {permissions.find(p => p.id === perm)?.name || perm}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 3} dalších
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Pozvat nového uživatele</CardTitle>
              <CardDescription>
                Odešlete pozvánku novému uživateli
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mailová adresa</label>
                  <input 
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select 
                    value={inviteData.role}
                    onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.filter(r => r.id !== 'super_admin').map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                    Zrušit
                  </Button>
                  <Button onClick={handleInviteUser}>
                    Poslat pozvánku
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
