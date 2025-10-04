import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox';
import type {
  CreateRealmFormData,
  RealmTypeDefinition,
  RealmType
} from '@interrealm/types';

interface CreateRealmModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingRealms?: Array<{ id: string; name: string }>;
}

const realmTypes: RealmTypeDefinition[] = [
  { id: 'bridge', name: 'Bridge Realm', description: 'Connects to external clusters', icon: '🌉' },
  { id: 'internal', name: 'Internal Realm', description: 'Business logic and agents', icon: '⚡' },
  { id: 'gateway', name: 'API Gateway', description: 'External service integration', icon: '🚪' },
  { id: 'ai-agent', name: 'AI Agent Realm', description: 'ML/AI processing with vector DB', icon: '🤖' }
];

export function CreateRealmModal({ isOpen, onClose, existingRealms = [] }: CreateRealmModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateRealmFormData>({
    realmType: '' as RealmType,
    realmId: '',
    name: '',
    parentRealmId: '',
    containerImage: '',
    containerVersion: 'latest',
    blockchainSync: false,
    description: ''
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log('Creating realm:', formData);
    onClose();
  };

  const canProceed = () => {
    switch(step) {
      case 1: return Boolean(formData.realmType);
      case 2: return formData.name !== '' && formData.realmId !== '';
      case 3: return formData.containerImage !== '';
      case 4: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl mx-4 border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Create New Realm</h2>
            <p className="text-sm text-muted-foreground mt-1">Step {step} of 4</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-8">
            {['Type', 'Identity', 'Container', 'Review'].map((label, idx) => (
              <div key={idx} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step > idx + 1 ? 'bg-primary' : step === idx + 1 ? 'bg-primary' : 'bg-muted'
                }`}>
                  {step > idx + 1 ? (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <span className={`text-sm font-semibold ${
                      step === idx + 1 ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === idx + 1 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {label}
                </span>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    step > idx + 1 ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 min-h-[400px]">
          {/* Step 1: Realm Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Select Realm Type</Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {realmTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, realmType: type.id })}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary/50 ${
                        formData.realmType === type.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="font-semibold">{type.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Identity */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Realm Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="healthcare-research"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="realmId">Realm ID</Label>
                <Input
                  id="realmId"
                  value={formData.realmId}
                  onChange={(e) => setFormData({ ...formData, realmId: e.target.value })}
                  placeholder="realm://org.cluster-123.healthcare-research"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Globally unique identifier for this realm</p>
              </div>

              {formData.realmType !== 'bridge' && (
                <div className="space-y-2">
                  <Label htmlFor="parentRealm">Parent Realm</Label>
                  <select
                    value={formData.parentRealmId}
                    onChange={(e) => setFormData({ ...formData, parentRealmId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select parent realm...</option>
                    {existingRealms.map(realm => (
                      <option key={realm.id} value={realm.id}>{realm.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">This realm will route through the parent</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Processes patient lab results and detects drug interactions..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="blockchain"
                  checked={formData.blockchainSync}
                  onChange={(e) =>
                    setFormData({ ...formData, blockchainSync: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="blockchain" className="text-sm">
                  Sync with blockchain (mock - not implemented)
                </Label>
              </div>
            </div>
          )}

          {/* Step 3: Container */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="containerImage">Container Image</Label>
                <Input
                  id="containerImage"
                  value={formData.containerImage}
                  onChange={(e) => setFormData({ ...formData, containerImage: e.target.value })}
                  placeholder="interrealm/chat-agent"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Docker image to deploy for this realm</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="containerVersion">Image Version/Tag</Label>
                <Input
                  id="containerVersion"
                  value={formData.containerVersion}
                  onChange={(e) => setFormData({ ...formData, containerVersion: e.target.value })}
                  placeholder="latest"
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> The container will receive its realm ID and parent realm ID via environment variables on startup. It should bootstrap by calling the control plane.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-muted-foreground">Realm Type</div>
                  <div className="text-lg mt-1">
                    {realmTypes.find(t => t.id === formData.realmType)?.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground">Name</div>
                    <div className="mt-1">{formData.name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground">Realm ID</div>
                    <div className="mt-1 font-mono text-sm">{formData.realmId}</div>
                  </div>
                </div>

                {formData.parentRealmId && (
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground">Parent Realm</div>
                    <div className="mt-1">{formData.parentRealmId}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-semibold text-muted-foreground">Container Image</div>
                  <div className="mt-1 font-mono text-sm">
                    {formData.containerImage}:{formData.containerVersion}
                  </div>
                </div>

                {formData.description && (
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground">Description</div>
                    <div className="mt-1">{formData.description}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-semibold text-muted-foreground">Blockchain Sync</div>
                  <div className="mt-1">{formData.blockchainSync ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Ready to deploy:</strong> This will create the realm record in the database and deploy the container to your Kubernetes cluster.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                Create Realm
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}