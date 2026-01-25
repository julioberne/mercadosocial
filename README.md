# Mercado Social 🚀

**Marketplace con Pricing Social Dinámico**

Una plataforma innovadora donde el precio de los productos/servicios es determinado por la comunidad a través de votación social.

## 🌟 Características

- **Pricing Social**: Los usuarios votan para definir el precio justo
- **Ofertas en Tiempo Real**: Sistema de ofertas con Supabase Realtime
- **Multi-moneda**: Soporte para USD, COP, MXN con conversión dinámica
- **Historial de Opiniones**: Módulo social tipo red para comentarios
- **Gráficos en Vivo**: Evolución de precios, votos y ofertas
- **Diseño Pixel Art**: Estética retro-gaming moderna

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: CSS con variables personalizadas (Pixel Art theme)
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/julioberne/mercadosocial.git
cd mercadosocial

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

## 🗄️ Base de Datos

Ejecutar `db_COMPLETO.sql` en Supabase SQL Editor para crear todas las tablas necesarias.

## 📁 Estructura del Proyecto

```
src/
├── features/
│   ├── marketplace/      # Productos y configuración
│   ├── social-pricing/   # Votos y sentimiento
│   ├── offers/           # Sistema de ofertas
│   ├── analytics/        # Gráficos y métricas
│   └── opinions/         # Historial de opiniones
├── shared/
│   ├── lib/              # Supabase, currency, validators
│   ├── types/            # TypeScript interfaces
│   └── ui/               # Componentes reutilizables
└── App.tsx               # Componente principal
```

## 🔑 Variables de Entorno

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## 📝 Licencia

MIT License

---

Desarrollado con 💜 por [Julio Berne](https://github.com/julioberne)
