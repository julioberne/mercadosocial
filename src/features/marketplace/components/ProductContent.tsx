/**
 * @ProductContent
 * Módulo de contenido extendido del producto
 * Muestra el contenido detallado con formato tipo documento/artículo
 * Soporta Markdown básico para formateo
 * Expandible/colapsable
 */
import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Tag, Info, CheckCircle, AlertCircle, Star, MessageSquare } from 'lucide-react';
import type { Product } from '../../../shared/types';

interface ProductContentProps {
    product: Product;
}

// Función para parsear markdown mejorado a HTML
function parseMarkdown(text: string): string {
    if (!text) return '';

    let html = text
        // Separadores
        .replace(/^---$/gm, '<hr class="my-6 border-t-2 border-gray-300" />')
        // Headers
        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2 text-gray-800 flex items-center gap-2">▸ $1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-gray-900 border-b-2 border-[var(--action-blue)] pb-2">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900 border-l-4 border-[var(--action-blue)] pl-4">$1</h1>')
        // Citas/Destacados
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[var(--action-orange)] bg-orange-50 pl-4 py-2 my-4 italic text-gray-700">$1</blockquote>')
        // Código inline
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 font-mono text-sm border border-gray-300 rounded">$1</code>')
        // Bold, italic, strikethrough
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold"><em class="italic">$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
        .replace(/~~(.+?)~~/g, '<del class="line-through text-gray-500">$1</del>')
        // Subrayado
        .replace(/__(.+?)__/g, '<span class="underline decoration-2 decoration-[var(--action-blue)]">$1</span>')
        // Destacado/resaltado
        .replace(/==(.+?)==/g, '<mark class="bg-yellow-200 px-1">$1</mark>')
        // Enlaces
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-[var(--action-blue)] underline hover:text-blue-700">$1</a>')
        // Listas con viñetas
        .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc list-inside mb-1">$1</li>')
        // Listas numeradas
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal list-inside mb-1">$1</li>')
        // Checkboxes
        .replace(/^\[x\] (.+)$/gm, '<div class="flex items-center gap-2 mb-1"><span class="text-green-600">☑</span> <span class="line-through text-gray-500">$1</span></div>')
        .replace(/^\[ \] (.+)$/gm, '<div class="flex items-center gap-2 mb-1"><span class="text-gray-400">☐</span> $1</div>')
        // Line breaks
        .replace(/\n\n/g, '</p><p class="mb-4">')
        .replace(/\n/g, '<br/>');

    // Wrap in paragraph if not starting with a block element
    if (!html.startsWith('<h') && !html.startsWith('<li') && !html.startsWith('<blockquote') && !html.startsWith('<hr') && !html.startsWith('<div')) {
        html = '<p class="mb-4">' + html + '</p>';
    }

    return html;
}

