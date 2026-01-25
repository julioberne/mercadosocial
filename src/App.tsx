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

// Analytics Hooks
import { useExchangeRates } from './features/analytics/hooks/useExchangeRates';
import { usePriceHistory } from './features/analytics/hooks/usePriceHistory';

// Components
import { ProductConfig } from './features/marketplace/components/ProductConfig';
import { ProductHero } from './features/marketplace/components/ProductHero';
import { VoteInput } from './features/social-pricing/components/VoteInput';
import { SentimentWall } from './features/social-pricing/components/SentimentWall';
import { BidForm } from './features/offers/components/BidForm';
import { OfferList } from './features/offers/components/OfferList';
import { GapAnalysis } from './features/analytics/components/GapAnalysis';
import { MetricsGrid } from './features/analytics/components/MetricsGrid';
import { EvolutionChart } from './features/analytics/components/EvolutionChart';
import { OpinionsWall } from './features/opinions/components/OpinionsWall';
import { useOpinions } from './features/opinions/hooks/useOpinions';

function App() {
  // Global State
  const [mainCurrency, setMainCurrency] = useState<CurrencyCode>('USD');
  const [errorMessage, setErrorMessage] = useState('');
  const [ownerPriceDisplay, setOwnerPriceDisplay] = useState('1.000');

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
  };

  const handleAcceptOffer = (offerId: number, amount: number, currency: string) => {
    acceptOffer(offerId);
    sellProduct(amount, currency as CurrencyCode);
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
          <nav className="flex flex-wrap justify-center gap-1.5 md:gap-2 text-xs md:text-lg">
            <a className="px-2 md:px-4 py-1.5 md:py-2 bg-[var(--action-blue)] text-white border-2 md:border-4 border-black whitespace-nowrap" href="#">MERCADO</a>
            <a className="px-2 md:px-4 py-1.5 md:py-2 bg-[var(--background-dots)] border-2 md:border-4 border-black hover:bg-white transition-colors whitespace-nowrap" href="#">ESTADÍSTICAS</a>
            <a className="px-2 md:px-4 py-1.5 md:py-2 bg-[var(--background-dots)] border-2 md:border-4 border-black hover:bg-white transition-colors whitespace-nowrap" href="#">COMUNIDAD</a>
          </nav>
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

        {/* Metrics Grid */}
        <MetricsGrid
          stats={stats}
          ownerPrice={convertDynamic(product.ownerPrice, product.ownerCurrency, mainCurrency)}
          mainCurrency={mainCurrency}
        />

        {/* Gap Analysis */}
        <GapAnalysis stats={stats} mainCurrency={mainCurrency} />

        {/* Evolution Charts */}
        <section className="pixel-panel p-8 bg-white text-black">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[var(--action-blue)]/10 p-3 border-4 border-black">
              <LineChart size={28} className="text-[var(--action-blue)]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight text-black">
                DINÁMICA DE EVOLUCIÓN - MULTI-CHART TRACKING
              </h3>
              <p className="text-sm font-bold text-gray-500 uppercase">
                Sincronización en tiempo real de tendencias de valor ({mainCurrency})
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
            onVote={addVote}
            onValidationError={setErrorMessage}
            validateFn={validateAmount}
          />
          <BidForm
            productStatus={product.status}
            mainCurrency={mainCurrency}
            onBid={addOffer}
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
              onAcceptOffer={handleAcceptOffer}
            />
          </div>
          <SentimentWall votes={votes} />
        </div>

        {/* Opinions Section */}
        <OpinionsWall
          opinions={opinions}
          onAddOpinion={addOpinion}
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
        <footer className="pixel-panel p-6 bg-[var(--background-dots)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 opacity-60 text-xl font-bold uppercase">
              💎 MERCADO SOCIAL © 2026 • RED DE VALORACIÓN SOCIAL
            </div>
            <div className="flex flex-wrap gap-6 text-lg uppercase font-bold">
              <a className="hover:text-[var(--action-blue)]" href="#">DOCUMENTACIÓN API</a>
              <a className="hover:text-[var(--action-blue)]" href="#">REGLAS DEL MERCADO</a>
              <a className="hover:text-[var(--action-blue)]" href="#">PRIVACIDAD</a>
              <a className="hover:text-[var(--action-blue)]" href="#">SOPORTE</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;
