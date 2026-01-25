// ===== PRODUCT TYPES =====
export interface Product {
    id: number;
    name: string;
    description: string;
    ownerPrice: number;
    ownerCurrency: CurrencyCode;
    status: ProductStatus;
    finalPrice: number | null;
    finalCurrency: CurrencyCode;
    images: string[];
    videoUrl: string;
    seller: Seller;
}

export type ProductStatus = 'open' | 'locked' | 'sold';

export interface Seller {
    name: string;
    avatar: string;
    level: string;
    verified: boolean;
}

// ===== VOTING TYPES =====
export interface Vote {
    id: number;
    val: number;
    cur: CurrencyCode;
    timestamp: Date;
}

// ===== OFFER TYPES =====
export interface Offer {
    id: number;
    bidder: string;
    amount: number;
    cur: CurrencyCode;
    date: string;
    status: OfferStatus;
    createdAt?: Date; // Para historial cronológico
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected';

// ===== OPINION TYPES =====
export interface Opinion {
    id: number;
    author: string;
    content: string;
    value: number;
    currency: CurrencyCode;
    sentiment: 'positive' | 'neutral' | 'negative';
    timestamp: Date;
}

// ===== CURRENCY TYPES =====
export type CurrencyCode = 'USD' | 'COP' | 'MXN';

export interface CurrencyOption {
    code: CurrencyCode;
    symbol: string;
    label: string;
}

// ===== ANALYTICS TYPES =====
export interface HistoryPoint {
    value: number;
    time: string;
    date: string;
}

export interface MarketStats {
    ownerPriceInMain: number;
    avgSentiment: number;
    maxOffer: number;
    avgOffer: number;
    marketPremium: number;
    convergenceIndex: number;
    inflationRisk: number;
}

// ===== SAMPLE DATA =====
export const SAMPLE_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Consultoría Estratégica AI (Mensual)",
        description: "Servicio premium de optimización de flujos de trabajo mediante inteligencia artificial generativa. Este servicio incluye análisis de datos, implementación de modelos de lenguaje y automatización de procesos críticos para escalar su negocio al siguiente nivel tecnológico. Se entrega reporte mensual de impacto y soporte 24/7.",
        ownerPrice: 1000,
        ownerCurrency: 'USD',
        status: 'open',
        finalPrice: null,
        finalCurrency: 'USD',
        images: [
            "/images/ai_consulting_hero_1769236911339.png",
            "/images/coworking_space_1769236938284.png",
            "/images/tech_gadget_1769236988434.png"
        ],
        videoUrl: "",
        seller: {
            name: "@TECH_MASTER_ELITE",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
            level: "NIVEL TECH PREMIUM",
            verified: true
        }
    },
    {
        id: 2,
        name: "Reloj Vintage Colección Premium",
        description: "Cronógrafo de edición limitada con mecanismo suizo de alta precisión. Incluye certificado de autenticidad y estuche original. Perfecto estado de conservación, ideal para coleccionistas exigentes.",
        ownerPrice: 4500,
        ownerCurrency: 'USD',
        status: 'open',
        finalPrice: null,
        finalCurrency: 'USD',
        images: [
            "/images/luxury_watch_product_1769236924543.png"
        ],
        videoUrl: "",
        seller: {
            name: "@COLLECTOR_99",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
            level: "COLECCIONISTA VERIFICADO",
            verified: true
        }
    },
    {
        id: 3,
        name: "Leica M6 Titanium Edition",
        description: "Cámara de colección en estado pristino. Edición original de 1992 con lente Summilux 35mm f/1.4 incluido. Acabado en titanio con cuero de avestruz. Número de serie verificado.",
        ownerPrice: 12400,
        ownerCurrency: 'USD',
        status: 'open',
        finalPrice: null,
        finalCurrency: 'USD',
        images: [
            "/images/vintage_camera_1769236959787.png"
        ],
        videoUrl: "",
        seller: {
            name: "@ANALOG_SOUL",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
            level: "EXPERTO FOTOGRAFÍA",
            verified: true
        }
    },
    {
        id: 4,
        name: "NFT Cyberpunk Genesis #234",
        description: "Arte digital de la colección Genesis. Pieza única con metadatos on-chain verificables. Incluye derechos comerciales limitados y acceso exclusivo a la comunidad de holders.",
        ownerPrice: 2500,
        ownerCurrency: 'USD',
        status: 'open',
        finalPrice: null,
        finalCurrency: 'USD',
        images: [
            "/images/nft_digital_art_1769236974044.png"
        ],
        videoUrl: "",
        seller: {
            name: "@CRYPTO_ART_DAO",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Cyber",
            level: "CREADOR DIGITAL",
            verified: false
        }
    }
];

export const SAMPLE_VOTES: Vote[] = [
    { id: 1, val: 1200, cur: 'USD', timestamp: new Date() },
    { id: 2, val: 4000000, cur: 'COP', timestamp: new Date() },
    { id: 3, val: 950, cur: 'USD', timestamp: new Date() },
    { id: 4, val: 1100, cur: 'USD', timestamp: new Date() },
    { id: 5, val: 18500, cur: 'MXN', timestamp: new Date() }
];

export const SAMPLE_OFFERS: Offer[] = [
    { id: 1, bidder: "Empresa Tech S.A.", amount: 1003, cur: 'USD', date: "23/01/2026", status: 'pending' },
    { id: 2, bidder: "Agencia Latam", amount: 3500000, cur: 'COP', date: "23/01/2026", status: 'pending' },
    { id: 3, bidder: "Inversiones MX", amount: 17500, cur: 'MXN', date: "22/01/2026", status: 'pending' }
];
