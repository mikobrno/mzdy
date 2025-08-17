import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Settings, 
  Mail, 
  Calculator, 
  Shield,
  Database,
  Users,
  Building2,
  FileText,
  Globe,
  Key,
  Bell,
  Palette,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Server,
  CreditCard,
  Printer
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';

// Mock data pro přehled nastavení
const settingsOverview = {
  smtpStatus: 'configured', // configured, not_configured, error
  taxRates: {
    lastUpdated: '2025-01-01',
    version: '2025.1'
  },
  apiConnections: {
    bankApi: 'connected',
    csszApi: 'connected', 
    healthInsuranceApi: 'error',
    financeApi: 'not_configured'
  },
  backup: {
    lastBackup: '2025-01-12T23:00:00',
    status: 'success',
    nextScheduled: '2025-01-13T23:00:00'
  },
  users: {
    totalUsers: 3,
    activeUsers: 2,
    pendingInvites: 1
  },
  system: {
    version: '1.2.0',
    environment: 'production',
    uptime: '15 dní'
  }
};

const settingsSections = [
  {
    id: 'smtp',
    title: 'E-mailové nastavení',
    description: 'SMTP server, šablony a automatické notifikace',
    icon: Mail,
    href: '/settings/email',
    status: settingsOverview.smtpStatus,
    badges: ['SMTP', 'Šablony', 'Notifikace'],
    priority: 'high'
  },
  {
    id: 'taxes',
    title: 'Daně a odvody',
    description: 'Daňové sazby, sociální a zdravotní pojištění',
    icon: Calculator,
    href: '/settings/taxes',
    status: 'configured',
    badges: ['Daň z příjmu', 'SP', 'ZP'],
    priority: 'high'
  },
  {
    id: 'api',
    title: 'API integrace',
    description: 'Bankovní API, ČSSZ, zdravotní pojišťovny',
    icon: Globe,
    href: '/settings/api',
    status: settingsOverview.apiConnections.healthInsuranceApi === 'error' ? 'error' : 'configured',
    badges: ['Banka', 'ČSSZ', 'ZP', 'MinFin'],
    priority: 'high'
  },
  {
    id: 'users',
    title: 'Uživatelé a oprávnění',
    description: 'Správa uživatelů, role a přístupová práva',
    icon: Users,
    href: '/settings/users',
    status: 'configured',
    badges: [`${settingsOverview.users.totalUsers} uživatelů`, 'Role', 'Oprávnění'],
    priority: 'medium'
  },
  {
    id: 'company',
    title: 'Údaje o firmě',
    description: 'Kontaktní údaje, logo, fakturační informace',
    icon: Building2,
    href: '/settings/company',
    status: 'configured',
    badges: ['IČO', 'DIČ', 'Adresa'],
    priority: 'medium'
  },
  {
    id: 'documents',
    title: 'Dokumenty a šablony',
    description: 'PDF šablony, razítka, podpisy',
    icon: FileText,
    href: '/settings/documents',
    status: 'configured',
    badges: ['PDF', 'Razítka', 'Podpisy'],
    priority: 'medium'
  },
  {
    id: 'security',
    title: 'Bezpečnost',
    description: 'Hesla, 2FA, audit log, bezpečnostní politiky',
    icon: Shield,
    href: '/settings/security',
    status: 'configured',
    badges: ['2FA', 'Audit', 'Politiky'],
    priority: 'high'
  },
  {
    id: 'backup',
    title: 'Záloha a archivace',
    description: 'Automatické zálohy, archivace dat, disaster recovery',
    icon: Database,
    href: '/settings/backup',
    status: settingsOverview.backup.status === 'success' ? 'configured' : 'error',
    badges: ['Auto záloha', 'Archiv', 'Recovery'],
    priority: 'high'
  },
  {
    id: 'notifications',
    title: 'Notifikace',
    description: 'E-mailové upozornění, systémové notifikace',
    icon: Bell,
    href: '/settings/notifications',
    status: 'configured',
    badges: ['E-mail', 'Push', 'SMS'],
    priority: 'low'
  },
  {
    id: 'appearance',
    title: 'Vzhled a UI',
    description: 'Motiv, barvy, jazyk, personalizace',
    icon: Palette,
    href: '/settings/appearance',
    status: 'configured',
    badges: ['Motiv', 'Jazyk', 'Barvy'],
    priority: 'low'
  },
  {
    id: 'system',
    title: 'Systémové nastavení',
    description: 'Výkon, cache, monitoring, logy',
    icon: Server,
    href: '/settings/system',
    status: 'configured',
    badges: ['Cache', 'Monitoring', 'Logy'],
    priority: 'medium'
  },
  {
    id: 'billing',
    title: 'Fakturace a platby',
    description: 'Plán, fakturace, způsoby platby',
    icon: CreditCard,
    href: '/settings/billing',
    status: 'configured',
    badges: ['Plán Pro', 'Platba kartou', 'Faktury'],
    priority: 'medium'
  }
];

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'configured':
      return { label: 'Nakonfigurováno', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    case 'error':
      return { label: 'Chyba', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    case 'not_configured':
      return { label: 'Není nastaveno', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    default:
      return { label: 'Neznámý', color: 'bg-gray-100 text-gray-800', icon: Clock };
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500';
    case 'medium':
      return 'border-l-yellow-500';
    case 'low':
      return 'border-l-green-500';
    default:
      return 'border-l-gray-300';
  }
};

export default function SettingsMain() {
  const [selectedPriority, setSelectedPriority] = useState('all');
  const navigate = useNavigate();
  const { success } = useToast();

  const filteredSections = selectedPriority === 'all' 
    ? settingsSections 
    : settingsSections.filter(section => section.priority === selectedPriority);

  const handleExportSettings = () => {
    success('Export nastavení zahájen');
  };

  const handleImportSettings = () => {
    success('Import nastavení připraven');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nastavení systému</h1>
          <p className="text-gray-600">Konfigurace SVJ mzdového portálu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportSettings} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export nastavení
          </Button>
          <Button variant="outline" onClick={handleImportSettings} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import nastavení
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Verze systému</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settingsOverview.system.version}</div>
            <p className="text-sm text-gray-600">{settingsOverview.system.environment}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Aktivní uživatelé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {settingsOverview.users.activeUsers}/{settingsOverview.users.totalUsers}
            </div>
            <p className="text-sm text-gray-600">
              {settingsOverview.users.pendingInvites} pozvánek čeká
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Poslední záloha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Date(settingsOverview.backup.lastBackup).toLocaleDateString('cs-CZ')}
            </div>
            <p className="text-sm text-gray-600">
              Další: {new Date(settingsOverview.backup.nextScheduled).toLocaleDateString('cs-CZ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Dostupnost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-sm text-gray-600">Uptime: {settingsOverview.system.uptime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedPriority('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPriority === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Všechno ({settingsSections.length})
        </button>
        <button
          onClick={() => setSelectedPriority('high')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPriority === 'high'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Vysoká priorita ({settingsSections.filter(s => s.priority === 'high').length})
        </button>
        <button
          onClick={() => setSelectedPriority('medium')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPriority === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Střední priorita ({settingsSections.filter(s => s.priority === 'medium').length})
        </button>
        <button
          onClick={() => setSelectedPriority('low')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPriority === 'low'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Nízká priorita ({settingsSections.filter(s => s.priority === 'low').length})
        </button>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => {
          const statusInfo = getStatusInfo(section.status);
          const StatusIcon = statusInfo.icon;
          const SectionIcon = section.icon;
          
          return (
            <Link key={section.id} to={section.href}>
              <Card className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${getPriorityColor(section.priority)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <SectionIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge className={`${statusInfo.color} mt-1`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {section.badges.map((badge, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Rychlé akce</CardTitle>
          <CardDescription>
            Nejčastěji používané nastavení a akce
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => navigate('/settings/email')} variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Test SMTP
            </Button>
            <Button onClick={() => navigate('/settings/backup')} variant="outline" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Záloha nyní
            </Button>
            <Button onClick={() => navigate('/settings/users')} variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Přidat uživatele
            </Button>
            <Button onClick={() => navigate('/settings/taxes')} variant="outline" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Aktualizovat sazby
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