// Componente para sección colapsable
function ContentSection({
    title,
    icon: Icon,
    children,
    defaultOpen = true,
    variant = 'default'
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'info';
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const variantStyles = {
        default: 'border-gray-300 bg-white',
        success: 'border-green-400 bg-green-50',
        warning: 'border-yellow-400 bg-yellow-50',
        info: 'border-blue-400 bg-blue-50',
    };

    const iconColors = {
        default: 'text-gray-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600',
    };

    return (
        <div className={`border-2 ${variantStyles[variant]} rounded-none overflow-hidden`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-black/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} className={iconColors[variant]} />
                    <span className="font-bold uppercase text-sm tracking-wide">{title}</span>
                </div>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
            `}>
                <div className="p-4 pt-0 border-t border-gray-200">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Scroll a la sección de opiniones
function scrollToOpinions() {
    const opinionsSection = document.querySelector('[data-section="opinions"]');
    if (opinionsSection) {
        opinionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        // Fallback: buscar por texto
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (section.textContent?.includes('OPINIONES') || section.textContent?.includes('opiniones')) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

export function ProductContent({ product }: ProductContentProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasContent = product.content && product.content.trim().length > 0;

    // Ejemplo de contenido si no hay content definido
    const defaultContent = `
## Descripción Detallada

${product.description}

## Características Principales

- Servicio profesional de alta calidad
- Atención personalizada
- Resultados garantizados
- Soporte continuo

## ¿Qué Incluye?

1. Consulta inicial sin costo
2. Análisis detallado de tu caso
3. Propuesta de solución personalizada
4. Seguimiento hasta la resolución

## Términos y Condiciones

Los precios mostrados son referenciales y pueden variar según la complejidad del caso. 
El precio final se determina mediante el sistema de **Pricing Social** donde la comunidad 
valora el servicio de forma colaborativa.
    `.trim();

    const contentToDisplay = hasContent ? product.content : defaultContent;

    return (
        <section className="pixel-panel p-0 bg-white overflow-hidden">
            {/* Header - Clickable to expand/collapse */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 md:p-6 hover:from-gray-800 hover:to-gray-700 transition-all"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 border-2 border-white/20">
                            <FileText size={24} />
                        </div>
                        <div className="text-left">
                            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight">
                                Información del Producto
                            </h2>
                            <p className="text-xs text-white/60 uppercase tracking-wider">
                                {isExpanded ? 'Click para contraer' : 'Click para ver detalles completos'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white/60 uppercase hidden md:inline">
                            {isExpanded ? 'Contraer' : 'Expandir'}
                        </span>
                        {isExpanded ? (
                            <ChevronUp size={24} className="text-white/80" />
                        ) : (
                            <ChevronDown size={24} className="text-white/80" />
                        )}
                    </div>
                </div>
            </button>

            {/* Content Body - Expandible */}
            <div className={`
                overflow-hidden transition-all duration-500 ease-in-out
                ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
            `}>
                <div className="p-4 md:p-6 space-y-4">
                    {/* Main Content - Parsed Markdown */}
                    <div className="prose prose-sm max-w-none">
                        <div
                            className="text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(contentToDisplay || '') }}
                        />
                    </div>

                    {/* Additional Sections */}
                    <div className="mt-8 space-y-3">
                        <ContentSection
                            title="Garantía del Vendedor"
                            icon={CheckCircle}
                            variant="success"
                            defaultOpen={false}
                        >
                            <p className="text-sm text-gray-700">
                                Este vendedor ofrece garantía de satisfacción. Si no estás conforme con el servicio,
                                puedes solicitar una revisión del caso dentro de los primeros 7 días.
                            </p>
                        </ContentSection>

                        <ContentSection
                            title="Información Importante"
                            icon={AlertCircle}
                            variant="warning"
                            defaultOpen={false}
                        >
                            <p className="text-sm text-gray-700">
                                Los tiempos de entrega pueden variar según la complejidad del proyecto.
                                Contacta al vendedor para obtener un estimado preciso.
                            </p>
                        </ContentSection>

                        <ContentSection
                            title="Sobre el Pricing Social"
                            icon={Info}
                            variant="info"
                            defaultOpen={false}
                        >
                            <p className="text-sm text-gray-700">
                                El precio de este producto/servicio es determinado de forma colaborativa por la comunidad.
                                Los votos y ofertas ayudan a establecer un precio justo basado en la percepción colectiva de valor.
                            </p>
                        </ContentSection>
                    </div>

                    {/* Tags / Categories */}
                    <div className="pt-6 border-t-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag size={16} className="text-gray-500" />
                            <span className="text-xs font-bold uppercase text-gray-500">Categorías</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Servicios', 'Consultoría', 'Premium'].map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-100 border-2 border-gray-300 text-xs font-bold uppercase text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Rating Summary */}
                    <div className="pt-4 border-t-2 border-gray-200">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                                <span className="font-bold">4.8</span>
                                <span className="text-sm text-gray-500">(127 valoraciones)</span>
                            </div>
                            <button
                                onClick={scrollToOpinions}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--action-blue)] text-white text-xs font-bold uppercase border-2 border-black hover:bg-[var(--action-blue)]/90 transition-colors"
                            >
                                <MessageSquare size={14} />
                                Ver todas las opiniones
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collapsed Preview - Muestra preview de texto + resumen */}
            {!isExpanded && (
                <div className="border-t border-gray-200">
                    {/* Preview del contenido - 500 caracteres */}
                    <div className="p-4 md:p-6 relative">
                        <div className="relative overflow-hidden" style={{ maxHeight: '150px' }}>
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                {(contentToDisplay || '').replace(/[#*\-\d.]/g, '').substring(0, 500)}
                                {(contentToDisplay || '').length > 500 && '...'}
                            </p>
                            {/* Gradient fade */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                        </div>
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="mt-4 flex items-center gap-2 text-[var(--action-blue)] font-bold text-sm uppercase hover:underline"
                        >
                            <ChevronDown size={16} />
                            Leer más información
                        </button>
                    </div>

                    {/* Mini resumen con rating y tags */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-sm">4.8</span>
                                </div>
                                <span className="text-xs text-gray-500">127 opiniones</span>
                                <div className="hidden md:flex items-center gap-2">
                                    {['Servicios', 'Consultoría'].map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 bg-gray-200 text-[10px] font-bold uppercase text-gray-600"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={scrollToOpinions}
                                className="text-xs font-bold text-[var(--action-blue)] uppercase hover:underline flex items-center gap-1"
                            >
                                <MessageSquare size={12} />
                                Ver opiniones
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
