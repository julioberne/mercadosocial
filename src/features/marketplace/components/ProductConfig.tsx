import { Settings, Globe, Play, Upload, Type, FileText, Info } from 'lucide-react';
import type { Product, CurrencyCode } from '../../../shared/types';
import { CURRENCY_OPTIONS } from '../../../shared/lib/currency';
import { PixelButton, PixelInput, PixelSelect, PixelTextarea, ImageUploader, RichTextEditor } from '../../../shared/ui';

// Límites de caracteres
const LIMITS = {
    title: 100,
    description: 200,
    content: 2500,
};

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

// Componente para mostrar contador de caracteres
function CharCounter({ current, max }: { current: number; max: number }) {
    const percentage = (current / max) * 100;
    return (
        <span className={`font-bold text-xs ${percentage >= 100
            ? 'text-red-500'
            : percentage >= 90
                ? 'text-orange-500'
                : 'text-gray-500'
            }`}>
            {current}/{max}
        </span>
    );
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
                <form onSubmit={onSave} className="space-y-6 pt-4 border-t-4 border-[var(--background-dots)]">

                    {/* Grid de 2 columnas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Columna Izquierda: Info básica */}
                        <div className="space-y-5">

                            {/* TÍTULO */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                                    <Type size={16} className="text-[var(--action-blue)]" />
                                    Título del Producto
                                </label>
                                <PixelInput
                                    type="text"
                                    placeholder="Nombre del producto o servicio..."
                                    value={tempProduct.name}
                                    onChange={(e) => {
                                        const text = e.target.value.slice(0, LIMITS.title);
                                        onTempProductChange({ name: text });
                                    }}
                                    maxLength={LIMITS.title}
                                    fullWidth
                                    required
                                />
                                <div className="flex justify-end">
                                    <CharCounter current={tempProduct.name.length} max={LIMITS.title} />
                                </div>
                            </div>

                            {/* DESCRIPCIÓN */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                                    <FileText size={16} className="text-[var(--action-orange)]" />
                                    Descripción Corta
                                </label>
                                <PixelTextarea
                                    placeholder="Resumen breve del producto (se muestra en la vista previa)..."
                                    value={tempProduct.description}
                                    onChange={(e) => {
                                        const text = e.target.value.slice(0, LIMITS.description);
                                        onTempProductChange({ description: text });
                                    }}
                                    maxLength={LIMITS.description}
                                    className="w-full h-20"
                                    required
                                />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Vista previa del producto</span>
                                    <CharCounter current={tempProduct.description.length} max={LIMITS.description} />
                                </div>
                            </div>

                            {/* PRECIO */}
                            <div className="space-y-2">
                                <label className="font-bold text-sm uppercase text-gray-700">
                                    💰 Precio Base
                                </label>
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
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* VIDEO */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                                    <Play size={16} className="text-red-500" />
                                    Video (YouTube)
                                </label>
                                <PixelInput
                                    type="text"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={tempProduct.videoUrl}
                                    onChange={(e) => onTempProductChange({ videoUrl: e.target.value })}
                                    fullWidth
                                />
                            </div>
                        </div>

                        {/* Columna Derecha: Media */}
                        <div className="space-y-5">
                            {/* @ProductMediaUploader */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                                    <Upload size={16} className="text-[var(--success-green)]" />
                                    Media del Producto
                                </label>
                                <ImageUploader
                                    images={tempProduct.images || []}
                                    onImagesChange={(images) => onTempProductChange({ images })}
                                    maxFiles={6}
                                    maxSizeMB={10}
                                />
                            </div>
                        </div>
                    </div>

                    {/* INFORMACIÓN DEL PRODUCTO - Editor con barra de herramientas */}
                    <div className="space-y-2 pt-4 border-t-2 border-gray-200">
                        <label className="flex items-center gap-2 font-bold text-sm uppercase text-gray-700">
                            <Info size={16} className="text-purple-600" />
                            Información del Producto
                            <span className="text-xs font-normal text-gray-500 ml-2">(usa los botones para dar formato)</span>
                        </label>
                        <RichTextEditor
                            value={tempProduct.content || ''}
                            onChange={(content) => onTempProductChange({ content })}
                            maxLength={LIMITS.content}
                            placeholder="Escribe aquí la información detallada del producto...

Usa los botones de la barra de herramientas para dar formato:
• Títulos y subtítulos
• Negrita, cursiva, subrayado
• Listas con viñetas o numeradas
• Citas destacadas
• Enlaces y más..."
                        />
                    </div>

                    {/* Botón Submit */}
                    <div className="pt-4">
                        <PixelButton type="submit" variant="blue" fullWidth className="py-4 text-base">
                            ✓ GUARDAR CAMBIOS
                        </PixelButton>
                    </div>
                </form>
            )}
        </section>
    );
}
