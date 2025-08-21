import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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

// Funkce pro mapování stavů kampaní
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'draft':
      return { label: 'Rozpracováno', color: 'bg-yellow-100 text-yellow-800', icon: Edit };
    case 'scheduled':
      return { label: 'Naplánováno', color: 'bg-blue-100 text-blue-800', icon: Clock };
    case 'sending':
      return { label: 'Odesílá se', color: 'bg-orange-100 text-orange-800', icon: Send };
    case 'completed':
      return { label: 'Odesláno', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    case 'failed':
      return { label: 'Chyba', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    default:
      return { label: 'Neznámý', color: 'bg-gray-100 text-gray-800', icon: Clock };
  }
};

const getCampaignTypeLabel = (type: string) => {
  switch (type) {
    case 'payroll_notification':
      return 'Oznámení o výplatě';
    case 'announcement':
      return 'Oznámení';
    case 'reminder':
      return 'Připomenutí';
    case 'survey':
      return 'Průzkum';
    default:
      return 'Ostatní';
  }
};

export default function CommunicationCampaigns() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const selectedTab = searchParams.get('tab') || 'campaigns';
  const selectedCampaignId = searchParams.get('campaignId');
  
  // Queries pro data z Nhost
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiService.getCampaigns()
  });

  const { data: emailTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => apiService.getEmailTemplates()
  });

  const setTab = (tab: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    next.delete('campaignId');
    setSearchParams(next);
  };
  
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const handleStartCampaign = (campaignId: string) => {
    console.log(`Spouštím kampaň ${campaignId}`);
  };

  const handlePauseCampaign = (campaignId: string) => {
    console.log(`Pozastavuji kampaň ${campaignId}`);
  };

  const handleEditCampaign = (campaignId: string) => {
    console.log(`Upravuji kampaň ${campaignId}`);
  };

  const handleViewStats = (campaignId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'analytics');
    next.set('campaignId', campaignId);
    setSearchParams(next);
  };

  const selectedCampaign = useMemo(() => campaigns.find((c: any) => c.id === selectedCampaignId) || null, [selectedCampaignId, campaigns]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Komunikační modul</h1>
          <p className="text-gray-600">Správa e-mailových kampaní a komunikace se zaměstnanci</p>
        </div>
        <Button 
          onClick={() => setShowNewCampaignModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nová kampaň
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setTab('campaigns')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'campaigns'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Kampaně
        </button>
        <button
          onClick={() => setTab('analytics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'analytics'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Analytika
        </button>
        <button
          onClick={() => setTab('templates')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'templates'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Šablony
        </button>
      </div>

      {/* Campaigns Tab */}
      {selectedTab === 'campaigns' && (
        <div className="space-y-4">
          {campaignsLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Načítání kampaní...</span>
            </div>
          )}
          
          {!campaignsLoading && campaigns.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Zatím nemáte žádné kampaně
                </h3>
                <p className="text-gray-600 mb-4">
                  Začněte vytvořením své první komunikační kampaně
                </p>
              </CardContent>
            </Card>
          )}
          
          {campaigns.map((campaign: any) => {
            const statusInfo = getStatusInfo(campaign.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <Badge variant="outline">
                          {getCampaignTypeLabel(campaign.type)}
                        </Badge>
                      </div>
                      <CardDescription className="space-y-1">
                        <div>
                          <span className="font-medium">Šablona:</span> {campaign.template}
                        </div>
                        <div>
                          <span className="font-medium">Cílová skupina:</span> {campaign.targetGroup} ({campaign.recipients} příjemců)
                        </div>
                        <div>
                          <span className="font-medium">SVJ:</span> {campaign.svjList.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Naplánováno:</span>{' '}
                          {new Date(campaign.scheduledDate).toLocaleString('cs-CZ')}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {campaign.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCampaign(campaign.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {campaign.status === 'scheduled' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartCampaign(campaign.id)}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Spustit nyní
                        </Button>
                      )}
                      {campaign.status === 'sending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePauseCampaign(campaign.id)}
                          className="flex items-center gap-2"
                        >
                          <Pause className="h-4 w-4" />
                          Pozastavit
                        </Button>
                      )}
                      {campaign.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStats(campaign.id)}
                          className="flex items-center gap-2"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Statistiky
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {campaign.status === 'completed' && (
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{campaign.recipients}</div>
                        <div className="text-sm text-gray-600">Odesláno</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{campaign.opened}</div>
                        <div className="text-sm text-gray-600">Otevřeno ({Math.round((campaign.opened / campaign.recipients) * 100)}%)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{campaign.clicked}</div>
                        <div className="text-sm text-gray-600">Kliknuto ({Math.round((campaign.clicked / campaign.recipients) * 100)}%)</div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-500" />
                Celkem odesláno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">1,248</div>
              <p className="text-sm text-gray-600">e-mailů za posledních 30 dní</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-500" />
                Míra otevření
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">87.3%</div>
              <p className="text-sm text-gray-600">průměr za posledních 30 dní</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Míra kliknutí
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">23.8%</div>
              <p className="text-sm text-gray-600">průměr za posledních 30 dní</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                Aktivní příjemci
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">47</div>
              <p className="text-sm text-gray-600">registrovaných zaměstnanců</p>
            </CardContent>
          </Card>

          {/* Detailed Analytics */}
          <Card className="md:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Nejlepší kampaně (posledních 30 dní)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.filter((c: any) => c.status === 'completed').map((campaign: any) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(campaign.sentDate!).toLocaleDateString('cs-CZ')} • {campaign.recipients} příjemců
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {Math.round((campaign.opened / campaign.recipients) * 100)}% otevření
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round((campaign.clicked / campaign.recipients) * 100)}% kliknutí
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detail zvolené kampaně */}
          {selectedCampaign && (
            <Card className="md:col-span-2 lg:col-span-4">
              <CardHeader>
                <CardTitle>Detail kampaně: {selectedCampaign.name}</CardTitle>
                <CardDescription>
                  Šablona: {selectedCampaign.template} • Příjemci: {selectedCampaign.recipients}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{selectedCampaign.recipients}</div>
                    <div className="text-sm text-gray-600">Odesláno</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{selectedCampaign.opened}</div>
                    <div className="text-sm text-gray-600">Otevřeno ({Math.round((selectedCampaign.opened / selectedCampaign.recipients) * 100)}%)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{selectedCampaign.clicked}</div>
                    <div className="text-sm text-gray-600">Kliknutí ({Math.round((selectedCampaign.clicked / selectedCampaign.recipients) * 100)}%)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emailTemplates.map((template: any) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {template.name}
                </CardTitle>
                <CardDescription>
                  Předmět: {template.subject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Použito {template.usageCount}x
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      aria-label="Náhled šablony"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      aria-label="Upravit šablonu"
                      onClick={() => navigate('/templates')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add New Template Card */}
          <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
              <Plus className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600 text-center">Vytvořit novou šablonu</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Nová komunikační kampaň</CardTitle>
              <CardDescription>
                Vytvořte novou e-mailovou kampaň pro komunikaci se zaměstnanci
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Název kampaně</label>
                  <input 
                    type="text"
                    placeholder="Zadejte název kampaně"
                    aria-label="Název kampaně"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ kampaně</label>
                  <select aria-label="Typ kampaně" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="announcement">Oznámení</option>
                    <option value="payroll_notification">Oznámení o výplatě</option>
                    <option value="reminder">Připomenutí</option>
                    <option value="survey">Průzkum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mailová šablona</label>
                  <select aria-label="E-mailová šablona" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {emailTemplates.map((template: any) => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cílová skupina</label>
                  <select aria-label="Cílová skupina" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Všichni zaměstnanci</option>
                    <option value="active">Aktivní zaměstnanci</option>
                    <option value="svj_specific">Specifické SVJ</option>
                    <option value="custom">Vlastní výběr</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plánované odeslání</label>
                  <input 
                    type="datetime-local"
                    aria-label="Plánované odeslání"
                    placeholder="Vyberte datum a čas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowNewCampaignModal(false)}>
                    Zrušit
                  </Button>
                  <Button onClick={() => setShowNewCampaignModal(false)}>
                    Vytvořit kampaň
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Náhled šablony</CardTitle>
              <CardDescription>{previewTemplate.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Předmět:</span> {previewTemplate.subject}
                </div>
                <div className="text-sm text-gray-600">
                  Kategorie: {getCampaignTypeLabel(previewTemplate.category)}
                </div>
                <div className="p-3 bg-gray-50 rounded border text-sm text-gray-800">
                  Ukázkový obsah e-mailu pro {previewTemplate.name}…
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Zavřít</Button>
                <Button onClick={() => { setPreviewTemplate(null); navigate('/templates'); }}>Upravit ve Šablonách</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
