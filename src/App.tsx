import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, Target, Users, Gavel, LineChart } from 'lucide-react';

// Types
import type { CurrencyCode, MarketStats } from './shared/types';

// Hooks
import { useProduct } from './features/marketplace/hooks/useProduct';
import { useVotes } from './features/social-pricing/hooks/useVotes';
import { useOffers } from './features/offers/hooks/useOffers';

// Lib
import { formatCurrency, formatInputRealTime, unformatValue } from './shared/lib/currency';
import { validateTripleLimit } from './shared/lib/validators';
import { supabase } from './shared/lib/supabase';

// Analytics Hooks
import { useExchangeRates } from './features/analytics/hooks/useExchangeRates';
import { usePriceHistory } from './features/analytics/hooks/usePriceHistory';

// Components
import { ProductConfig } from './features/marketplace/components/ProductConfig';
import { ProductHero } from './features/marketplace/components/ProductHero';
import { ProductContent } from './features/marketplace/components/ProductContent';
import { VoteInput } from './features/social-pricing/components/VoteInput';
import { SentimentWall } from './features/social-pricing/components/SentimentWall';
import { BidForm } from './features/offers/components/BidForm';
import { OfferList } from './features/offers/components/OfferList';
import { GapAnalysis } from './features/analytics/components/GapAnalysis';
import { MetricsGrid } from './features/analytics/components/MetricsGrid';
import { EvolutionChart } from './features/analytics/components/EvolutionChart';
import { OpinionsWall } from './features/opinions/components/OpinionsWall';
import { useOpinions } from './features/opinions/hooks/useOpinions';
import { ToastContainer, useToast, ConfirmModal } from './shared/ui';

