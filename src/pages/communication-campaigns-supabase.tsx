import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/toast';
import { 
  Mail, 
  Send, 
  Users, 
  Calendar,
  FileText, 
  Play,
  Pause,
  Edit,
  Eye,
  Plus,
  Settings,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

export default function CommunicationCampaigns() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();
  
  const [selectedTab, setSelectedTab] = useState<'campaigns' | 'templates' | 'history'>('campaigns');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  // Fetch real data from Supabase
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => apiService.getEmployees()
  });

  const { data: svjList = [] } = useQuery({
    queryKey: ['svj-list'],
    queryFn: apiService.getSVJList
  });

  // Mock campaign data (would be stored in separate campaign tables)
  const mockCampaigns = [
    {
      id: '1',
      name: 'Oznámení o výplatě',
      type: 'payroll_notification',
      status: 'draft',
      template: 'Šablona výplaty',
      targetGroup: 'Všichni aktivní zaměstnanci',
      scheduledDate: null,
      sentDate: null,
      recipients: employees.length,
      opened: 0,
      clicked: 0,
      svjList: svjList.map(s => s.name),
      createdBy: 'Systém',
      createdAt: new Date().toISOString()
    }
  ];

  const mockEmailTemplates = [
    {
      id: 'payroll_notification',
      name: 'Oznámení o výplatě',
      subject: 'Výplata za {{month}}/{{year}}',
      content: 'Dobrý den,\n\nvaše výplata za {{month}}/{{year}} je připravena k vyplacení.\n\nS pozdravem,\n{{svj_name}}',
      variables: ['month', 'year', 'svj_name', 'employee_name', 'net_salary'],
      category: 'payroll',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'general_announcement',
      name: 'Obecné oznámení',
      subject: 'Oznámení - {{title}}',
      content: 'Dobrý den,\n\n{{content}}\n\nS pozdravem,\n{{svj_name}}',
      variables: ['title', 'content', 'svj_name'],
      category: 'general',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Dokončeno</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Naplánováno</Badge>;
      case 'running':
        return <Badge className="bg-yellow-100 text-yellow-800">Probíhá</Badge>;
      case 'paused':
        return <Badge className="bg-orange-100 text-orange-800">Pozastaveno</Badge>;
      default:
        return <Badge variant="outline">Návrh</Badge>;
    }
  };

  const handleCreateCampaign = () => {
    success('Nová kampaň byla vytvořena');
    // TODO: Implement campaign creation
  };

  const handleSendCampaign = (campaignId: string) => {
    success('Kampaň byla odeslána');
    // TODO: Implement campaign sending
  };

  const selectedCampaign = useMemo(() => 
    mockCampaigns.find(c => c.id === selectedCampaignId) || null, 
    [selectedCampaignId]
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Komunikační kampaně</h1>
          <p className="text-gray-600">Správa e-mailových kampaní a komunikace se zaměstnanci</p>
        </div>
        <Button onClick={handleCreateCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          Nová kampaň
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Příjemci</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aktivní kampaně</p>
                <p className="text-2xl font-bold">{mockCampaigns.filter(c => c.status === 'running').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Send className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Odesláno dnes</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Míra otevření</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedTab('campaigns')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'campaigns' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Kampaně
        </button>
        <button
          onClick={() => setSelectedTab('templates')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'templates' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Šablony
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'history' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Historie
        </button>
      </div>

      {/* Tab content */}
      {selectedTab === 'campaigns' && (
        <div className="space-y-4">
          {mockCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {campaign.targetGroup} • {campaign.recipients} příjemců
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Šablona: {campaign.template}</span>
                        <span>Vytvořil: {campaign.createdBy}</span>
                        <span>
                          {campaign.scheduledDate 
                            ? `Naplánováno: ${new Date(campaign.scheduledDate).toLocaleDateString('cs-CZ')}`
                            : 'Nenaplánováno'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedCampaignId(campaign.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
                    {campaign.status === 'draft' && (
                      <Button 
                        size="sm"
                        onClick={() => handleSendCampaign(campaign.id)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Odeslat
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockEmailTemplates.map((template) => (
            <Card key={template.id} className="hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <Badge variant={template.isActive ? 'default' : 'secondary'}>
                    {template.isActive ? 'Aktivní' : 'Neaktivní'}
                  </Badge>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Kategorie: {template.category}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    Náhled
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'history' && (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>Historie kampaní bude dostupná po odeslání prvních kampaní.</p>
          </CardContent>
        </Card>
      )}

      {/* Template preview modal placeholder */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Náhled šablony: {previewTemplate.name}</CardTitle>
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Zavřít
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Předmět:</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{previewTemplate.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Obsah:</label>
                <div className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                  {previewTemplate.content}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Dostupné proměnné:</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {previewTemplate.variables.map((variable: string) => (
                    <Badge key={variable} variant="outline">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
