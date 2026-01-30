/**
 * @RichTextEditor
 * Editor de texto con barra de herramientas para formato markdown
 */
import { useRef, useCallback } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Link2,
    Heading1,
    Heading2,
    Heading3,
    Minus,
    Highlighter,
    CheckSquare,
    Code
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
    placeholder?: string;
    className?: string;
}

// Definición de botones de formato
const FORMAT_BUTTONS = [
    { icon: Heading1, label: 'Título', prefix: '# ', suffix: '', tooltip: 'Título grande' },
    { icon: Heading2, label: 'Subtítulo', prefix: '## ', suffix: '', tooltip: 'Subtítulo' },
    { icon: Heading3, label: 'Sección', prefix: '### ', suffix: '', tooltip: 'Sección pequeña' },
    { divider: true },
    { icon: Bold, label: 'Negrita', prefix: '**', suffix: '**', tooltip: 'Negrita' },
    { icon: Italic, label: 'Cursiva', prefix: '*', suffix: '*', tooltip: 'Cursiva' },
    { icon: Underline, label: 'Subrayado', prefix: '__', suffix: '__', tooltip: 'Subrayado' },
    { icon: Strikethrough, label: 'Tachado', prefix: '~~', suffix: '~~', tooltip: 'Tachado' },
    { icon: Highlighter, label: 'Resaltado', prefix: '==', suffix: '==', tooltip: 'Resaltado amarillo' },
    { divider: true },
    { icon: List, label: 'Lista', prefix: '- ', suffix: '', tooltip: 'Lista con viñetas' },
    { icon: ListOrdered, label: 'Numerada', prefix: '1. ', suffix: '', tooltip: 'Lista numerada' },
    { icon: CheckSquare, label: 'Checkbox', prefix: '[ ] ', suffix: '', tooltip: 'Checkbox' },
    { divider: true },
    { icon: Quote, label: 'Cita', prefix: '> ', suffix: '', tooltip: 'Cita/destacado' },
    { icon: Code, label: 'Código', prefix: '`', suffix: '`', tooltip: 'Código' },
    { icon: Link2, label: 'Enlace', prefix: '[', suffix: '](url)', tooltip: 'Enlace' },
    { icon: Minus, label: 'Línea', prefix: '\n---\n', suffix: '', tooltip: 'Línea separadora' },
];

export function RichTextEditor({
    value,
    onChange,
    maxLength = 2500,
    placeholder = '',
    className = ''
}: RichTextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Insertar formato en la posición del cursor
    const insertFormat = useCallback((prefix: string, suffix: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const beforeText = value.substring(0, start);
        const afterText = value.substring(end);

        let newText: string;
        let newCursorPos: number;

        if (selectedText) {
            // Hay texto seleccionado: envolver con formato
            newText = beforeText + prefix + selectedText + suffix + afterText;
            newCursorPos = start + prefix.length + selectedText.length + suffix.length;
        } else {
            // No hay selección: insertar placeholder
            const placeholder = suffix ? 'texto' : '';
            newText = beforeText + prefix + placeholder + suffix + afterText;
            newCursorPos = start + prefix.length + placeholder.length;
        }

        // Verificar límite
        if (newText.length <= maxLength) {
            onChange(newText);
            // Restaurar foco y posición del cursor
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        }
    }, [value, onChange, maxLength]);

    // Calcular porcentaje usado
    const usedPercentage = (value.length / maxLength) * 100;
    const getCounterColor = () => {
        if (usedPercentage >= 100) return 'text-red-500';
        if (usedPercentage >= 90) return 'text-orange-500';
        return 'text-gray-500';
    };

    return (
        <div className={`border-4 border-black bg-white ${className}`}>
            {/* Barra de herramientas */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-100 border-b-2 border-black">
                {FORMAT_BUTTONS.map((btn, index) => {
                    if ('divider' in btn) {
                        return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
                    }
                    const Icon = btn.icon;
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => insertFormat(btn.prefix, btn.suffix)}
                            className="p-1.5 hover:bg-gray-200 border border-transparent hover:border-gray-400 transition-colors"
                            title={btn.tooltip}
                        >
                            <Icon size={16} className="text-gray-700" />
                        </button>
                    );
                })}
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                    const text = e.target.value.slice(0, maxLength);
                    onChange(text);
                }}
                maxLength={maxLength}
                placeholder={placeholder}
                className="w-full h-48 p-4 font-mono text-sm resize-none focus:outline-none"
            />

            {/* Footer con contador y ayuda */}
            <div className="flex justify-between items-center p-2 bg-gray-50 border-t-2 border-gray-200 text-xs">
                <div className="flex flex-wrap gap-2 text-gray-500">
                    <span><code className="bg-gray-200 px-1">#</code> Título</span>
                    <span><code className="bg-gray-200 px-1">**</code> Negrita</span>
                    <span><code className="bg-gray-200 px-1">-</code> Lista</span>
                    <span><code className="bg-gray-200 px-1">&gt;</code> Cita</span>
                </div>
                <span className={`font-bold ${getCounterColor()}`}>
                    {value.length}/{maxLength}
                </span>
            </div>
        </div>
    );
}