function App() {
  // Global State
  const [mainCurrency, setMainCurrency] = useState<CurrencyCode>('USD');
  const [errorMessage, setErrorMessage] = useState('');
  const [ownerPriceDisplay, setOwnerPriceDisplay] = useState('1.000');

  // Simulation Mode State
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Toast system
  const { toasts, showToast, removeToast } = useToast();

  // Modal state for adjudication confirmation
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    offerId: number;
    amount: number;
    currency: string;
    bidder: string;
  }>({ isOpen: false, offerId: 0, amount: 0, currency: 'USD', bidder: '' });

  const {
    product,
    tempProduct,
    isEditing,
    currentImageIndex,
    setIsEditing,
    setTempProduct,
    saveProduct,
    toggleLock,
    sellProduct,
    nextImage,
    prevImage,
    selectImage,
  } = useProduct(1);

  // Dynamic Exchange Rates
  const { rates } = useExchangeRates();

  const { votes, voteHistory, stats: voteStats, addVote, reloadVotes } = useVotes(mainCurrency, 1, rates);
  const { offers, offerHistory, stats: offerStats, addOffer, acceptOffer, reloadOffers } = useOffers(mainCurrency, 1, rates);
  const { opinions, addOpinion } = useOpinions(1);

  // Price history from DB (persistent)
  const { priceHistory: baseHistory, addPricePoint } = usePriceHistory(1, mainCurrency, rates);

  // Helper for dynamic conversion
  const convertDynamic = (amount: number, from: CurrencyCode, to: CurrencyCode) => {
    if (from === to) return amount;
    const inUSD = amount / (rates[from] || 1);
    return inUSD * (rates[to] || 1);
  };

  // Calculate market stats
  const stats: MarketStats = useMemo(() => {
    const ownerPriceInMain = convertDynamic(product.ownerPrice, product.ownerCurrency, mainCurrency);
    const avgSentiment = voteStats.avgSentiment;
    const maxOffer = offerStats.maxOffer;
    const avgOffer = offerStats.avgOffer;

    // Premium: % relative to owner price
    const marketPremium = ownerPriceInMain > 0 ? ((avgSentiment - ownerPriceInMain) / ownerPriceInMain) * 100 : 0;

    // Convergence Index (Confidence):
    // 1. If we have both votes and offers, compare them.
    // 2. If we only have votes, compare them to owner price.
    let convergenceIndex = 0;
    if (avgSentiment && maxOffer) {
      convergenceIndex = (1 - (Math.abs(avgSentiment - maxOffer) / Math.max(avgSentiment, maxOffer))) * 100;
    } else if (avgSentiment) {
      convergenceIndex = (1 - (Math.abs(avgSentiment - ownerPriceInMain) / Math.max(avgSentiment, ownerPriceInMain))) * 100;
    }

    // Inflation Risk: Based on how far the top offer is from owner price
    const inflationRisk = ownerPriceInMain > 0 ? (maxOffer / ownerPriceInMain) * 33.3 : 0;

    return { ownerPriceInMain, avgSentiment, maxOffer, avgOffer, marketPremium, convergenceIndex, inflationRisk };
  }, [product.ownerPrice, product.ownerCurrency, mainCurrency, voteStats, offerStats, rates]);

  // Simulation Logic
  useEffect(() => {
    if (!isDemoMode) return;

    // Simulate Votes randomly
    const voteInterval = setInterval(() => {
      // Random price around owner price (±40%)
      const variation = (Math.random() * 0.8) - 0.4;
      const base = product.ownerPrice;
      const simulatedVote = base * (1 + variation);

      addVote(simulatedVote, product.ownerCurrency);
    }, 2500); // Every 2.5s

    // Simulate Offers randomly
    const offerInterval = setInterval(() => {
      // Random offer around owner price (±30% but mostly lower)
      const variation = (Math.random() * 0.6) - 0.4;
      const base = product.ownerPrice;
      const simulatedOffer = base * (1 + variation);

      // Random bidder names
      const bidders = ['Inversor_X', 'CryptoWhale', 'LocalBuyer', 'SmartFund', 'AlphaTrader'];
      const randomBidder = bidders[Math.floor(Math.random() * bidders.length)];

      addOffer(`${randomBidder}_${Math.floor(Math.random() * 100)}`, simulatedOffer, product.ownerCurrency);
    }, 4000); // Every 4s

    return () => {
      clearInterval(voteInterval);
      clearInterval(offerInterval);
    };
  }, [isDemoMode, product.ownerPrice, product.ownerCurrency, addVote, addOffer]);

  // Toggle Demo Mode
  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
    if (!isDemoMode) {
      showToast('🤖 MODO SIMULACIÓN ACTIVADO: Generando actividad de mercado...', 'success');
    } else {
      showToast('🛑 Simulación detenida', 'success');
    }
  };

  // Clear error message after timeout
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Validation function for votes/offers
  const validateAmount = (val: number, cur: CurrencyCode) => {
    return validateTripleLimit(val, cur, product.ownerPrice, product.ownerCurrency);
  };

  // Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrice = unformatValue(ownerPriceDisplay);

    // Pasar el precio directamente a saveProduct para evitar problema de estado
    await saveProduct({ ownerPrice: cleanPrice });

    // Recargar datos desde la DB para reflejar cambios
    console.log('🔄 Reloading votes and offers after product save...');
    await Promise.all([reloadVotes(), reloadOffers()]);

    // Guardar nuevo precio en historial persistente (DB)
    await addPricePoint(cleanPrice, tempProduct.ownerCurrency);

    showToast('Producto actualizado correctamente', 'success');
  };

  // Open confirmation modal for adjudication
  const handleRequestAdjudication = (offerId: number, amount: number, currency: string) => {
    const offer = offers.find(o => o.id === offerId);
    setConfirmModal({
      isOpen: true,
      offerId,
      amount,
      currency,
      bidder: offer?.bidder || 'Comprador',
    });
  };

  // Confirm adjudication
  const handleConfirmAdjudication = () => {
    acceptOffer(confirmModal.offerId);
    sellProduct(confirmModal.amount, confirmModal.currency as CurrencyCode);
    setConfirmModal({ isOpen: false, offerId: 0, amount: 0, currency: 'USD', bidder: '' });
    showToast('¡Venta adjudicada exitosamente!', 'success');
  };

  // Enhanced vote handler with feedback
  const handleVote = async (val: number, cur: CurrencyCode) => {
    await addVote(val, cur);
    showToast('Voto registrado correctamente', 'success');
  };

  // Enhanced offer handler with feedback
  const handleOffer = async (bidder: string, amount: number, cur: CurrencyCode) => {
    await addOffer(bidder, amount, cur);
    showToast('Oferta enviada correctamente', 'success');
  };

  // Enhanced opinion handler with feedback
  const handleOpinion = async (name: string, content: string, value: number, currency: CurrencyCode) => {
    await addOpinion(name, content, value, currency);
    showToast('Opinión publicada', 'success');
  };

  // Reset all data (votes, offers) for testing
  const handleResetData = async () => {
    if (!confirm('¿Eliminar TODOS los votos y ofertas? Esta acción no se puede deshacer.')) return;

    setIsDemoMode(false); // Stop simulation

    try {
      // Delete all votes for product 1
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('product_id', 1);

      if (votesError) throw votesError;

      // Delete all offers for product 1
      const { error: offersError } = await supabase
        .from('offers')
        .delete()
        .eq('product_id', 1);

      if (offersError) throw offersError;

      // Reload data
      await Promise.all([reloadVotes(), reloadOffers()]);

      showToast('🗑️ Datos reiniciados correctamente', 'success');
    } catch (error) {
      console.error('Error resetting data:', error);
      showToast('Error al reiniciar datos', 'error');
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* Header */}
        <header className="pixel-panel p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-[var(--action-blue)] p-1.5 md:p-2 border-3 md:border-4 border-black">
              <span className="text-white text-xl md:text-2xl">💎</span>
            </div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight uppercase">MERCADO SOCIAL</h1>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {/* Simulation Button */}
            <button
              onClick={toggleDemoMode}
              className={`px-3 py-1.5 md:px-4 md:py-2 border-2 md:border-4 border-black font-bold uppercase text-xs md:text-sm animate-pulse-slow transition-all ${isDemoMode
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-emerald-400 text-black hover:bg-emerald-500'
                }`}
            >
              {isDemoMode ? '⏹ Detener' : '▶ Simular'}
            </button>

            {/* Reset Button */}
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 md:px-4 md:py-2 border-2 md:border-4 border-black font-bold uppercase text-xs md:text-sm bg-gray-200 text-black hover:bg-red-100 hover:border-red-500 transition-all"
            >
              🗑️ Reset
            </button>

            <nav className="flex flex-wrap justify-center gap-1.5 md:gap-2 text-xs md:text-lg">
              <a className="px-2 md:px-4 py-1.5 md:py-2 bg-[var(--action-blue)] text-white border-2 md:border-4 border-black whitespace-nowrap" href="#">MERCADO</a>
              <a className="px-2 md:px-4 py-1.5 md:py-2 bg-[var(--background-dots)] border-2 md:border-4 border-black hover:bg-white transition-colors whitespace-nowrap" href="#">ESTADÍSTICAS</a>
              <a className="px-2 md:px-4 py-1.5 md:py-2 bg-[var(--background-dots)] border-2 md:border-4 border-black hover:bg-white transition-colors whitespace-nowrap" href="#">COMUNIDAD</a>
            </nav>
          </div>
        </header>

        {/* Error Notification */}
        {errorMessage && (
          <div className="fixed top-6 right-6 z-50 animate-slide-in-right max-w-md">
            <div className="pixel-panel bg-white border-l-8 border-[var(--heart-red)] p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-[var(--heart-red)] shrink-0" size={32} />
                <div>
                  <h4 className="font-bold text-[var(--heart-red)] text-lg uppercase mb-1">
                    VIOLACIÓN DE SEGURIDAD
                  </h4>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Config */}
        <ProductConfig
          isEditing={isEditing}
          tempProduct={tempProduct}
          mainCurrency={mainCurrency}
          ownerPriceDisplay={ownerPriceDisplay}
          onToggleEdit={() => setIsEditing(!isEditing)}
          onMainCurrencyChange={setMainCurrency}
          onTempProductChange={(updates) => setTempProduct({ ...tempProduct, ...updates })}
          onOwnerPriceChange={(val) => setOwnerPriceDisplay(formatInputRealTime(val))}
          onSave={handleSaveProduct}
        />

        {/* Product Hero */}
        <ProductHero
          product={product}
          mainCurrency={mainCurrency}
          currentImageIndex={currentImageIndex}
          onPrevImage={prevImage}
          onNextImage={nextImage}
          onSelectImage={selectImage}
          onToggleLock={toggleLock}
        />

        {/* @ProductContent - Contenido extendido del producto */}
        <ProductContent product={product} />

        {/* Metrics Grid */}
        <MetricsGrid
          stats={stats}
          ownerPrice={convertDynamic(product.ownerPrice, product.ownerCurrency, mainCurrency)}
          mainCurrency={mainCurrency}
        />

        {/* Gap Analysis */}
        <GapAnalysis stats={stats} mainCurrency={mainCurrency} />

        {/* Evolution Charts */}
        <section className="pixel-panel p-4 md:p-8 bg-white text-black">
          <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
            <div className="bg-[var(--action-blue)]/10 p-2 md:p-3 border-2 md:border-4 border-black">
              <LineChart size={24} className="text-[var(--action-blue)]" />
            </div>
            <div>
              <h3 className="text-base md:text-2xl font-bold uppercase tracking-tight text-black">
                <span className="hidden md:inline">DINÁMICA DE EVOLUCIÓN - MULTI-CHART TRACKING</span>
                <span className="md:hidden">EVOLUCIÓN DE PRECIOS</span>
              </h3>
              <p className="text-xs md:text-sm font-bold text-gray-500 uppercase">
                <span className="hidden md:inline">Sincronización en tiempo real de tendencias de valor ({mainCurrency})</span>
                <span className="md:hidden">Tiempo real ({mainCurrency})</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EvolutionChart
              label="BASE DUEÑO"
              data={baseHistory}
              color="#00a8f3"
              mainCurrency={mainCurrency}
              icon={<Target size={16} className="text-[var(--action-blue)]" />}
            />
            <EvolutionChart
              label="EXPECTATIVA SOCIAL"
              data={voteHistory}
              color="#9c27b0"
              mainCurrency={mainCurrency}
              icon={<Users size={16} className="text-[var(--action-purple)]" />}
            />
            <EvolutionChart
              label="EXPECTATIVA OFERTAS"
              data={offerHistory}
              color="#6366f1"
              mainCurrency={mainCurrency}
              icon={<Gavel size={16} className="text-indigo-400" />}
            />
          </div>
        </section>

        {/* Interaction Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VoteInput
            mainCurrency={mainCurrency}
            onVote={handleVote}
            onValidationError={setErrorMessage}
            validateFn={validateAmount}
          />
          <BidForm
            productStatus={product.status}
            mainCurrency={mainCurrency}
            onBid={handleOffer}
            onValidationError={setErrorMessage}
            validateFn={validateAmount}
          />
        </div>

        {/* History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <OfferList
              offers={offers}
              productStatus={product.status}
              onAcceptOffer={handleRequestAdjudication}
            />
          </div>
          <SentimentWall votes={votes} />
        </div>

        {/* Opinions Section */}
        <OpinionsWall
          opinions={opinions}
          onAddOpinion={handleOpinion}
          mainCurrency={mainCurrency}
          ownerPrice={product.ownerPrice}
          ownerCurrency={product.ownerCurrency}
          rates={rates}
        />

        {/* Success Banner */}
        {product.status === 'sold' && (
          <div className="pixel-panel p-12 bg-gradient-to-br from-[var(--action-blue)] to-indigo-900 text-white text-center border-b-8 border-[var(--success-green)] animate-slide-in-right">
            <p className="text-sm font-bold opacity-70 uppercase tracking-widest mb-4">
              🎉 TRANSACCIÓN FINALIZADA
            </p>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              {formatCurrency(product.finalPrice!, product.finalCurrency)}
            </h2>
            <p className="text-lg font-bold uppercase tracking-widest border-t border-white/20 pt-4 inline-block">
              COMPRADOR: {offerStats.acceptedOffer?.bidder || 'N/A'}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="pixel-panel p-4 md:p-6 bg-[var(--background-dots)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 opacity-60 text-sm md:text-xl font-bold uppercase text-center">
              <span className="hidden md:inline">💎 MERCADO SOCIAL © 2026 • RED DE VALORACIÓN SOCIAL</span>
              <span className="md:hidden">💎 MERCADO SOCIAL © 2026</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-xs md:text-lg uppercase font-bold">
              <a className="hover:text-[var(--action-blue)]" href="#">API</a>
              <a className="hover:text-[var(--action-blue)]" href="#">REGLAS</a>
              <a className="hover:text-[var(--action-blue)]" href="#">PRIVACIDAD</a>
              <a className="hover:text-[var(--action-blue)]" href="#">SOPORTE</a>
            </div>
          </div>
        </footer>

      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Confirmation Modal for Adjudication */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="CONFIRMAR ADJUDICACIÓN"
        message={`¿Estás seguro de adjudicar la venta a "${confirmModal.bidder}" por ${formatCurrency(confirmModal.amount, confirmModal.currency as CurrencyCode)}? Esta acción no se puede deshacer.`}
        confirmText="ADJUDICAR"
        cancelText="CANCELAR"
        variant="warning"
        onConfirm={handleConfirmAdjudication}
        onCancel={() => setConfirmModal({ isOpen: false, offerId: 0, amount: 0, currency: 'USD', bidder: '' })}
      />
    </div>
  );
}

export default App;
