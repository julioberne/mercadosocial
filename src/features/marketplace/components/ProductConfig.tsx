import { Settings, Globe, Image as ImageIcon, Play } from 'lucide-react';
import type { Product, CurrencyCode } from '../../../shared/types';
import { CURRENCY_OPTIONS } from '../../../shared/lib/currency';
import { PixelButton, PixelInput, PixelSelect, PixelTextarea } from '../../../shared/ui';

interface ProductConfigProps {
    isEditing: boolean;
    tempProduct: Product;
    mainCurrency: CurrencyCode;
    ownerPriceDisplay: string;
    onToggleEdit: () => void;
    onMainCurrencyChange: (currency: CurrencyCode) => void;
    onTempProductChange: (updates: Partial<Product>) => void;
    onOwnerPriceChange: (value: string) => void;
    onSave: (e: React.FormEvent) => void;
}

export function ProductConfig({
    isEditing,
    tempProduct,
    mainCurrency,
    ownerPriceDisplay,
    onToggleEdit,
    onMainCurrencyChange,
    onTempProductChange,
    onOwnerPriceChange,
    onSave,
}: ProductConfigProps) {
    return (
        <section className="pixel-panel p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3 font-bold text-base md:text-2xl uppercase tracking-tight">
                    <Settings className="text-[var(--action-blue)]" size={24} />
                    <span className="hidden md:inline">CONFIGURACIÓN PRODUCTO</span>
                    <span className="md:hidden">CONFIG. PRODUCTO</span>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
                    {/* Currency Selector */}
                    <div className="flex items-center gap-1.5 md:gap-2 bg-[var(--background-dots)] px-2 md:px-3 py-1.5 md:py-2 border-2 md:border-4 border-black">
                        <Globe size={16} />
                        <select
                            value={mainCurrency}
                            onChange={(e) => onMainCurrencyChange(e.target.value as CurrencyCode)}
                            className="bg-transparent text-xs md:text-sm font-bold uppercase outline-none cursor-pointer"
                        >
                            {CURRENCY_OPTIONS.map((opt) => (
                                <option key={opt.code} value={opt.code}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Edit Toggle */}
                    <PixelButton
                        variant="blue"
                        onClick={onToggleEdit}
                        className="text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2"
                    >
                        <span className="hidden md:inline">{isEditing ? 'CERRAR' : 'EDITAR PRODUCTO'}</span>
                        <span className="md:hidden">{isEditing ? 'CERRAR' : 'EDITAR'}</span>
                    </PixelButton>
                </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
                <form onSubmit={onSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t-4 border-[var(--background-dots)]">
                    <div className="space-y-4">
                        <PixelInput
                            type="text"
                            placeholder="NOMBRE DEL PRODUCTO"
                            value={tempProduct.name}
                            onChange={(e) => onTempProductChange({ name: e.target.value })}
                            fullWidth
                            required
                        />

                        <PixelTextarea
                            placeholder="DESCRIPCIÓN DETALLADA..."
                            value={tempProduct.description}
                            onChange={(e) => onTempProductChange({ description: e.target.value })}
                            className="w-full h-32"
                            required
                        />

                        <div className="grid grid-cols-3 gap-2">
                            <PixelSelect
                                value={tempProduct.ownerCurrency}
                                onChange={(e) => onTempProductChange({ ownerCurrency: e.target.value as CurrencyCode })}
                                options={CURRENCY_OPTIONS.map((o) => ({ value: o.code, label: o.code }))}
                            />
                            <PixelInput
                                type="text"
                                value={ownerPriceDisplay}
                                onChange={(e) => onOwnerPriceChange(e.target.value)}
                                className="col-span-2 text-right"
                                placeholder="PRECIO"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-3 opacity-40" size={20} />
                            <PixelTextarea
                                placeholder="URLs DE IMÁGENES (separadas por coma)"
                                value={tempProduct.images?.join(', ')}
                                onChange={(e) =>
                                    onTempProductChange({
                                        images: e.target.value
                                            .split(',')
                                            .filter((s) => s.trim() !== '')
                                            .map((s) => s.trim()),
                                    })
                                }
                                className="w-full h-24 pl-10"
                            />
                        </div>

                        <div className="relative">
                            <Play className="absolute left-3 top-3 opacity-40" size={20} />
                            <PixelInput
                                type="text"
                                placeholder="URL DE VIDEO (YouTube)"
                                value={tempProduct.videoUrl}
                                onChange={(e) => onTempProductChange({ videoUrl: e.target.value })}
                                fullWidth
                                className="pl-10"
                            />
                        </div>

                        <PixelButton type="submit" variant="blue" fullWidth>
                            ACTUALIZAR MERCADO SOCIAL
                        </PixelButton>
                    </div>
                </form>
            )}
        </section>
    );
}
