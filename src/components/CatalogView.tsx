import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Search, 
  Filter, 
  Plus, 
  ShoppingBag, 
  Check, 
  SlidersHorizontal, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ClothingCategory, ClothingItem } from '../types';

interface CatalogViewProps {
  onOpenNewProduct: () => void;
  onOpenCart: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ onOpenNewProduct, onOpenCart }) => {
  const { clothes, addToCart, cartItemCount, cartTotal, currentUser, hasPermission } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory>('tous');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under25k' | '25to40k' | 'above40k'>('all');
  
  // Size selection modal / state
  const [selectedItemForSize, setSelectedItemForSize] = useState<ClothingItem | null>(null);
  const [chosenSize, setChosenSize] = useState<string>('');
  const [chosenQty, setChosenQty] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories: { id: ClothingCategory; label: string }[] = [
    { id: 'tous', label: 'Tous les articles' },
    { id: 'robes', label: 'Robes' },
    { id: 'hauts', label: 'Hauts & Chemisiers' },
    { id: 'ensembles', label: 'Ensembles' },
    { id: 'pantalons', label: 'Pantalons' },
    { id: 'combinaisons', label: 'Combinaisons' },
  ];

  const filteredClothes = useMemo(() => {
    return clothes.filter((item) => {
      // Category filter
      if (selectedCategory !== 'tous' && item.category !== selectedCategory) {
        return false;
      }
      // Price filter
      if (priceFilter === 'under25k' && item.price >= 25000) return false;
      if (priceFilter === '25to40k' && (item.price < 25000 || item.price > 40000)) return false;
      if (priceFilter === 'above40k' && item.price <= 40000) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSku = item.sku.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        return matchesName || matchesSku || matchesDesc || matchesCategory;
      }
      return true;
    });
  }, [clothes, selectedCategory, priceFilter, searchQuery]);

  const handleOpenAddModal = (item: ClothingItem) => {
    if (item.stock <= 0) return;
    setSelectedItemForSize(item);
    setChosenSize(item.sizes[0] || 'Standard');
    setChosenQty(1);
  };

  const handleConfirmAdd = () => {
    if (!selectedItemForSize) return;
    addToCart(selectedItemForSize, chosenSize, chosenQty);
    setToastMessage(`✓ ${chosenQty}x ${selectedItemForSize.name} (${chosenSize}) ajouté au panier !`);
    setSelectedItemForSize(null);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const canCreateProduct = hasPermission('products.create');

  return (
    <div className="pb-24 lg:pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-neutral-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-medium border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Caisse & Prise de Commande
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Sélectionnez les articles, vérifiez le stock en direct et initiez l'encaissement client.
          </p>
        </div>

        {canCreateProduct && (
          <button
            onClick={onOpenNewProduct}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau vêtement</span>
          </button>
        )}
      </div>

      {/* Filtering Section: Search & Categories & Price */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 mb-6 shadow-2xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, catégorie (robe, chemise...), référence SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Prix :
          </span>
          <button
            onClick={() => setPriceFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              priceFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous les prix
          </button>
          <button
            onClick={() => setPriceFilter('under25k')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              priceFilter === 'under25k'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            &lt; 25 000 FCFA
          </button>
          <button
            onClick={() => setPriceFilter('25to40k')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              priceFilter === '25to40k'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            25 000 à 40 000 FCFA
          </button>
          <button
            onClick={() => setPriceFilter('above40k')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              priceFilter === 'above40k'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            &gt; 40 000 FCFA
          </button>

          <span className="text-xs text-slate-500 ml-auto tabular-nums">
            {filteredClothes.length} vêtement{filteredClothes.length > 1 ? 's' : ''} trouvé{filteredClothes.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Clothes Grid */}
      {filteredClothes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <p className="text-sm font-semibold text-neutral-900">Aucun article ne correspond à votre filtre</p>
          <p className="text-xs text-neutral-500 mt-1">
            Essayez de réinitialiser vos critères de prix ou de catégorie.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('tous');
              setPriceFilter('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-medium transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClothes.map((item) => {
            const isOutOfStock = item.stock <= 0;
            const isLowStock = item.stock > 0 && item.stock <= item.minStockAlert;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-all shadow-xs group"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = '/src/assets/images/fashion_robe_soie_1792167170521.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Stock status tag */}
                    <div className="absolute top-3 right-3">
                      {isOutOfStock ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                          Rupture
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 shadow-xs">
                          Plus que {item.stock} en stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/90 backdrop-blur-md text-neutral-800 shadow-xs tabular-nums">
                          {item.stock} en stock
                        </span>
                      )}
                    </div>

                    {/* Category kicker */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-medium tracking-wider">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 text-xs text-neutral-400 mb-1">
                      <span className="font-mono text-[11px]">{item.sku}</span>
                      <span>{item.colors.join(' · ')}</span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Sizes chips */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold text-neutral-400">Tailles :</span>
                      {item.sizes.map((size) => (
                        <span
                          key={size}
                          className="px-1.5 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-neutral-700 text-[10px] font-medium"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer with Price and Action */}
                <div className="p-4 pt-2 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase text-neutral-400 font-semibold tracking-wider block">
                      Prix Vente
                    </span>
                    <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">
                      {item.price.toLocaleString('fr-FR')} <span className="text-xs font-medium font-sans">FCFA</span>
                    </span>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => handleOpenAddModal(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Commander</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Select Size & Quantity */}
      {selectedItemForSize && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start gap-4">
              <img
                src={selectedItemForSize.imageUrl}
                alt={selectedItemForSize.name}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-neutral-100"
              />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  {selectedItemForSize.category} · {selectedItemForSize.sku}
                </span>
                <h3 className="text-base font-bold text-neutral-900 leading-snug">
                  {selectedItemForSize.name}
                </h3>
                <p className="text-sm font-bold text-neutral-900 font-mono mt-1">
                  {selectedItemForSize.price.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>

            {/* Size selection */}
            <div className="mt-5">
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Choisir la taille :
              </label>
              <div className="grid grid-cols-4 gap-2">
                {selectedItemForSize.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setChosenSize(size)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      chosenSize === size
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-2">
                <span>Quantité :</span>
                <span className="text-neutral-500 font-normal">
                  Dispo : {selectedItemForSize.stock} pièces
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChosenQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  -
                </button>
                <span className="text-base font-bold font-mono text-neutral-900 w-12 text-center">
                  {chosenQty}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setChosenQty((q) => Math.min(selectedItemForSize.stock, q + 1))
                  }
                  className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  +
                </button>
                <div className="ml-auto text-right">
                  <span className="text-[10px] text-neutral-400 block uppercase font-medium">Sous-total</span>
                  <span className="text-sm font-bold font-mono text-neutral-900">
                    {(selectedItemForSize.price * chosenQty).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedItemForSize(null)}
                className="flex-1 py-3 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-1 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ajouter au panier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Quick Cart Bar on Mobile when items in cart */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 z-30 max-w-lg mx-auto">
          <div className="bg-neutral-900 text-white rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4 border border-neutral-700 animate-in slide-in-from-bottom-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 font-bold flex items-center justify-center tabular-nums">
                {cartItemCount}
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 leading-none">Panier en cours</p>
                <p className="text-sm font-bold font-mono text-white mt-0.5">
                  {cartTotal.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="px-4 py-2 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <span>Finaliser la commande</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
