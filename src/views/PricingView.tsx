import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck, Smartphone, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ManualPaymentModal } from '../components/ManualPaymentModal';

interface PricingViewProps {
  onUpgradeSuccess?: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onUpgradeSuccess }) => {
  const { user } = useAuth();
  const { success } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const PAYMENT_NUMBER = '03095793662';

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      desc: 'Ideal for trying out AI voices and personal test scripts.',
      priceMonthly: 0,
      priceAnnual: 0,
      characters: '10,000 chars / month',
      features: [
        'Standard natural AI voices',
        'Text-to-Speech in 10 languages',
        'Basic Voice-to-Text (up to 5 mins)',
        'Standard MP3 audio export',
        'Community support',
      ],
      current: user?.subscription === 'free',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Creator',
      desc: 'Full studio access, 50+ neural voices, voice cloning, and HD exports.',
      priceMonthly: 29,
      priceAnnual: 24,
      characters: '100,000 chars / month',
      features: [
        'All 50+ Multilingual AI Voices & Emotions',
        'Voice Cloning (up to 5 custom clones)',
        'AI Video Dubbing & subtitle synchronization',
        'Lossless WAV & Studio MP3 exports',
        'Commercial monetization rights',
        'Priority high-speed GPU rendering',
        'Admin Verified manual subscription',
      ],
      current: user?.subscription === 'pro',
      popular: true,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      return;
    }
    // All paid upgrades MUST use the Manual Payment + Admin Approval modal
    setIsPaymentModalOpen(true);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER);
    setCopiedNumber(true);
    success('Payment number 03095793662 copied to clipboard!');
    setTimeout(() => setCopiedNumber(false), 3000);
  };

  return (
    <div id="pricing-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Flexible Plans for Creators & Teams</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Choose the plan that fits your production volume. Upgrade or downgrade anytime.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between border transition-all ${
                plan.popular
                  ? 'bg-white dark:bg-slate-900 border-purple-500 ring-2 ring-purple-500/20 shadow-xl'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {plan.desc}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 py-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    ${price}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                  {plan.characters}
                </div>

                <div className="space-y-2.5 pt-2">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={plan.current}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                    plan.current
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                      : plan.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-600/30'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                  }`}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade to ' + plan.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Payment Information Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/90 via-indigo-950 to-slate-950 border border-purple-500/40 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">
              Send your payment to the following number:
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-white">
              {PAYMENT_NUMBER}
            </div>
            <div className="text-[11px] text-slate-300">
              Easypaisa • JazzCash • Nayapay • Sadapay • Bank Raast
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCopyNumber}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              copiedNumber
                ? 'bg-emerald-600 text-white'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
            }`}
          >
            {copiedNumber ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedNumber ? 'Copied Number!' : 'Copy Number'}</span>
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Submit Payment Request
          </button>
        </div>
      </div>

      {/* Manual Payment Upgrade Modal */}
      <ManualPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSubmitted={() => {
          onUpgradeSuccess?.();
        }}
      />
    </div>
  );
};
