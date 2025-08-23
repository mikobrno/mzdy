import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/toast';
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

export default function SettingsMain() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  // Fetch real data for dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: apiService.getDashboardStats
  });

  // Mock settings status (would be fetched from configuration tables)
  const settingsOverview = {
    smtpStatus: 'not_configured',
    taxRates: {
      lastUpdated: '2025-01-01',
      version: '2025.1'
    },
    apiConnections: {
      bankApi: 'not_configured',
      csszApi: 'not_configured', 
      healthInsuranceApi: 'not_configured',
      financeApi: 'not_configured'
    },
    backup: {
      lastBackup: null,
      status: 'not_configured',
      nextScheduled: null
    },
    users: {
      totalUsers: 1,
      activeUsers: 1,
      pendingInvites: 0
    },
    billing: {
      currentPlan: 'Basic',
      nextPayment: '2025-02-01',
      status: 'active'
    },
    security: {
      lastPasswordChange: '2025-01-01',
      twoFactorEnabled: false,
      lastSecurityAudit: null
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
      case 'connected':
      case 'active':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'not_configured':
      case 'disconnected':
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
      case 'connected':
      case 'active':
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Aktivní</Badge>;
      case 'error':
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Chyba</Badge>;
      case 'not_configured':
      case 'disconnected':
      default:
        return <Badge variant="outline">Nenastaveno</Badge>;
    }
  };

  const settingSections = [
    {
      title: 'Základní nastavení',
      items: [
        {
          icon: Building2,
          title: 'Nastavení společnosti',
          description: 'Základní údaje o společnosti a SVJ',
          path: '/settings/company',
          status: 'configured'
        },
        {
          icon: Users,
          title: 'Správa uživatelů',
          description: `${settingsOverview.users.totalUsers} aktivních uživatelů`,
          path: '/settings/users',
          status: 'configured'
        },
        {
          icon: Shield,
          title: 'Zabezpečení',
          description: '2FA není aktivní',
          path: '/settings/security',
          status: settingsOverview.security.twoFactorEnabled ? 'configured' : 'not_configured'
        }
      ]
    },
    {
      title: 'E-mail a komunikace',
      items: [
        {
          icon: Mail,
          title: 'E-mailové nastavení',
          description: 'SMTP server a šablony',
          path: '/settings/email',
          status: settingsOverview.smtpStatus
        },
        {
          icon: Bell,
          title: 'Notifikace',
          description: 'Nastavení upozornění a oznámení',
          path: '/settings/notifications',
          status: 'configured'
        }
      ]
    },
    {
      title: 'Mzdy a účetnictví',
      items: [
        {
          icon: Calculator,
          title: 'Daňové sazby',
          description: `Verze ${settingsOverview.taxRates.version}`,
          path: '/settings/taxes',
          status: 'configured'
        },
        {
          icon: Globe,
          title: 'API integrace',
          description: 'Propojení s bankami a úřady',
          path: '/settings/api',
          status: 'not_configured'
        }
      ]
    },
    {
      title: 'Dokumenty a vzhled',
      items: [
        {
          icon: FileText,
          title: 'Správa dokumentů',
          description: 'PDF šablony a generování',
          path: '/settings/documents',
          status: 'configured'
        },
        {
          icon: Palette,
          title: 'Vzhled aplikace',
          description: 'Témata a personalizace',
          path: '/settings/appearance',
          status: 'configured'
        },
        {
          icon: Printer,
          title: 'Tisk a export',
          description: 'Nastavení tisku a exportů',
          path: '/settings/system',
          status: 'configured'
        }
      ]
    },
    {
      title: 'Systém a údržba',
      items: [
        {
          icon: Database,
          title: 'Zálohy',
          description: settingsOverview.backup.lastBackup 
            ? `Poslední: ${new Date(settingsOverview.backup.lastBackup).toLocaleDateString('cs-CZ')}`
            : 'Žádná záloha',
          path: '/settings/backup',
          status: settingsOverview.backup.status
        },
        {
          icon: CreditCard,
          title: 'Fakturace',
          description: `${settingsOverview.billing.currentPlan} - ${settingsOverview.billing.status}`,
          path: '/settings/billing',
          status: settingsOverview.billing.status
        },
        {
          icon: Server,
          title: 'Systémové nastavení',
          description: 'Pokročilé nastavení systému',
          path: '/settings/system',
          status: 'configured'
        }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nastavení</h1>
          <p className="text-gray-600">Správa systému, uživatelů a konfigurace aplikace</p>
        </div>
      </div>

      {/* System overview */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">SVJ v systému</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalSvj || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Aktivní zaměstnanci</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalEmployees || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calculator className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Nevyřízené mzdy</p>
                  <p className="text-2xl font-bold">{dashboardStats.pendingSalaries || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Dokončeno tento měsíc</p>
                  <p className="text-2xl font-bold">{dashboardStats.completedSalariesThisMonth || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings sections */}
      <div className="space-y-8">
        {settingSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <Card key={itemIndex} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <Link to={item.path}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{item.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Rychlé akce</CardTitle>
          <CardDescription>Často používané nástroje a operace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => success('Export byl spuštěn')}>
              <Download className="h-4 w-4 mr-2" />
              Exportovat data
            </Button>
            <Button variant="outline" onClick={() => success('Import byl spuštěn')}>
              <Upload className="h-4 w-4 mr-2" />
              Importovat data
            </Button>
            <Button variant="outline" onClick={() => success('Záloha byla vytvořena')}>
              <Database className="h-4 w-4 mr-2" />
              Vytvořit zálohu
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings/system')}>
              <Settings className="h-4 w-4 mr-2" />
              Systémové informace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
