import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Layers, 
  Plus, 
  AlertTriangle, 
  Search, 
  TrendingUp, 
  ArrowUpDown,
  Edit3,
  Check,
  Lock
} from 'lucide-react';
import { ClothingCategory, ClothingItem } from '../types';

interface InventoryViewProps {
  onOpenNewProduct: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenNewProduct }) => {
  const { clothes, adjustStock, currentUser, hasPermission } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory>('tous');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [customStockValue, setCustomStockValue] = useState<number>(0);

  const canCreate = hasPermission('products.create');
  const canAdjustStock = hasPermission('inventory.adjust') || hasPermission('inventory.receive');
  const canViewFinancials = hasPermission('reports.financial');

  const lowStockItems = clothes.filter((c) => c.stock <= c.minStockAlert);
  const totalStockCount = clothes.reduce((sum, c) => sum + c.stock, 0);
  const totalStockValue = clothes.reduce((sum, c) => sum + c.stock * c.price, 0);

  const filteredClothes = clothes.filter((item) => {
    if (selectedCategory !== 'tous' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartEditStock = (item: ClothingItem) => {
    if (!canAdjustStock) return;
    setEditingStockId(item.id);
    setCustomStockValue(item.stock);
  };

  const handleSaveStock = (item: ClothingItem) => {
    if (!canAdjustStock) return;
    const delta = customStockValue - item.stock;
    adjustStock(item.id, delta);
    setEditingStockId(null);
  };

  return (
    <div className="pb-24 lg:pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Stocks & Inventaire
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Mise à jour en temps réel des stocks à chaque vente en caisse et livraison.
          </p>
        </div>

        {/* Level 2 : Bouton Nouveau vêtement masqué si l'utilisateur n'a pas products.create */}
        {canCreate && (
          <button
            onClick={onOpenNewProduct}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau vêtement</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-600">
            Pièces en stock
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalStockCount}{' '}
            <span className="text-xs font-normal text-slate-600">vêtements</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Sur {clothes.length} modèles au catalogue
          </p>
        </div>

        {/* Valeur financière du stock protégée : accessible uniquement si reports.financial */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Valeur du stock
            </span>
            {!canViewFinancials && (
              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Réservé finances
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {canViewFinancials ? (
              <>
                {totalStockValue.toLocaleString('fr-FR')}{' '}
                <span className="text-xs font-normal text-slate-600">FCFA</span>
              </>
            ) : (
              <span className="text-slate-400 font-mono text-xl">•••••• FCFA</span>
            )}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            {canViewFinancials ? 'Évaluée au prix de vente boutique' : 'Donnée confidentielle restreinte'}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-600">
            Alertes réassortiment
          </span>
          <p className={`text-2xl font-bold mt-1 tabular-nums ${
            lowStockItems.length > 0 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {lowStockItems.length}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            {lowStockItems.length > 0 ? 'Articles sous le seuil d’alerte' : 'Tous les stocks sont optimaux'}
          </p>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-amber-900">
              Attention : {lowStockItems.length} article(s) nécessitent un réapprovisionnement
            </p>
            <p className="text-amber-700 mt-0.5">
              {lowStockItems
                .map((i) => `${i.name} (${i.stock} restant${i.stock > 1 ? 's' : ''})`)
                .join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Inventory Table with Fast Controls */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
        {/* Table Filters */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, SKU..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {(['tous', 'robes', 'hauts', 'ensembles', 'pantalons'] as ClothingCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-neutral-200">
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Tailles Dispo</th>
                {canViewFinancials && <th className="py-3 px-4 text-right">Prix Achat</th>}
                <th className="py-3 px-4 text-right">Prix Vente</th>
                {canViewFinancials && <th className="py-3 px-4 text-right">Marge Brute</th>}
                <th className="py-3 px-4 text-center">Stock Actuel</th>
                {canAdjustStock && <th className="py-3 px-4 text-right">Ajustement Rapide</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {filteredClothes.map((item) => {
                const margin = item.price - item.costPrice;
                const marginPct = Math.round((margin / item.price) * 100);
                const isCritical = item.stock <= item.minStockAlert;

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = '/src/assets/images/fashion_robe_soie_1792167170521.jpg';
                          }}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-neutral-200"
                        />
                        <div>
                          <p className="font-bold text-neutral-900">{item.name}</p>
                          <p className="text-[10px] font-mono text-neutral-400">{item.sku}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 capitalize font-medium text-neutral-600">
                      {item.category}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Prix d'achat masqué si non autorisé */}
                    {canViewFinancials && (
                      <td className="py-3 px-4 text-right font-mono text-neutral-500 tabular-nums">
                        {item.costPrice.toLocaleString('fr-FR')} F
                      </td>
                    )}

                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      {item.price.toLocaleString('fr-FR')} F
                    </td>

                    {/* Marge brute masquée si non autorisé */}
                    {canViewFinancials && (
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 font-medium tabular-nums">
                        +{margin.toLocaleString('fr-FR')} F ({marginPct}%)
                      </td>
                    )}

                    <td className="py-3 px-4 text-center">
                      {canAdjustStock && editingStockId === item.id ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={customStockValue}
                            onChange={(e) => setCustomStockValue(parseInt(e.target.value) || 0)}
                            className="w-14 px-2 py-1 border border-neutral-300 rounded font-mono text-xs text-center font-bold"
                          />
                          <button
                            onClick={() => handleSaveStock(item)}
                            className="p-1 rounded bg-neutral-900 text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditStock(item)}
                          disabled={!canAdjustStock}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-transform ${
                            canAdjustStock ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                          } ${
                            item.stock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : isCritical
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-neutral-100 text-neutral-900'
                          }`}
                          title={canAdjustStock ? "Cliquer pour modifier directement le stock" : "Stock disponible"}
                        >
                          <span>{item.stock}</span>
                          {canAdjustStock && <Edit3 className="w-2.5 h-2.5 opacity-60" />}
                        </button>
                      )}
                    </td>

                    {/* Actions d'ajustement rapide masquées si pas inventory.adjust */}
                    {canAdjustStock && (
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => adjustStock(item.id, -1)}
                            disabled={item.stock <= 0}
                            className="px-2 py-1 rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 text-xs font-bold"
                            title="Retirer 1"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => adjustStock(item.id, 1)}
                            className="px-2 py-1 rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-xs font-bold"
                            title="Ajouter 1"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => adjustStock(item.id, 5)}
                            className="px-2 py-1 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 text-[11px] font-bold"
                            title="Réapprovisionner +5"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
