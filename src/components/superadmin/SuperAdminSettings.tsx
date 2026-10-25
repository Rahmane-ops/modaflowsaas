import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PlatformSettings } from '../../types';
import firebaseConfig from '../../../firebase-applet-config.json';
import {
  Settings,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building,
  Mail,
  Phone,
  DollarSign,
  Power,
  Users,
  Bell,
  Sparkles,
  HelpCircle,
  Copy,
  ExternalLink,
  Check,
  KeyRound,
  Globe
} from 'lucide-react';

export const SuperAdminSettings: React.FC = () => {
  const { platformSettings, updatePlatformSettings } = useStore();

  const [formData, setFormData] = useState<PlatformSettings>({ ...platformSettings });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedDomain(text);
      setTimeout(() => setCopiedDomain(null), 2000);
    } catch {}
  };

  const handleChange = (field: keyof PlatformSettings, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await updatePlatformSettings(formData);
      setFeedback({
        type: 'success',
        message: 'Les paramètres de la plateforme SaaS ont été enregistrés avec succès dans Cloud Firestore.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Erreur d'enregistrement : ${err.message || 'Échec de la mise à jour.'}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Paramètres Généraux de la Plateforme SaaS
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Configurez les politiques système globales, le mode maintenance d'urgence et les règles d'adhésion.
          </p>
        </div>

        {formData.maintenanceMode && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span>MODE MAINTENANCE ACTIF</span>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identité Plateforme */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Identité & Coordonnées Officielles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Nom Commercial de la Plateforme
              </label>
              <input
                type="text"
                required
                value={formData.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Raison Sociale / Entité Légale
              </label>
              <input
                type="text"
                required
                value={formData.legalEntityName}
                onChange={(e) => handleChange('legalEntityName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                E-mail Officiel du Support
              </label>
              <input
                type="email"
                required
                value={formData.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Numéro de Téléphone / WhatsApp Assistance
              </label>
              <input
                type="text"
                required
                value={formData.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Inscription & Essai Gratuit */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Inscriptions & Essais Gratuits</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <strong className="text-slate-900 block font-semibold">Ouverture des Inscriptions Publiques</strong>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Permet aux nouveaux commerçants de créer leur boutique en ligne en toute autonomie.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.publicRegistrationOpen}
                  onChange={(e) => handleChange('publicRegistrationOpen', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Durée de l'Essai Gratuit (en jours)
                </label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={formData.freeTrialDays}
                  onChange={(e) => handleChange('freeTrialDays', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Devise par Défaut de la Facturation
                </label>
                <select
                  value={formData.defaultCurrency}
                  onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
                >
                  <option value="FCFA">Franc CFA (XOF / FCFA)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar US ($)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <strong className="text-slate-900 block font-semibold">Essai sans Carte Bancaire Requis</strong>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Les boutiques peuvent tester toutes les fonctionnalités immédiatement sans saisir de moyen de paiement.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowTrialWithoutCard}
                  onChange={(e) => handleChange('allowTrialWithoutCard', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Mode Maintenance d'Urgence */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Power className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-sm text-slate-900">Interruption & Mode Maintenance d'Urgence</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/80">
              <div>
                <strong className="text-rose-950 block font-semibold">Activer le Mode Maintenance Global</strong>
                <p className="text-rose-700 text-[11px] mt-0.5">
                  Restreint l'accès aux boutiques ordinaires. Seul le Super Admin conserve l'accès complet.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Message Diffusé aux Utilisateurs lors de la Maintenance
              </label>
              <textarea
                rows={3}
                value={formData.maintenanceMessage || ''}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                placeholder="Explication claire de l'intervention technique et heure prévisionnelle de reprise..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Notifications Système */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Alertes & Notifications Super Admin</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnNewSignup}
                onChange={(e) => handleChange('notifyOnNewSignup', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-800 font-medium">
                M'alerter immédiatement lors de chaque nouvelle inscription de boutique
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnPayment}
                onChange={(e) => handleChange('notifyOnPayment', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-800 font-medium">
                M'alerter lors de tout paiement d'abonnement réussi ou contesté (Wave, Orange Money)
              </span>
            </label>
          </div>
        </div>

        {/* Section 5: Diagnostic & Domaines Autorisés Firebase Authentication */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Configuration & Diagnostic Firebase Authentication
              </h3>
            </div>
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <span>Ouvrir Console Firebase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Connexion Google (OAuth) :</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> Activée & Opérationnelle
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Client ID : <code className="text-slate-800 font-mono text-[10px] break-all">{firebaseConfig.oAuthClientId || '815370838944-...'}</code>
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Email & Mot de passe :</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px]">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Mode Résilient Actif
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Activé via le coffre sécurisé applicatif. Pour l'activer directement sur Firebase, cochez "Adresse e-mail/Mot de passe" dans l'onglet Fournisseurs de connexion.
              </p>
            </div>
          </div>

          {/* Authorized Domains Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-xs font-bold text-slate-800">
                Domaines autorisés pour la connexion (OAuth & Redirection) :
              </h4>
            </div>
            <p className="text-[11px] text-slate-500">
              Dans la Console Firebase, accédez à <strong>Authentication &gt; Paramètres &gt; Domaines autorisés</strong> pour vous assurer que les domaines suivants y figurent :
            </p>

            <div className="space-y-1.5">
              {[
                { label: 'Domaine de prévisualisation (Dev)', domain: 'ais-dev-6wkzghgfgrdswcdwmnkrwz-307132903369.europe-west3.run.app' },
                { label: 'Domaine de partage (Pre)', domain: 'ais-pre-6wkzghgfgrdswcdwmnkrwz-307132903369.europe-west3.run.app' },
                { label: 'Domaine Firebase par défaut', domain: firebaseConfig.authDomain },
                { label: 'Environnement local', domain: 'localhost' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 text-xs transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] font-semibold text-slate-500">{item.label}</p>
                    <code className="text-slate-800 font-mono text-[11px] truncate block">{item.domain}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.domain)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shrink-0 flex items-center gap-1 text-[11px] cursor-pointer"
                    title="Copier le domaine"
                  >
                    {copiedDomain === item.domain ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold text-[10px]">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copier</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement dans Firestore...' : 'Enregistrer les Paramètres'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
