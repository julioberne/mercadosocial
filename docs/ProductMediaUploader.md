# 📸 @ProductMediaUploader

## Documentación del Módulo de Media del Producto

### Descripción
Sistema completo para gestionar imágenes y modelos 3D de productos en Mercado Social. 
Incluye dos componentes principales que trabajan juntos.

---

## 📦 Componentes

### 1. `ImageUploader` (@ProductMediaUploader)
**Ubicación:** `src/shared/ui/ImageUploader.tsx`

Componente para **subir, eliminar y reorganizar** archivos multimedia.

#### Características:
| Función | Descripción |
|---------|-------------|
| **Subir archivos** | Drag & drop, click, o cámara (móvil) |
| **Eliminar** | Botón de eliminar visible en hover |
| **Reorganizar** | Drag & drop o botones ↑↓ |
| **Preview** | Vista previa de imágenes y placeholder para 3D |
| **Imagen principal** | Primera imagen marcada con ★ PRINCIPAL |

#### Formatos Soportados:
| Tipo | Extensiones |
|------|-------------|
| Imágenes | PNG, JPG, JPEG, WebP, GIF |
| Modelos 3D | GLB, GLTF |

#### Props:
```typescript
interface MediaUploaderProps {
    images: string[];                    // Array de URLs de archivos
    onImagesChange: (images: string[]) => void;  // Callback cuando cambia
    maxFiles?: number;                   // Máximo de archivos (default: 6)
    maxSizeMB?: number;                  // Tamaño máximo por archivo (default: 10)
}
```

#### Uso:
```tsx
<ImageUploader
    images={product.images}
    onImagesChange={(images) => updateProduct({ images })}
    maxFiles={6}
    maxSizeMB={10}
/>
```

---

### 2. `MediaGallery` (@ProductMediaGallery)
**Ubicación:** `src/features/marketplace/components/MediaGallery.tsx`

Galería de visualización del producto con **slider/swipe**.

#### Características:
| Función | Descripción |
|---------|-------------|
| **Swipe táctil** | Deslizar izquierda/derecha en móvil |
| **Arrastrar** | Click + arrastrar en desktop |
| **Flechas** | Botones de navegación en hover |
| **Thumbnails** | Miniaturas clicables con scroll horizontal |
| **Video** | Soporte para YouTube embebido |
| **Contador** | Muestra "1 / N" en esquina superior |

#### Props:
```typescript
interface MediaGalleryProps {
    product: Product;           // Producto con images[] y videoUrl
    currentIndex: number;       // Índice actual
    onPrev: () => void;        // Ir a anterior
    onNext: () => void;        // Ir a siguiente
    onSelect: (index: number) => void;  // Seleccionar específico
}
```

---

## 🗄️ Configuración de Base de Datos

### Supabase Storage
Ejecutar `db_storage_setup.sql` en SQL Editor de Supabase:

```sql
-- Crea bucket 'product-images' con:
-- - Formatos: PNG, JPG, JPEG, WebP, GIF, GLB, GLTF
-- - Tamaño máximo: 10MB
-- - Acceso público para lectura
-- - Políticas de insert/delete
```

---

## 🎨 Estilos y UX

### Uploader
- **Área de drop**: Borde punteado, cambia a azul al arrastrar
- **Imágenes**: Cuadrícula 2col (móvil) / 3col (desktop)
- **Hover**: Muestra botones de eliminar y mover
- **Primera imagen**: Destacada con borde azul y badge "★ PRINCIPAL"

### Gallery
- **Swipe**: Feedback visual con gradiente direccional
- **Transición**: Suave al cambiar de imagen
- **Thumbnails**: Scroll horizontal si hay muchas imágenes
- **Instrucción**: Muestra "← Desliza →" en móvil

---

## 📝 Historial de Cambios

| Fecha | Cambio |
|-------|--------|
| 2026-01-26 | Creación inicial con soporte PNG |
| 2026-01-26 | Ampliación a JPG, JPEG, WebP, GIF, GLB, GLTF |
| 2026-01-26 | Añadido drag & drop para reorganizar |
| 2026-01-26 | Añadido swipe/slider en MediaGallery |
| 2026-01-26 | Añadidos botones de eliminar y mover |

---

## 🔗 Archivos Relacionados

- `src/shared/ui/ImageUploader.tsx` - Componente uploader
- `src/shared/ui/index.ts` - Exportaciones UI
- `src/features/marketplace/components/MediaGallery.tsx` - Galería slider
- `src/features/marketplace/components/ProductConfig.tsx` - Usa el uploader
- `src/features/marketplace/components/ProductHero.tsx` - Usa la galería
- `db_storage_setup.sql` - Configuración de Supabase Storage

---

## 💡 Tips de Uso

1. **Imagen principal**: Siempre pon la mejor imagen primero
2. **Formatos 3D**: GLB es preferible para mejor compatibilidad
3. **GIFs**: Se muestran animados, ideal para demos
4. **Reorganizar**: Arrastra las imágenes para cambiar el orden
5. **Móvil**: Usa la cámara directamente para fotos rápidas
