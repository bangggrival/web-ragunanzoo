'use client';

import React, { useState, useMemo } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTicketContent } from '@/hooks/useTicketContent';
import InstantTicketPreview from '@/components/tickets/InstantTicketPreview';

type VehicleType = 'none' | 'bike' | 'motor' | 'car' | 'bus';
type DayType = 'weekday' | 'weekend';
type RightTabType = 'jakcard' | 'ticket';

export interface TicketPriceCalculatorProps {
  onProceedToOnlineBooking?: (cart: Record<string, number>, visitDate?: string) => void;
  onProceedToJakCardGuide?: (details: { totalAmount: number; recommendation: any }) => void;
}

export default function TicketPriceCalculator({
  onProceedToOnlineBooking,
  onProceedToJakCardGuide,
}: TicketPriceCalculatorProps = {}) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { settings } = useTicketContent();
  const [showAdditionalRides, setShowAdditionalRides] = useState(false);
  
  // Controls state
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(1);
  const [vehicle, setVehicle] = useState<VehicleType>('motor');
  const [dayType, setDayType] = useState<DayType>('weekend');
  const [rightTab, setRightTab] = useState<RightTabType>('jakcard');

  // Attractions / Rides Add-ons
  const [includeSchmutzer, setIncludeSchmutzer] = useState(true);
  const [includeChildrenZoo, setIncludeChildrenZoo] = useState(false);
  const [includeSwanBoat, setIncludeSwanBoat] = useState(false);
  const [includeTourTrain, setIncludeTourTrain] = useState(false);
  const [includeBikeRental, setIncludeBikeRental] = useState(false);

  // Dynamic rates from database settings with official Perda DKI defaults
  const ticketRates = useMemo(() => ({
    adult: settings?.adult_price ?? 4000,
    child: settings?.child_price ?? 3000,
    schmutzerWeekday: settings?.schmutzer_weekday_price ?? 6000,
    schmutzerWeekend: settings?.schmutzer_weekend_price ?? 7500,
    childrenZoo: 2500,
    swanBoat: 18000,
    tourTrain: 10000,
    bikeRental: 10000,
  }), [settings]);

  const vehicleRates: Record<VehicleType, { labelId: string; labelEn: string; price: number; icon: React.ReactNode }> = useMemo(() => ({
    none: { labelId: 'Tanpa Kendaraan', labelEn: 'No Vehicle (Walk)', price: 0, icon: <AppIcon name="fluent-emoji-flat:footprints" className="w-4 h-4" /> },
    bike: { labelId: 'Sepeda', labelEn: 'Bicycle', price: settings?.parking_bike ?? 1000, icon: <AppIcon name="fluent-emoji-flat:bicycle" className="w-4 h-4" /> },
    motor: { labelId: 'Motor', labelEn: 'Motorcycle', price: settings?.parking_motor ?? 5000, icon: <AppIcon name="fluent-emoji-flat:motorcycle" className="w-4 h-4" /> },
    car: { labelId: 'Mobil', labelEn: 'Car / SUV', price: settings?.parking_car ?? 10000, icon: <AppIcon name="fluent-emoji-flat:automobile" className="w-4 h-4" /> },
    bus: { labelId: 'Bus Wisata', labelEn: 'Tour Bus', price: settings?.parking_bus ?? 15000, icon: <AppIcon name="fluent-emoji-flat:bus" className="w-4 h-4" /> },
  }), [settings]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Quick Preset Handlers
  const setPreset = (adults: number, children: number, veh: VehicleType, schmutzer: boolean, childrenZoo: boolean, train: boolean) => {
    setAdultCount(adults);
    setChildCount(children);
    setVehicle(veh);
    setIncludeSchmutzer(schmutzer);
    setIncludeChildrenZoo(childrenZoo);
    setIncludeTourTrain(train);
    setIncludeSwanBoat(false);
    setIncludeBikeRental(false);
  };

  const handleReset = () => {
    setAdultCount(1);
    setChildCount(0);
    setVehicle('none');
    setIncludeSchmutzer(false);
    setIncludeChildrenZoo(false);
    setIncludeSwanBoat(false);
    setIncludeTourTrain(false);
    setIncludeBikeRental(false);
  };

  const handleStartOnlineBooking = () => {
    if (!onProceedToOnlineBooking) return;
    const cart: Record<string, number> = {};
    if (adultCount > 0) cart['dewasa'] = adultCount;
    if (childCount > 0) cart['anak'] = childCount;
    if (includeSchmutzer) cart['schmutzer'] = adultCount + childCount;
    if (includeChildrenZoo) cart['taman_anak'] = adultCount + childCount;

    if (vehicle === 'car') cart['gol3'] = 1;
    else if (vehicle === 'motor') cart['motor'] = 1;
    else if (vehicle === 'bike') cart['sepeda'] = 1;
    else if (vehicle === 'bus') cart['gol1'] = 1;

    onProceedToOnlineBooking(cart);
  };

  const handleStartJakCardGuide = () => {
    if (!onProceedToJakCardGuide) return;
    onProceedToJakCardGuide({
      totalAmount,
      recommendation: jakcardRecommendation,
    });
  };

  // Calculations
  const adultSubtotal = adultCount * ticketRates.adult;
  const childSubtotal = childCount * ticketRates.child;
  const entrySubtotal = adultSubtotal + childSubtotal;
  const parkingSubtotal = vehicleRates[vehicle].price;
  
  const schmutzerRate = dayType === 'weekend' ? ticketRates.schmutzerWeekend : ticketRates.schmutzerWeekday;
  const schmutzerSubtotal = includeSchmutzer ? (adultCount + childCount) * schmutzerRate : 0;
  const childrenZooSubtotal = includeChildrenZoo ? (adultCount + childCount) * ticketRates.childrenZoo : 0;
  const swanBoatSubtotal = includeSwanBoat ? ticketRates.swanBoat : 0;
  const tourTrainSubtotal = includeTourTrain ? (adultCount + childCount) * ticketRates.tourTrain : 0;
  const bikeRentalSubtotal = includeBikeRental ? ticketRates.bikeRental : 0;

  const totalRidesSubtotal = schmutzerSubtotal + childrenZooSubtotal + swanBoatSubtotal + tourTrainSubtotal + bikeRentalSubtotal;
  const totalAmount = entrySubtotal + parkingSubtotal + totalRidesSubtotal;

  // Breakdown list for InstantTicketPreview
  const additionalRidesList = useMemo(() => {
    const list: { name: string; total: number }[] = [];
    const totalPeople = adultCount + childCount;

    if (includeSchmutzer) {
      list.push({
        name: `Pusat Primata Schmutzer (${totalPeople}x @ ${formatRupiah(schmutzerRate)})`,
        total: schmutzerSubtotal,
      });
    }
    if (includeChildrenZoo) {
      list.push({
        name: `Taman Satwa Anak (${totalPeople}x @ ${formatRupiah(ticketRates.childrenZoo)})`,
        total: childrenZooSubtotal,
      });
    }
    if (includeTourTrain) {
      list.push({
        name: `Kereta Wisata Keliling (${totalPeople}x @ ${formatRupiah(ticketRates.tourTrain)})`,
        total: tourTrainSubtotal,
      });
    }
    if (includeSwanBoat) {
      list.push({
        name: `Perahu Angsa Danau (1 Unit)`,
        total: swanBoatSubtotal,
      });
    }
    if (includeBikeRental) {
      list.push({
        name: `Sewa Sepeda Wisata (1 Jam)`,
        total: bikeRentalSubtotal,
      });
    }
    return list;
  }, [
    includeSchmutzer,
    includeChildrenZoo,
    includeTourTrain,
    includeSwanBoat,
    includeBikeRental,
    adultCount,
    childCount,
    schmutzerRate,
    ticketRates.childrenZoo,
    ticketRates.tourTrain,
    schmutzerSubtotal,
    childrenZooSubtotal,
    tourTrainSubtotal,
    swanBoatSubtotal,
    bikeRentalSubtotal,
  ]);

  // JakCard Recommendation logic from dynamic settings
  const tier1Total = settings?.jakcard_tier_1_total ?? 45000;
  const tier1Balance = settings?.jakcard_tier_1_balance ?? 20000;
  const tier2Total = settings?.jakcard_tier_2_total ?? 75000;
  const tier2Balance = settings?.jakcard_tier_2_balance ?? 50000;
  const cardFee = settings?.jakcard_card_price ?? 25000;

  const jakcardRecommendation = useMemo(() => {
    if (totalAmount <= tier1Balance) {
      return {
        cardType: `JakCard ${formatRupiah(tier1Total)}`,
        initialBalance: tier1Balance,
        cardFee: cardFee,
        remainingBalance: tier1Balance - totalAmount,
        needTopup: false,
        topupAmount: 0,
        badgeText: isEn ? 'Best Fit' : 'Paling Pas',
        badgeVariant: 'emerald',
      };
    } else if (totalAmount <= tier2Balance) {
      return {
        cardType: `JakCard ${formatRupiah(tier2Total)}`,
        initialBalance: tier2Balance,
        cardFee: cardFee,
        remainingBalance: tier2Balance - totalAmount,
        needTopup: false,
        topupAmount: 0,
        badgeText: isEn ? 'Recommended' : 'Direkomendasikan',
        badgeVariant: 'amber',
      };
    } else {
      const topupNeeded = totalAmount - tier2Balance;
      return {
        cardType: `JakCard ${formatRupiah(tier2Total)} + Top-up`,
        initialBalance: tier2Balance,
        cardFee: cardFee,
        remainingBalance: 0,
        needTopup: true,
        topupAmount: Math.ceil(topupNeeded / 10000) * 10000,
        badgeText: isEn ? 'Top-up Needed' : 'Perlu Top-up Saldo',
        badgeVariant: 'sky',
      };
    }
  }, [totalAmount, tier1Balance, tier1Total, tier2Balance, tier2Total, cardFee, isEn]);

  return (
    <div className="rounded-3xl bg-card border border-border/80 shadow-md overflow-hidden transition-all duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-5 md:p-6 text-white relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <AppIcon name="solar:calculator-minimalistic-bold-duotone" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{isEn ? 'Admission & JakCard Visit Simulator' : 'Kalkulator Tarif Masuk & Simulasi Kunjungan'}</span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-wide">
                  Perda DKI
                </span>
              </h3>
              <p className="text-xs text-white/75 mt-0.5">
                {isEn 
                  ? 'Simulate your visit cost, customize attractions & generate your instant digital ticket pass' 
                  : 'Hitung estimasi total tiket, pilih wahana & dapatkan preview tiket digital instan'}
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 border border-white/15 transition-all self-start sm:self-auto hover:scale-105 active:scale-95"
            title="Reset simulasi"
          >
            <AppIcon name="solar:restart-bold" className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap mt-4 pt-3 border-t border-white/10 text-xs">
          <span className="text-white/60 font-medium">{isEn ? 'Quick Presets:' : 'Preset Cepat:'}</span>
          <button
            onClick={() => setPreset(2, 0, 'motor', true, false, false)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 font-medium transition-all"
          >
            Berdua (Motor + Schmutzer)
          </button>
          <button
            onClick={() => setPreset(2, 2, 'car', true, true, true)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 font-medium transition-all"
          >
            Keluarga Seru (Mobil + Wahana)
          </button>
          <button
            onClick={() => setPreset(1, 0, 'none', false, false, false)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 font-medium transition-all"
          >
            Solo (Pintu Busway)
          </button>
          <button
            onClick={() => setPreset(25, 0, 'bus', true, false, false)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 font-medium transition-all"
          >
            Rombongan Bus Wisata
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs Left, Digital Output (JakCard or Ticket) Right */}
      <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left Side: Stepper Controls (7 cols) ── */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Section 1: Pengunjung */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
              {isEn ? '1. Number of Visitors' : '1. Jumlah Pengunjung'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dewasa */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <AppIcon name="solar:users-group-two-rounded-bold-duotone" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{isEn ? 'Adult' : 'Dewasa'}</p>
                    <p className="text-xs text-muted-foreground">{formatRupiah(ticketRates.adult)} / org</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                    disabled={adultCount <= 1}
                    className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-sm font-bold text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-extrabold text-sm text-foreground">{adultCount}</span>
                  <button
                    onClick={() => setAdultCount(adultCount + 1)}
                    className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-sm font-bold text-foreground hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Anak-anak */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <AppIcon name="fluent-emoji-flat:baby" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{isEn ? 'Children' : 'Anak-anak'}</p>
                    <p className="text-xs text-muted-foreground">{formatRupiah(ticketRates.child)} / org</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                    disabled={childCount <= 0}
                    className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-sm font-bold text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-extrabold text-sm text-foreground">{childCount}</span>
                  <button
                    onClick={() => setChildCount(childCount + 1)}
                    className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-sm font-bold text-foreground hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Kendaraan & Parkir */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
              {isEn ? '2. Vehicle & Parking' : '2. Kendaraan & Retribusi Parkir'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(vehicleRates) as VehicleType[]).map((vKey) => {
                const isSelected = vehicle === vKey;
                const vData = vehicleRates[vKey];
                return (
                  <button
                    key={vKey}
                    onClick={() => setVehicle(vKey)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs scale-[1.02]'
                        : 'border-border/70 bg-card hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {vData.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">
                        {isEn ? vData.labelEn : vData.labelId}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {vData.price === 0 ? 'Gratis' : formatRupiah(vData.price)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Pilihan Wahana & Atraksi Satwa */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                {isEn ? '3. Attractions & Leisure Rides' : '3. Wahana & Atraksi Satwa Rekreasi'}
              </label>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <AppIcon name="solar:calendar-bold-duotone" className="w-3 h-3 text-primary" />
                <span className="font-semibold">{dayType === 'weekend' ? 'Tarif Libur' : 'Tarif Hari Kerja'}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Wahana 1: Pusat Primata Schmutzer */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                includeSchmutzer ? 'bg-primary/5 border-primary/40 shadow-xs' : 'bg-muted/30 border-border/70'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="schmutzer-toggle"
                      checked={includeSchmutzer}
                      onChange={(e) => setIncludeSchmutzer(e.target.checked)}
                      className="w-4 h-4 mt-1 accent-primary rounded cursor-pointer"
                    />
                    <label htmlFor="schmutzer-toggle" className="cursor-pointer">
                      <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <span>🦍 Pusat Primata Schmutzer</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                          Populer
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRupiah(schmutzerRate)} / orang • Kawasan konservasi primata bertaraf internasional
                      </p>
                    </label>
                  </div>

                  <span className="text-xs font-bold text-foreground flex-shrink-0">
                    {includeSchmutzer ? formatRupiah(schmutzerSubtotal) : 'Rp 0'}
                  </span>
                </div>

                {includeSchmutzer && (
                  <div className="flex items-center gap-2 pt-2.5 mt-2.5 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {isEn ? 'Visit Day:' : 'Hari Kunjungan:'}
                    </span>
                    <div className="inline-flex p-0.5 rounded-lg bg-muted border border-border text-xs font-semibold w-full sm:w-auto">
                      <button
                        onClick={() => setDayType('weekday')}
                        className={`flex-1 text-center truncate px-2.5 py-1 rounded-md transition-all ${
                          dayType === 'weekday' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Selasa-Jumat ({formatRupiah(ticketRates.schmutzerWeekday)})
                      </button>
                      <button
                        onClick={() => setDayType('weekend')}
                        className={`flex-1 text-center truncate px-2.5 py-1 rounded-md transition-all ${
                          dayType === 'weekend' ? 'bg-card text-primary font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Sabtu-Minggu ({formatRupiah(ticketRates.schmutzerWeekend)})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wahana 2: Taman Satwa Anak (Children Zoo) */}
              <div className={`p-3 rounded-2xl border transition-all ${
                includeChildrenZoo ? 'bg-emerald-500/5 border-emerald-500/40 shadow-xs' : 'bg-muted/30 border-border/70'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="children-zoo-toggle"
                      checked={includeChildrenZoo}
                      onChange={(e) => setIncludeChildrenZoo(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                    <label htmlFor="children-zoo-toggle" className="cursor-pointer">
                      <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                        <span>🧒 Taman Satwa Anak (Children Zoo)</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatRupiah(ticketRates.childrenZoo)} / orang • Interaksi satwa jinak & edukasi
                      </p>
                    </label>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {includeChildrenZoo ? formatRupiah(childrenZooSubtotal) : 'Rp 0'}
                  </span>
                </div>
              </div>

              {/* Wahana 3: Kereta Wisata Keliling */}
              <div className={`p-3 rounded-2xl border transition-all ${
                includeTourTrain ? 'bg-primary/5 border-primary/40 shadow-xs' : 'bg-muted/30 border-border/70'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="train-toggle"
                      checked={includeTourTrain}
                      onChange={(e) => setIncludeTourTrain(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <label htmlFor="train-toggle" className="cursor-pointer">
                      <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                        <span>🚂 Kereta Wisata Keliling Ragunan</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatRupiah(ticketRates.tourTrain)} / orang • Keliling seluruh zona satwa tanpa lelah
                      </p>
                    </label>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {includeTourTrain ? formatRupiah(tourTrainSubtotal) : 'Rp 0'}
                  </span>
                </div>
              </div>

              {/* Wahana 4 & 5 Grid: Perahu Angsa & Sepeda */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Perahu Angsa Danau */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  includeSwanBoat ? 'bg-sky-500/5 border-sky-500/40 shadow-xs' : 'bg-muted/30 border-border/70'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="boat-toggle"
                        checked={includeSwanBoat}
                        onChange={(e) => setIncludeSwanBoat(e.target.checked)}
                        className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                      />
                      <label htmlFor="boat-toggle" className="cursor-pointer">
                        <p className="text-xs font-bold text-foreground">🦢 Perahu Angsa Danau</p>
                        <p className="text-[10px] text-muted-foreground">{formatRupiah(ticketRates.swanBoat)} / perahu</p>
                      </label>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {includeSwanBoat ? formatRupiah(swanBoatSubtotal) : 'Rp 0'}
                    </span>
                  </div>
                </div>

                {/* Sewa Sepeda Wisata */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  includeBikeRental ? 'bg-amber-500/5 border-amber-500/40 shadow-xs' : 'bg-muted/30 border-border/70'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="bike-toggle"
                        checked={includeBikeRental}
                        onChange={(e) => setIncludeBikeRental(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <label htmlFor="bike-toggle" className="cursor-pointer">
                        <p className="text-xs font-bold text-foreground">🚲 Sewa Sepeda Wisata</p>
                        <p className="text-[10px] text-muted-foreground">{formatRupiah(ticketRates.bikeRental)} / jam</p>
                      </label>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {includeBikeRental ? formatRupiah(bikeRentalSubtotal) : 'Rp 0'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── Right Side: Output Selector (JakCard Card OR Instant Digital Ticket Stub) (5 cols) ── */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">

          {/* Right Mode Switcher Tab */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-muted/80 border border-border/60">
            <button
              onClick={() => setRightTab('jakcard')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                rightTab === 'jakcard'
                  ? 'bg-card text-foreground shadow-sm scale-[1.01]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AppIcon name="solar:card-bold-duotone" className="w-3.5 h-3.5 text-primary" />
              <span>{isEn ? 'JakCard Balance' : 'Simulasi Saldo JakCard'}</span>
            </button>

            <button
              onClick={() => setRightTab('ticket')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                rightTab === 'ticket'
                  ? 'bg-card text-foreground shadow-sm scale-[1.01]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AppIcon name="solar:ticket-bold-duotone" className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? 'Digital Pass Preview' : 'Tiket Digital Instan'}</span>
            </button>
          </div>

          {/* TAB CONTENT 1: JAKCARD SIMULATION */}
          {rightTab === 'jakcard' && (
            <div className="space-y-4 animate-fade-in">
              {/* Visual Digital JakCard Simulator */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-emerald-950 text-white p-5 shadow-xl border border-amber-400/30 flex flex-col justify-between aspect-[1.586/1] group transition-all duration-500 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent pointer-events-none" />
                
                {/* Top Bar */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-extrabold tracking-widest uppercase text-white/90">
                      BANK DKI • JakCard
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80">
                    <AppIcon name="solar:bolt-bold-duotone" className="w-4 h-4" />
                    <span className="text-[10px] font-bold">NFC TAP</span>
                  </div>
                </div>

                {/* Middle Bar */}
                <div className="flex items-center justify-between relative z-10 my-auto">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-amber-500 border border-yellow-200 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-4 border border-amber-700/50 rounded-xs opacity-60" />
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">
                      {isEn ? 'Estimated Total Deduction' : 'Estimasi Tarif Masuk'}
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight drop-shadow-sm">
                      {formatRupiah(totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between text-[11px] relative z-10 pt-2 border-t border-white/15">
                  <span className="font-mono tracking-widest text-white/80">•••• •••• •••• 2026</span>
                  <span className="font-semibold text-white/90">Taman Margasatwa Ragunan</span>
                </div>
              </div>

              {/* JakCard Recommendation Card */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/80 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {isEn ? 'Recommended Purchase at Counter:' : 'Rekomendasi Pembelian di Loket:'}
                    </p>
                    <p className="font-extrabold text-sm md:text-base text-foreground mt-0.5">
                      {jakcardRecommendation.cardType}
                    </p>
                  </div>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary border border-primary/20">
                    {jakcardRecommendation.badgeText}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Tiket Masuk ({adultCount + childCount} org)</span>
                    <span className="font-medium text-foreground">{formatRupiah(entrySubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Parkir ({isEn ? vehicleRates[vehicle].labelEn : vehicleRates[vehicle].labelId})</span>
                    <span className="font-medium text-foreground">{formatRupiah(parkingSubtotal)}</span>
                  </div>
                  {totalRidesSubtotal > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Total Wahana & Atraksi</span>
                      <span className="font-medium text-foreground">{formatRupiah(totalRidesSubtotal)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border/80 font-bold text-sm">
                    <span className="text-foreground">Total Kebutuhan Saldo</span>
                    <span className="text-primary font-black text-base">{formatRupiah(totalAmount)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5 pt-1">
                  <AppIcon name="solar:info-circle-bold-duotone" className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    {isEn
                      ? 'One JakCard can be tapped multiple times for your whole group at gate turnstiles!'
                      : 'Satu kartu JakCard bisa digunakan bersama untuk rombongan (tap berulang kali di pintu gerbang turnstile)!'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: INSTANT DIGITAL TICKET PREVIEW */}
          {rightTab === 'ticket' && (
            <div className="animate-fade-in">
              <InstantTicketPreview
                adultCount={adultCount}
                childCount={childCount}
                adultRate={ticketRates.adult}
                childRate={ticketRates.child}
                vehicleName={isEn ? vehicleRates[vehicle].labelEn : vehicleRates[vehicle].labelId}
                vehicleRate={parkingSubtotal}
                additionalRides={additionalRidesList}
                totalAmount={totalAmount}
                dayType={dayType}
              />
            </div>
          )}

          {/* Direct Handoff Actions: Online Simulation, JakCard Guide & Official Portal */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            {onProceedToOnlineBooking && (
              <button
                onClick={handleStartOnlineBooking}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <AppIcon name="solar:stars-minimalistic-bold" className="w-4 h-4 text-sky-200 shrink-0" />
                  <span className="truncate">{isEn ? 'Try Online Simulation Flow' : 'Coba Simulasi Alur E-Tiket'}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                    {adultCount + childCount} {isEn ? 'Tickets' : 'Tiket'}
                  </span>
                  <AppIcon name="solar:arrow-right-linear" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )}

            {/* Official External Portal Link */}
            <a
              href="https://ragunanzoo.agathis.fun/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-[0.98] transition-all group gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AppIcon name="solar:ticket-bold-duotone" className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span className="truncate">{isEn ? 'Purchase Authentic Ticket (Official Portal) ↗' : 'Beli Tiket Resmi di Portal Eksternal ↗'}</span>
              </div>
              <AppIcon name="solar:arrow-right-up-linear" className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>

            {onProceedToJakCardGuide && (
              <button
                onClick={handleStartJakCardGuide}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-600/20 active:scale-[0.98] transition-all gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <AppIcon name="solar:card-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{isEn ? 'JakCard Entry & Top-up Guide' : 'Panduan Kartu JakCard & Top Up'}</span>
                </div>
                <AppIcon name="solar:arrow-right-linear" className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Additional Tariffs & Legal Basis Footer */}
      <div className="border-t border-border/80 bg-muted/20 px-5 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AppIcon name="solar:shield-check-bold-duotone" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="italic">
              {settings?.legal_basis_text || 'Peraturan Daerah Provinsi DKI Jakarta No. 1 Tahun 2024 tentang Pajak Daerah dan Retribusi Daerah'}
            </span>
          </div>

          {settings?.additional_tariffs && settings.additional_tariffs.length > 0 && (
            <button
              onClick={() => setShowAdditionalRides(!showAdditionalRides)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start sm:self-auto"
            >
              <span>{isEn ? 'Other Tariffs & Facilities' : 'Tarif Wahana & Sewa Lainnya'}</span>
              <AppIcon name="solar:alt-arrow-down-linear" className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdditionalRides ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Collapsible Additional Tariffs Grid */}
        {showAdditionalRides && settings?.additional_tariffs && (
          <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in">
            {settings.additional_tariffs.map((ride, idx) => (
              <div key={ride.id || idx} className="p-3 rounded-xl bg-card border border-border/70 flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0">
                  <p className="font-bold text-xs text-foreground truncate">
                    {isEn && ride.name_en ? ride.name_en : ride.name_id}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isEn && ride.unit_en ? ride.unit_en : ride.unit_id}
                  </p>
                </div>
                <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {formatRupiah(ride.price)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
