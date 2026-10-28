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
  Lock,
  X,
  Hash,
  Boxes,
  Trash2
} from 'lucide-react';
import { ClothingCategory, ClothingItem } from '../types';

interface InventoryViewProps {
  onOpenNewProduct: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenNewProduct }) => {
  const { clothes, adjustStock, updateClothingItem, currentUser, hasPermission } = useStore();

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

  // Size stock management modal state
  const [sizeModalItem, setSizeModalItem] = useState<ClothingItem | null>(null);
  const [modalSizeStock, setModalSizeStock] = useState<Record<string, number>>({});
  const [modalSizes, setModalSizes] = useState<string[]>([]);
  const [newModalSize, setNewModalSize] = useState('');
  const [isSavingSizeStock, setIsSavingSizeStock] = useState(false);

  const handleOpenSizeModal = (item: ClothingItem) => {
    setSizeModalItem(item);
    const szList = (item.sizes && item.sizes.length > 0) ? item.sizes : ['36', '38', '40', '42'];
    setModalSizes(szList);
    const initialMap: Record<string, number> = {};
    szList.forEach((sz) => {
      initialMap[sz] = item.sizeStock?.[sz] ?? Math.max(0, Math.floor(item.stock / szList.length));
    });
    setModalSizeStock(initialMap);
  };

  const handleModalSizeQtyChange = (size: string, qty: number) => {
    setModalSizeStock((prev) => ({
      ...prev,
      [size]: Math.max(0, qty),
    }));
  };

  const handleModalAddSize = () => {
    const clean = newModalSize.trim().replace(/^T\./i, '');
    if (!clean) return;
    if (!modalSizes.includes(clean)) {
      const updatedSizes = [...modalSizes, clean].sort((a, b) => (Number(a) || 0) - (Number(b) || 0));
      setModalSizes(updatedSizes);
      setModalSizeStock((prev) => ({ ...prev, [clean]: 2 }));
    }
    setNewModalSize('');
  };

  const handleModalRemoveSize = (size: string) => {
    const updatedSizes = modalSizes.filter((s) => s !== size);
    setModalSizes(updatedSizes);
    const updatedMap = { ...modalSizeStock };
    delete updatedMap[size];
    setModalSizeStock(updatedMap);
  };

  const handleSaveModalSizeStock = async () => {
    if (!sizeModalItem) return;
    setIsSavingSizeStock(true);
    try {
      const newTotalStock = Object.values(modalSizeStock).reduce((a, b) => a + b, 0);
      await updateClothingItem(sizeModalItem.id, {
        sizes: modalSizes.length ? modalSizes : ['38'],
        sizeStock: modalSizeStock,
        stock: newTotalStock,
      });
      setSizeModalItem(null);
    } catch (err: any) {
      alert(`Erreur lors de l'enregistrement : ${err.message || err}`);
    } finally {
      setIsSavingSizeStock(false);
    }
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
                <th className="py-3 px-4">Tailles & Stock par taille</th>
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.sizes.map((s) => {
                          const qty = item.sizeStock?.[s];
                          const isZero = typeof qty === 'number' && qty <= 0;
                          return (
                            <span
                              key={s}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                isZero
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-blue-50 text-blue-900 border-blue-200/80'
                              }`}
                              title={typeof qty === 'number' ? `Taille ${s} : ${qty} pièces disponibles` : `Taille ${s}`}
                            >
                              <span>T.{s}</span>
                              {typeof qty === 'number' && (
                                <span className={`font-mono text-[9px] px-1 rounded-xs ${isZero ? 'bg-rose-100 text-rose-800' : 'bg-white text-blue-800 font-bold'}`}>
                                  {qty}
                                </span>
                              )}
                            </span>
                          );
                        })}
                        {canAdjustStock && (
                          <button
                            type="button"
                            onClick={() => handleOpenSizeModal(item)}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                            title="Gérer les stocks par taille numérique"
                          >
                            + Gérer
                          </button>
                        )}
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

      {/* Size Stock Management Modal */}
      {sizeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={sizeModalItem.imageUrl}
                  alt={sizeModalItem.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {sizeModalItem.sku} · {sizeModalItem.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {sizeModalItem.name}
                  </h3>
                  <p className="text-xs font-bold text-blue-700 font-mono mt-0.5">
                    {sizeModalItem.price.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSizeModalItem(null)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-blue-600" />
                    <span>Stocks par taille numérique (32, 36, 42...)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Modifiez le nombre de pièces disponibles pour chaque taille.
                  </p>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-blue-700" />
                  <span className="font-bold text-xs">
                    {Object.values(modalSizeStock).reduce((a, b) => a + b, 0)} pcs total
                  </span>
                </div>
              </div>

              {/* Sizes list */}
              <div className="space-y-2">
                {modalSizes.map((sz) => {
                  const qty = modalSizeStock[sz] ?? 0;
                  return (
                    <div
                      key={sz}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold font-mono text-xs flex items-center justify-center shadow-2xs">
                          {sz}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Taille {sz}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {qty > 0 ? `${qty} en stock` : 'Rupture'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleModalSizeQtyChange(sz, Math.max(0, qty - 1))}
                          className="w-7 h-7 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) => handleModalSizeQtyChange(sz, parseInt(e.target.value) || 0)}
                          className="w-14 px-2 py-1 rounded-lg border border-slate-300 bg-white text-center font-mono font-bold text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleModalSizeQtyChange(sz, qty + 1)}
                          className="w-7 h-7 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModalRemoveSize(sz)}
                          className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center ml-1 cursor-pointer"
                          title="Supprimer cette taille"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add size inline */}
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={newModalSize}
                  onChange={(e) => setNewModalSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleModalAddSize();
                    }
                  }}
                  placeholder="Nouvelle taille chiffrée (ex: 34, 44, 46...)"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs flex-1 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleModalAddSize}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

            {/* Footer actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSizeModalItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSavingSizeStock}
                onClick={handleSaveModalSizeStock}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingSizeStock ? 'Enregistrement...' : 'Enregistrer les stocks'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
