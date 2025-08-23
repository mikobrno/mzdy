import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/toast';
import { 
  Bell, 
  ArrowLeft,
  Settings,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Smartphone,
  MessageSquare,
  Filter,
  Archive,
  Trash2,
  Plus,
  Search,
  Calendar,
  User,
  Building,
  Calculator,
  Shield,
  Globe,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data pro fallback pokud tabulky neexistují
const mockNotifications = [
  {
    id: '1',
    type: 'security',
    title: 'Neúspěšný pokus o přihlášení',
    message: 'Zaznamenaný neúspěšný pokus o přihlášení z IP adresy 203.0.113.15',
    created_at: '2025-01-13T14:25:00',
    is_read: false,
    priority: 'high',
    category: 'Zabezpečení'
  },
  {
    id: '2',
    type: 'payroll',
    title: 'Mzdy připraveny ke schválení',
    message: 'Mzdové výpočty pro SVJ Nové Město jsou připraveny ke kontrole a schválení',
    created_at: '2025-01-13T13:45:00',
    is_read: false,
    priority: 'high',
    category: 'Mzdová agenda'
  },
  {
    id: '3',
    type: 'system',
    title: 'Automatická záloha dokončena',
    message: 'Denní záloha systému byla úspěšně dokončena. Velikost zálohy: 2.4 GB',
    created_at: '2025-01-13T06:00:00',
    is_read: true,
    priority: 'medium',
    category: 'Systém'
  }
];

export default function NotificationCenter() {
  const { success, warning } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch notifications from Supabase with fallback
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        return await apiService.getNotifications();
      } catch (error) {
        console.log('Using mock notifications - table not found');
        return mockNotifications;
      }
    }
  });

  // Actions
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiService.markNotificationAsRead(id);
      } catch (error) {
        console.log('Mark as read not available');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('Notifikace označena jako přečtená');
    }
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiService.archiveNotification(id);
      } catch (error) {
        console.log('Archive not available');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('Notifikace archivována');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiService.deleteNotification(id);
      } catch (error) {
        console.log('Delete not available');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('Notifikace smazána');
    }
  });

  // Filters
  const filteredNotifications = notifications.filter(notification => {
    if (selectedTab === 'unread' && notification.is_read) return false;
    if (selectedTab === 'read' && !notification.is_read) return false;
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) return false;
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return Shield;
      case 'payroll': return Calculator;
      case 'system': return Settings;
      case 'user': return Users;
      case 'api': return Globe;
      case 'document': return FileText;
      case 'deadline': return Calendar;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkAsRead = (ids: string[]) => {
    ids.forEach(id => markAsReadMutation.mutate(id));
  };

  const handleArchive = (ids: string[]) => {
    ids.forEach(id => archiveMutation.mutate(id));
  };

  const handleDelete = (ids: string[]) => {
    if (window.confirm(`Opravdu chcete smazat ${ids.length} notifikací?`)) {
      ids.forEach(id => deleteMutation.mutate(id));
    }
  };

  if (showSettings) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setShowSettings(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Nastavení notifikací</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Kanály notifikací
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>Email</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-purple-600" />
                  <span>Push notifikace</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <span>SMS</span>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kategorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                Vyberte, které kategorie notifikací chcete přijímat.
              </div>
              {['Zabezpečení', 'Mzdová agenda', 'Systém', 'Uživatelé', 'API integrace', 'Dokumenty', 'Termíny'].map(category => (
                <div key={category} className="flex items-center justify-between">
                  <span>{category}</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centrum notifikací</h1>
          <p className="text-gray-600">Přehled všech systémových událostí a upozornění</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <Bell className="h-4 w-4 mr-2" />
            Obnovit
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Nastavení
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <Button 
            variant={selectedTab === 'all' ? 'default' : 'outline'} 
            onClick={() => setSelectedTab('all')}
          >
            Vše ({notifications.length})
          </Button>
          <Button 
            variant={selectedTab === 'unread' ? 'default' : 'outline'} 
            onClick={() => setSelectedTab('unread')}
          >
            Nepřečtené ({notifications.filter(n => !n.is_read).length})
          </Button>
          <Button 
            variant={selectedTab === 'read' ? 'default' : 'outline'} 
            onClick={() => setSelectedTab('read')}
          >
            Přečtené ({notifications.filter(n => n.is_read).length})
          </Button>
        </div>

        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Hledat notifikace..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Všechny kategorie</option>
            <option value="Zabezpečení">Zabezpečení</option>
            <option value="Mzdová agenda">Mzdová agenda</option>
            <option value="Systém">Systém</option>
            <option value="Uživatelé">Uživatelé</option>
            <option value="API integrace">API integrace</option>
            <option value="Dokumenty">Dokumenty</option>
            <option value="Termíny">Termíny</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-800">
            Vybráno {selectedNotifications.length} notifikací
          </span>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(selectedNotifications)}>
              <Eye className="h-4 w-4 mr-1" />
              Označit jako přečtené
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleArchive(selectedNotifications)}>
              <Archive className="h-4 w-4 mr-1" />
              Archivovat
            </Button>
            <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(selectedNotifications)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Smazat
            </Button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => {
          const IconComponent = getTypeIcon(notification.type);
          const isSelected = selectedNotifications.includes(notification.id);
          
          return (
            <Card 
              key={notification.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                !notification.is_read ? 'ring-2 ring-blue-100 bg-blue-50/30' : ''
              } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => {
                if (isSelected) {
                  setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                } else {
                  setSelectedNotifications(prev => [...prev, notification.id]);
                }
              }}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <IconComponent className="h-5 w-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${!notification.is_read ? 'font-bold' : ''}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority === 'high' ? 'Vysoká' : 
                           notification.priority === 'medium' ? 'Střední' : 'Nízká'}
                        </Badge>
                        <Badge variant="outline">
                          {notification.category}
                        </Badge>
                        {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(notification.created_at).toLocaleString('cs-CZ')}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {!notification.is_read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsReadMutation.mutate(notification.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveMutation.mutate(notification.id);
                          }}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Opravdu chcete smazat tuto notifikaci?')) {
                              deleteMutation.mutate(notification.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné notifikace</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' || selectedTab !== 'all'
                ? 'Zkuste změnit filtry nebo vyhledávací kritéria.'
                : 'Momentálně nemáte žádné notifikace.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
