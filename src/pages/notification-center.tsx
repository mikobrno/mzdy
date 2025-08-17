import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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

// Mock data pro notifikace
const notifications = [
  {
    id: 1,
    type: 'security',
    title: 'Neúspěšný pokus o přihlášení',
    message: 'Zaznamenaný neúspěšný pokus o přihlášení z IP adresy 203.0.113.15',
    timestamp: '2025-01-13T14:25:00',
    isRead: false,
    priority: 'high',
    category: 'Zabezpečení',
    user: 'Systém',
    icon: Shield,
    actions: ['Prošetřit', 'Označit jako vyřešené']
  },
  {
    id: 2,
    type: 'payroll',
    title: 'Mzdy připraveny ke schválení',
    message: 'Mzdové výpočty pro SVJ Nové Město jsou připraveny ke kontrole a schválení',
    timestamp: '2025-01-13T13:45:00',
    isRead: false,
    priority: 'high',
    category: 'Mzdová agenda',
    user: 'Jana Novotná',
    icon: Calculator,
    actions: ['Zobrazit výpočty', 'Schválit']
  },
  {
    id: 3,
    type: 'system',
    title: 'Automatická záloha dokončena',
    message: 'Denní záloha systému byla úspěšně dokončena. Velikost zálohy: 2.4 GB',
    timestamp: '2025-01-13T06:00:00',
    isRead: true,
    priority: 'medium',
    category: 'Systém',
    user: 'Systém',
    icon: Archive,
    actions: ['Zobrazit detaily']
  },
  {
    id: 4,
    type: 'user',
    title: 'Nový uživatel čeká na schválení',
    message: 'Petr Svoboda požádal o přístup k systému s rolí "Mzdový účetní"',
    timestamp: '2025-01-13T11:30:00',
    isRead: false,
    priority: 'medium',
    category: 'Uživatelé',
    user: 'Petr Svoboda',
    icon: Users,
    actions: ['Schválit', 'Odmítnout', 'Zobrazit profil']
  },
  {
    id: 5,
    type: 'api',
    title: 'Chyba API připojení',
    message: 'Připojení k ČSSZ API selhalo. Automatické pokusy o obnovení neúspěšné',
    timestamp: '2025-01-13T10:15:00',
    isRead: true,
    priority: 'high',
    category: 'API integrace',
    user: 'Systém',
    icon: Globe,
    actions: ['Znovu připojit', 'Zkontrolovat nastavení']
  },
  {
    id: 6,
    type: 'document',
    title: 'Výplatní pásky vygenerovány',
    message: 'Výplatní pásky pro měsíc leden 2025 byly úspěšně vygenerovány a odeslány',
    timestamp: '2025-01-13T09:20:00',
    isRead: true,
    priority: 'low',
    category: 'Dokumenty',
    user: 'Systém',
    icon: FileText,
    actions: ['Zobrazit dokumenty']
  },
  {
    id: 7,
    type: 'deadline',
    title: 'Blíží se termín podání přehledů',
    message: 'Do termínu podání přehledů sociálního pojištění zbývají 3 dny',
    timestamp: '2025-01-13T08:00:00',
    isRead: false,
    priority: 'medium',
    category: 'Termíny',
    user: 'Systém',
    icon: Calendar,
    actions: ['Zobrazit přehledy', 'Připravit podání']
  }
];

