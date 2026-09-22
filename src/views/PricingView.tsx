import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface PricingViewProps {
  onUpgradeSuccess?: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onUpgradeSuccess }) => {
  const { user, updateProfile } = useAuth();
  const { success } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

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
      id: 'creator',
      name: 'Creator',
      desc: 'For YouTube creators, podcasters, and independent publishers.',
      priceMonthly: 19,
      priceAnnual: 15,
      characters: '100,000 chars / month',
      features: [
        'All 50+ Multilingual AI Voices',
        'Urdu, Arabic, English, Spanish & more',
        'Full Emotion & Delivery controls',
        'Lossless WAV & MP3 exports',
        'Voice-to-Text transcription with SRT export',
        'Commercial usage rights',
        'Priority synthesis queue',
      ],
      current: user?.subscription === 'creator',
      popular: true,
    },
    {
      id: 'pro',
      name: 'Studio Pro',
      desc: 'For agencies, professional audiobook publishers, and SaaS platforms.',
      priceMonthly: 49,
      priceAnnual: 39,
      characters: '500,000 chars / month',
      features: [
        'Unlimited access to all studio voices',
        'Priority high-speed GPU rendering',
        'Long-form audiobook batch mode',
        'SRT Subtitle auto-sync',
        'Commercial license & copyright protection',
        'Dedicated 24/7 VIP engineer support',
        'Custom voice personality fine-tuning',
      ],
      current: user?.subscription === 'pro',
      popular: false,
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    await updateProfile({
      subscription: planId as any,
      characterLimit: planId === 'free' ? 10000 : planId === 'creator' ? 100000 : 500000,
    });
    success(`Subscribed to the ${planId.toUpperCase()} plan!`);
    onUpgradeSuccess?.();
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
                  {plan.current ? 'Current Plan' : 'Select ' + plan.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
