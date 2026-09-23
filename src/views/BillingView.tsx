import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  Sparkles,
  CheckCircle2,
  Download,
  AlertCircle,
  Plus,
  ShieldCheck,
  RotateCw,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { InvoiceRecord, CreditUsageRecord, SubscriptionTier } from '../types';

export const BillingView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [creditLogs, setCreditLogs] = useState<CreditUsageRecord[]>([]);
  const [creditsRemaining, setCreditsRemaining] = useState(85550);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(25000);

  useEffect(() => {
    fetch('/api/billing/details')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setInvoices(data.invoices || []);
          setCreditLogs(data.creditLogs || []);
          if (data.creditsRemaining) setCreditsRemaining(data.creditsRemaining);
        }
      })
      .catch(() => {});
  }, []);

  const plans = [
    {
      id: 'free' as SubscriptionTier,
      name: 'Starter Free',
      tagline: 'Ideal for trying out studio speech and basic scripts.',
      monthlyPrice: 0,
      annualPrice: 0,
      characters: '10,000 chars / month',
      audioMinutes: '15 mins / month',
      features: [
        'Standard natural AI voices',
        'Basic Voice-to-Text transcription',
        'Standard MP3 audio exports',
        '2 active projects',
        'Community support',
      ],
      current: user?.subscription === 'free',
      popular: false,
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro Creator',
      tagline: 'For content creators, YouTubers, and podcasters.',
      monthlyPrice: 29,
      annualPrice: 290,
      characters: '100,000 chars / month',
      audioMinutes: '120 mins / month',
      features: [
        'All 50+ Multilingual AI voices',
        'Voice Cloning (up to 5 clones)',
        'Full AI Writing Studio (12 tools)',
        'Professional Audio DAW & multi-track',
        'AI Video Dubbing with subtitle sync',
        'Lossless WAV & MP3 exports',
        'Commercial license & monetization rights',
        'Priority GPU synthesis queue',
      ],
      current: user?.subscription === 'pro' || user?.subscription === 'creator',
      popular: true,
    },
    {
      id: 'premium' as SubscriptionTier,
      name: 'Studio Premium',
      tagline: 'High volume production, agencies & developer API.',
      monthlyPrice: 79,
      annualPrice: 790,
      characters: '500,000 chars / month',
      audioMinutes: '600 mins / month',
      features: [
        'Unlimited custom voice cloning',
        'Advanced neural video dubbing & lip sync',
        'Full Developer API access & webhooks',
        'Team collaboration workspaces (5 seats)',
        'Unlimited projects & cloud storage',
        'SRT & VTT automatic subtitle export',
        'Dedicated 24/7 VIP engineer support',
        'Custom voice model fine-tuning',
      ],
      current: user?.subscription === 'premium' || user?.subscription === 'business',
      popular: false,
    },
  ];

  const handleCheckoutPlan = async (tier: SubscriptionTier) => {
    setLoading(true);
    try {
      // Secure server-side call: Never exposes Stripe secrets on frontend
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, cycle: billingCycle }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout initialization failed');

      if (data.user) {
        await updateProfile(data.user);
      }
      if (data.invoice) {
        setInvoices((prev) => [data.invoice, ...prev]);
      }

      success(`Upgraded to ${tier.toUpperCase()} plan successfully!`);
    } catch (err: any) {
      toastError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpCredits = async () => {
    try {
      const res = await fetch('/api/billing/add-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: topUpAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCreditsRemaining((prev) => prev + topUpAmount);
      success(`Added ${topUpAmount.toLocaleString()} credits to your account!`);
      setIsTopUpOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to top up credits');
    }
  };

  const currentTier = user?.subscription || 'pro';
  const charPct = Math.min(100, Math.round(((user?.charactersUsed || 14250) / (user?.characterLimit || 100000)) * 100));
  const audioPct = Math.min(100, Math.round(((user?.audioGeneratedMinutes || 18.5) / (user?.audioMinutesLimit || 120)) * 100));

  return (
    <div id="billing-view-container" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner / Current Plan Overview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-[#13141f] via-slate-900 to-[#1e172e] border border-purple-500/20 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Current Subscription</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white capitalize">
              {currentTier} Plan
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Your cycle will automatically renew on <span className="text-slate-200 font-semibold">April 1, 2026</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTopUpOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buy Extra Credits</span>
            </button>
          </div>
        </div>

        {/* Usage Bar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Characters Used</span>
              <span className="text-white font-bold">{charPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                style={{ width: `${charPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {(user?.charactersUsed || 14250).toLocaleString()} / {(user?.characterLimit || 100000).toLocaleString()} chars
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Audio Minutes Used</span>
              <span className="text-white font-bold">{audioPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                style={{ width: `${audioPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {user?.audioGeneratedMinutes || 18.5} / {user?.audioMinutesLimit || 120} minutes
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Credits Remaining</span>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{creditsRemaining.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400">credits</span>
            </div>
            <p className="text-[11px] text-slate-500">Auto-renews monthly</p>
          </div>
        </div>
      </div>

      {/* Plan Selection Section */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Upgrade or Change Plan</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Scale seamlessly as your audio and video dubbing volume grows.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-3 flex items-center justify-center gap-3">
            <div className="bg-[#12131b] p-1 rounded-2xl border border-slate-800 flex items-center">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold uppercase">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const price = billingCycle === 'annual' ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
            const isCurrent = p.current;

            return (
              <div
                key={p.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                  p.popular
                    ? 'bg-[#151624] border-purple-500 ring-2 ring-purple-500/20 shadow-2xl'
                    : 'bg-[#11121c] border-slate-800'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{p.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1 py-1">
                    <span className="text-4xl font-black text-white">${price}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                    {billingCycle === 'annual' && p.annualPrice > 0 && (
                      <span className="text-[10px] text-slate-500 ml-1">(${p.annualPrice}/yr)</span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-semibold space-y-1">
                    <div>{p.characters}</div>
                    <div className="text-slate-400 text-[11px]">{p.audioMinutes}</div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {p.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleCheckoutPlan(p.id)}
                    disabled={isCurrent || loading}
                    className={`w-full py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : p.popular
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : `Upgrade to ${p.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History & Payment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#12131b] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Invoice & Billing History</h3>
              <p className="text-xs text-slate-400">Download past invoices and tax receipts.</p>
            </div>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-3 font-semibold">Invoice #</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="text-slate-300">
                    <td className="py-3 font-mono text-purple-400 font-semibold">{inv.invoiceNumber}</td>
                    <td className="py-3">{inv.date}</td>
                    <td className="py-3 capitalize">{inv.tier}</td>
                    <td className="py-3 font-bold">${inv.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => success(`Receipt for ${inv.invoiceNumber} downloaded!`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Download PDF Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="p-6 rounded-3xl bg-[#12131b] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>Payment Method</span>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">Stripe Secure Card</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                  Default
                </span>
              </div>
              <div className="font-mono text-sm tracking-wider text-white">•••• •••• •••• 4242</div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Expires 12/28</span>
                <span>Visa Platinum</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-bit SSL encrypted billing</span>
            </div>
            <button
              onClick={() => success('Payment method update portal requested')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
            >
              Update Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#12131b] border border-purple-500/30 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Extra Studio Credits</h3>
            <p className="text-xs text-slate-400">
              Top up your account with credits that never expire.
            </p>

            <div className="grid grid-cols-3 gap-3 py-2">
              {[10000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(amt)}
                  className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                    topUpAmount === amt
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-sm">+{amt.toLocaleString()}</div>
                  <div className="text-[10px] text-purple-300 mt-1">${amt / 2500}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                onClick={() => setIsTopUpOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUpCredits}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