// Mock data pro nastavení notifikací
const notificationSettings = {
  channels: {
    email: true,
    push: true,
    sms: false,
    inApp: true
  },
  categories: {
    security: { enabled: true, priority: 'high', channels: ['email', 'push', 'sms'] },
    payroll: { enabled: true, priority: 'high', channels: ['email', 'push'] },
    system: { enabled: true, priority: 'medium', channels: ['email'] },
    users: { enabled: true, priority: 'medium', channels: ['email', 'push'] },
    api: { enabled: true, priority: 'high', channels: ['email', 'push'] },
    documents: { enabled: true, priority: 'low', channels: ['email'] },
    deadlines: { enabled: true, priority: 'high', channels: ['email', 'push', 'sms'] }
  },
  schedule: {
    quietHours: { enabled: true, start: '22:00', end: '07:00' },
    weekends: { enabled: false },
    frequency: 'immediate' // immediate, hourly, daily
  }
};

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [settings, setSettings] = useState(notificationSettings);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Vysoká';
      case 'medium':
        return 'Střední';
      case 'low':
        return 'Nízká';
      default:
        return 'Neznámá';
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'high':
        return notifications.filter(n => n.priority === 'high');
      case 'today':
        const today = new Date().toDateString();
        return notifications.filter(n => new Date(n.timestamp).toDateString() === today);
      default:
        return notifications;
    }
  };

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleMarkAsRead = (ids: number[]) => {
    console.log('Označuji jako přečtené:', ids);
    setSelectedNotifications([]);
  };

  const handleArchive = (ids: number[]) => {
    console.log('Archivuji notifikace:', ids);
    setSelectedNotifications([]);
  };

  const handleDelete = (ids: number[]) => {
    console.log('Mažu notifikace:', ids);
    setSelectedNotifications([]);
  };

  const updateChannelSetting = (channel: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: enabled
      }
    }));
  };

  const updateCategorySetting = (category: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category as keyof typeof prev.categories],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na dashboard
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Centrum notifikací</h1>
          <p className="text-gray-600">Správa upozornění a systémových notifikací</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Nepřečtené</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter(n => !n.isRead).length}
            </div>
            <p className="text-sm text-gray-600">ze {notifications.length} celkem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Vysoká priorita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {notifications.filter(n => n.priority === 'high').length}
            </div>
            <p className="text-sm text-gray-600">vyžaduje pozornost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Dnes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {notifications.filter(n => 
                new Date(n.timestamp).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-sm text-gray-600">nových notifikací</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Aktivní kanály</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(settings.channels).filter(Boolean).length}
            </div>
            <p className="text-sm text-gray-600">z {Object.keys(settings.channels).length} dostupných</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'notifications', label: 'Notifikace', icon: Bell },
          { id: 'settings', label: 'Nastavení', icon: Settings }
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'Všechny' },
                    { id: 'unread', label: 'Nepřečtené' },
                    { id: 'high', label: 'Vysoká priorita' },
                    { id: 'today', label: 'Dnes' }
                  ].map((filterOption) => (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filter === filterOption.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filterOption.label}
                    </button>
                  ))}
                </div>

                {selectedNotifications.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(selectedNotifications)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-3 w-3" />
                      Označit jako přečtené
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(selectedNotifications)}
                      className="flex items-center gap-2"
                    >
                      <Archive className="h-3 w-3" />
                      Archivovat
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selectedNotifications)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      Smazat
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {getFilteredNotifications().map((notification) => {
              const NotificationIcon = notification.icon;
              const isSelected = selectedNotifications.includes(notification.id);
              
              return (
                <Card key={notification.id} className={`transition-all ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1"
                      />
                      
                      <div className={`p-2 rounded-full ${
                        notification.priority === 'high' ? 'bg-red-100' :
                        notification.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <NotificationIcon className={`h-5 w-5 ${
                          notification.priority === 'high' ? 'text-red-600' :
                          notification.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h3>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {getPriorityText(notification.priority)}
                          </Badge>
                          <Badge variant="outline">{notification.category}</Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {notification.user}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.timestamp).toLocaleString('cs-CZ')}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {notification.actions.map((action, index) => (
                            <Button key={index} variant="outline" size="sm">
                              {action}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Kanály notifikací
              </CardTitle>
              <CardDescription>
                Vyberte způsoby doručování notifikací
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'email', label: 'E-mail', description: 'Notifikace na e-mailovou adresu', icon: Mail },
                  { key: 'push', label: 'Push notifikace', description: 'Upozornění v prohlížeči', icon: Bell },
                  { key: 'sms', label: 'SMS zprávy', description: 'Kritické upozornění přes SMS', icon: Smartphone },
                  { key: 'inApp', label: 'V aplikaci', description: 'Notifikace přímo v systému', icon: MessageSquare }
                ].map((channel) => {
                  const ChannelIcon = channel.icon;
                  return (
                    <div key={channel.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ChannelIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">{channel.label}</div>
                          <div className="text-sm text-gray-500">{channel.description}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => updateChannelSetting(channel.key, !settings.channels[channel.key as keyof typeof settings.channels])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.channels[channel.key as keyof typeof settings.channels] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.channels[channel.key as keyof typeof settings.channels] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Category Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Nastavení kategorií</CardTitle>
              <CardDescription>
                Konfigurace notifikací podle typu události
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(settings.categories).map(([category, categorySettings]) => (
                  <div key={category} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium capitalize">{category}</h3>
                        <p className="text-sm text-gray-500">
                          Priorita: {getPriorityText(categorySettings.priority)}
                        </p>
                      </div>
                      <button
                        onClick={() => updateCategorySetting(category, 'enabled', !categorySettings.enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          categorySettings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          categorySettings.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    {categorySettings.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priorita
                          </label>
                          <select
                            value={categorySettings.priority}
                            onChange={(e) => updateCategorySetting(category, 'priority', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="low">Nízká</option>
                            <option value="medium">Střední</option>
                            <option value="high">Vysoká</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aktivní kanály
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {categorySettings.channels.map((channel) => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Časové nastavení</CardTitle>
              <CardDescription>
                Konfigrace doby doručování notifikací
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">Tichý režim</div>
                    <div className="text-sm text-gray-500">
                      {settings.schedule.quietHours.start} - {settings.schedule.quietHours.end}
                    </div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.schedule.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.schedule.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">Víkendy</div>
                    <div className="text-sm text-gray-500">Omezit notifikace o víkendech</div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.schedule.weekends.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.schedule.weekends.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frekvence doručování
                  </label>
                  <select
                    value={settings.schedule.frequency}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="immediate">Okamžitě</option>
                    <option value="hourly">Každou hodinu</option>
                    <option value="daily">Denní souhrn</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Uložit nastavení
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
