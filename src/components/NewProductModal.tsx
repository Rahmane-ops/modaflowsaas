import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Plus, 
  Sparkles, 
  Image as ImageIcon, 
  Check, 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  Camera, 
  AlertCircle,
  FileImage,
  RefreshCw
} from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImageMode = 'upload' | 'url' | 'presets';

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addClothingItem, hasPermission } = useStore();
  const canCreate = hasPermission('products.create');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'robes' | 'hauts' | 'ensembles' | 'pantalons' | 'combinaisons' | 'accessoires'>('robes');
  const [price, setPrice] = useState<number>(35000);
  const [costPrice, setCostPrice] = useState<number>(18000);
  const [stock, setStock] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(3);
  const [sizesInput, setSizesInput] = useState('S, M, L, XL');
  const [colorsInput, setColorsInput] = useState('Noir, Doré');
  const [description, setDescription] = useState('');

  // Photo management state
  const [imageMode, setImageMode] = useState<ImageMode>('upload');
  const [selectedImage, setSelectedImage] = useState<string>(
    '/src/assets/images/fashion_robe_soie_1792167170521.jpg'
  );
  const [customPhotoName, setCustomPhotoName] = useState<string | null>(null);
  const [customPhotoSize, setCustomPhotoSize] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const availableImages = [
    { label: 'Robe Soie Émeraude & Or', path: '/src/assets/images/fashion_robe_soie_1792167170521.jpg' },
    { label: 'Ensemble Lin Naturel', path: '/src/assets/images/fashion_ensemble_lin_1792167171162.jpg' },
    { label: 'Robe Wax Royale', path: '/src/assets/images/fashion_robe_wax_1792167171270.jpg' },
    { label: 'Haut Satin Col Bénitier', path: '/src/assets/images/fashion_haut_satin_1792167171255.jpg' },
  ];

  /**
   * Optimizes and resizes any image from the user's phone or computer
   * down to max 1000px dimension and converts to JPEG Base64.
   * This guarantees instant display in POS/Catalog and prevents exceeding Firestore document limits.
   */
  const processImageFile = (file: File): Promise<{ dataUrl: string; sizeFormatted: string }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error("Le fichier sélectionné n'est pas une image valide (JPG, PNG, WebP requis)."));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 900;
          const MAX_HEIGHT = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const rawUrl = e.target?.result as string;
            resolve({ dataUrl: rawUrl, sizeFormatted: `${Math.round(file.size / 1024)} Ko` });
            return;
          }

          // Clean white canvas background for transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to lightweight JPEG (quality 0.82)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          const approximateSizeKb = Math.round((dataUrl.length * (3 / 4)) / 1024);
          resolve({ dataUrl, sizeFormatted: `~${approximateSizeKb} Ko optimisé` });
        };
        img.onerror = () => reject(new Error("Impossible de décoder le format de l'image."));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier."));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelection = async (file: File) => {
    setImageError(null);
    setIsProcessingImage(true);
    try {
      const result = await processImageFile(file);
      setSelectedImage(result.dataUrl);
      setCustomPhotoName(file.name);
      setCustomPhotoSize(result.sizeFormatted);
    } catch (err: any) {
      setImageError(err.message || "Erreur lors de l'import de la photo.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setImageError(null);

    // Test image loading
    const img = new Image();
    img.onload = () => {
      setSelectedImage(urlInput.trim());
      setCustomPhotoName('Lien externe');
      setCustomPhotoSize('Web URL');
    };
    img.onerror = () => {
      setImageError("Impossible de charger l'image depuis cette URL. Vérifiez le lien.");
    };
    img.src = urlInput.trim();
  };

  const handleResetImage = () => {
    setSelectedImage(availableImages[0].path);
    setCustomPhotoName(null);
    setCustomPhotoSize(null);
    setUrlInput('');
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      alert("Accès refusé : vous n'avez pas la permission 'products.create' pour ajouter un article.");
      return;
    }
    if (!name.trim()) return;

    const sizes = sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const colors = colorsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    addClothingItem({
      name: name.trim(),
      category,
      price: Number(price),
      costPrice: Number(costPrice),
      stock: Number(stock),
      minStockAlert: Number(minStockAlert),
      sizes: sizes.length ? sizes : ['Standard'],
      colors: colors.length ? colors : ['Unique'],
      description: description.trim() || 'Modèle confectionné avec soin dans notre atelier.',
      imageUrl: selectedImage || availableImages[0].path,
    });

    onClose();
  };

  const isCustomUploaded = selectedImage.startsWith('data:');
  const isExternalUrl = selectedImage.startsWith('http');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span>Ajouter un Nouveau Vêtement</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Catalogue & Stock
              </span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Importez la photo du vêtement, définissez la catégorie, les prix et le stock initial.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Section: Nom du modèle */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Nom du modèle / vêtement *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Robe Portefeuille Satin Soie"
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Section: Catégorie & Stock initial */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none capitalize"
              >
                <option value="robes">Robes</option>
                <option value="hauts">Hauts & Chemisiers</option>
                <option value="ensembles">Ensembles</option>
                <option value="pantalons">Pantalons</option>
                <option value="combinaisons">Combinaisons</option>
                <option value="accessoires">Accessoires</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Stock initial (pièces) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Prix client & Prix d'achat */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Prix de vente client (FCFA) *
              </label>
              <input
                type="number"
                step="500"
                required
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-mono font-bold text-neutral-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Prix de revient / Achat (FCFA) *
              </label>
              <input
                type="number"
                step="500"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Tailles & Couleurs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Tailles disponibles (séparées par virgule)
              </label>
              <input
                type="text"
                value={sizesInput}
                onChange={(e) => setSizesInput(e.target.value)}
                placeholder="Ex: S, M, L, XL"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Coloris disponibles
              </label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                placeholder="Ex: Noir, Émeraude"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* PHOTO DU VÊTEMENT (Import local, Lien web, Modèles)      */}
          {/* ======================================================== */}
          <div className="pt-2 border-t border-neutral-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Photo du vêtement *</span>
              </label>

              {/* Source tabs */}
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                    imageMode === 'upload'
                      ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Importer photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                    imageMode === 'url'
                      ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>Lien URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('presets')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                    imageMode === 'presets'
                      ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Modèles</span>
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {imageError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* TAB 1: UPLOAD DEPUIS L'APPAREIL / SMARTPHONE / ORDINATEUR */}
            {imageMode === 'upload' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif, image/heic, image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                      : 'border-neutral-300 hover:border-blue-400 bg-neutral-50/60 hover:bg-neutral-50'
                  }`}
                >
                  {isProcessingImage ? (
                    <div className="py-4 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                      <p className="font-semibold text-neutral-800">Optimisation de l'image en cours...</p>
                      <p className="text-[11px] text-neutral-500">Compression haute définition pour le catalogue</p>
                    </div>
                  ) : (
                    <div className="py-2 flex flex-col items-center justify-center gap-1.5">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-neutral-900 text-xs">
                        Cliquez pour choisir une photo ou glissez-déposez ici
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Compatible appareil photo smartphone, JPG, PNG, WebP
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[11px] shadow-2xs">
                        <Camera className="w-3.5 h-3.5" />
                        Parcourir vos photos
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: LIEN URL WEB */}
            {imageMode === 'url' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://exemple.com/photos/robe-wax.jpg"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Valider
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Collez un lien d'image direct hébergé en ligne (Unsplash, Pinterest, Cloud, etc.).
                </p>
              </div>
            )}

            {/* TAB 3: MODÈLES PAR DÉFAUT */}
            {imageMode === 'presets' && (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {availableImages.map((img) => {
                    const isSelected = selectedImage === img.path;
                    return (
                      <button
                        key={img.path}
                        type="button"
                        onClick={() => {
                          setSelectedImage(img.path);
                          setCustomPhotoName(img.label);
                          setCustomPhotoSize(null);
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-600/30 scale-95 shadow-xs'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:scale-[1.02]'
                        }`}
                        title={img.label}
                      >
                        <img
                          src={img.path}
                          alt={img.label}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-900/40 flex items-center justify-center text-white">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-neutral-500">
                  Sélectionnez un modèle prédéfini si vous n'avez pas de photo immédiatement disponible.
                </p>
              </div>
            )}

            {/* APERÇU EN DIRECT DU VISUEL RETENU */}
            <div className="mt-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-neutral-200 shrink-0 relative shadow-2xs">
                  <img
                    src={selectedImage}
                    alt="Aperçu vêtement"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.src = availableImages[0].path;
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-neutral-900 text-xs">Aperçu catalogue</span>
                    {isCustomUploaded ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Photo importée
                      </span>
                    ) : isExternalUrl ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        Lien Web
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                        Modèle prédéfini
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {customPhotoName || 'Modèle standard sélectionné'}
                    {customPhotoSize ? ` · ${customPhotoSize}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isCustomUploaded || isExternalUrl ? (
                  <button
                    type="button"
                    onClick={handleResetImage}
                    className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-rose-50 text-neutral-600 hover:text-rose-600 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Réinitialiser l'image par défaut"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Retirer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('upload');
                      fileInputRef.current?.click();
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Changer</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Section: Description */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Description de la coupe & matière :
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Confection soignée, tombé élégant, tissu satiné idéal pour cérémonies et soirées."
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Alert if no permission */}
          {!canCreate && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <span className="font-bold">Accès Restreint :</span> Votre profil ne dispose pas de la permission "products.create". Enregistrement bloqué.
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="submit"
              disabled={!canCreate || isProcessingImage}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                canCreate && !isProcessingImage
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-98' 
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer le vêtement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
