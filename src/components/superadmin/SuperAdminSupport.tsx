import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { SupportTicket, TicketReply } from '../../types';
import {
  LifeBuoy,
  Search,
  Filter,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  User,
  Store,
  ChevronRight,
  X,
  Sparkles,
  Inbox
} from 'lucide-react';

export const SuperAdminSupport: React.FC = () => {
  const { supportTickets, replyToSupportTicket } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Response form
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTickets = useMemo(() => {
    return supportTickets.filter((t) => {
      const matchSearch =
        t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.boutiqueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.requesterEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchSearch && matchPriority && matchStatus;
    });
  }, [supportTickets, searchTerm, priorityFilter, statusFilter]);

  const activeTicket = selectedTicket ? supportTickets.find((t) => t.id === selectedTicket.id) || selectedTicket : null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await replyToSupportTicket(activeTicket.id, replyText);
      setReplyText('');
    } catch (err: any) {
      alert(`Erreur d'envoi : ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (p: SupportTicket['priority']) => {
    switch (p) {
      case 'urgente':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Urgent</span>;
      case 'haute':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">Haute</span>;
      case 'normale':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Normale</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">Basse</span>;
    }
  };

  const getStatusBadge = (s: SupportTicket['status']) => {
    switch (s) {
      case 'nouveau':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">Nouveau</span>;
      case 'en_cours':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">En cours</span>;
      case 'resolu':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Résolu</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">Fermé</span>;
    }
  };

  const openTicketsCount = supportTickets.filter((t) => t.status === 'nouveau' || t.status === 'en_cours').length;
  const resolvedTicketsCount = supportTickets.filter((t) => t.status === 'resolu').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Assistance & Support Client Plateforme
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Traitez les demandes des propriétaires de boutique, requêtes techniques et assistances d'encaissement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{openTicketsCount} ticket(s) en attente</span>
          </div>
        </div>
      </div>

      {/* Ticket List and Detail View Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ticket List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher ticket, boutique, e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="all">Toutes priorités</option>
                <option value="urgente">Urgent</option>
                <option value="haute">Haute</option>
                <option value="normale">Normale</option>
                <option value="basse">Basse</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="all">Tous statuts</option>
                <option value="nouveau">Nouveau</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
                <option value="ferme">Fermé</option>
              </select>
            </div>
          </div>

          {/* Ticket Cards */}
          <div className="space-y-2">
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center text-slate-500 text-xs">
                Aucun ticket trouvé.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = activeTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-400 shadow-xs'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {ticket.ticketNumber}
                        </span>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1 mb-1">
                      {ticket.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <div className="flex items-center gap-1">
                        <Store className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[140px]">{ticket.boutiqueName}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{ticket.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation View */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-[550px]">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs text-blue-600">
                      {activeTicket.ticketNumber}
                    </span>
                    {getPriorityBadge(activeTicket.priority)}
                    {getStatusBadge(activeTicket.status)}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{activeTicket.subject}</h3>
                  <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2">
                    <span><strong>Demandeur :</strong> {activeTicket.requesterName} ({activeTicket.requesterEmail})</span>
                    <span>·</span>
                    <span><strong>Boutique :</strong> {activeTicket.boutiqueName}</span>
                  </div>
                </div>
              </div>

              {/* Conversation Messages */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[380px]">
                {/* Initial Description */}
                <div className="p-4 rounded-xl bg-slate-100 text-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900 text-[11px] mb-1">
                    <span>Message Initial du Commerçant</span>
                    <span className="text-slate-600 font-mono">{activeTicket.createdAt}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{activeTicket.description}</p>
                </div>

                {/* Replies Thread */}
                {activeTicket.replies.map((reply) => {
                  const isSuperAdminSender = reply.senderRole === 'superadmin';
                  return (
                    <div
                      key={reply.id}
                      className={`p-4 rounded-xl text-xs space-y-1 ${
                        isSuperAdminSender
                          ? 'bg-blue-600 text-white ml-6'
                          : 'bg-slate-100 text-slate-800 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1 opacity-90 font-semibold">
                        <span>{reply.senderName} {isSuperAdminSender ? '(Super Admin SaaS)' : ''}</span>
                        <span className="font-mono text-[10px]">{reply.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                  <textarea
                    rows={2}
                    required
                    placeholder="Rédiger une réponse officielle du Super Admin..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !replyText.trim()}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-600 text-xs flex flex-col items-center justify-center min-h-[400px]">
              <Inbox className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">Aucun ticket sélectionné</h4>
              <p className="text-slate-600 mt-1 max-w-sm">
                Sélectionnez un ticket dans la liste de gauche pour consulter l'échange et envoyer une réponse souveraine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
