import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RotateCw,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Calendar,
  DollarSign,
  AlertTriangle,
  XCircle,
  FileText,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PaymentRequest } from '../types';
import { ManualPaymentModal } from '../components/ManualPaymentModal';

export const BillingView: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const PAYMENT_NUMBER = '03095793662';

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Live status fetched from backend
  const [latestRequest, setLatestRequest] = useState<PaymentRequest | null>(null);
  const [requestHistory, setRequestHistory] = useState<PaymentRequest[]>([]);
  const [serverPlan, setServerPlan] = useState<'free' | 'pro' | string>('free');
  const [serverStatus, setServerStatus] = useState<string>('active');
  const [renewalDate, setRenewalDate] = useState<string | null>(null);

  const fetchPaymentStatus = useCallback(async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/payments/my-status?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'x-user-email': user.email,
        },
      });
      const data = await res.json();
      if (data.success) {
        setLatestRequest(data.request || null);
        setRequestHistory(data.history || []);
        if (data.currentPlan) setServerPlan(data.currentPlan);
        if (data.subscriptionStatus) setServerStatus(data.subscriptionStatus);
        if (data.renewalDate) setRenewalDate(data.renewalDate);
      }
    } catch {
      // ignore network errors
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER);
    setCopiedNumber(true);
    success('Payment Number 03095793662 copied to clipboard!');
    setTimeout(() => setCopiedNumber(false), 3000);
  };

  // Determine current active plan from verified server status
  const isPro = serverPlan === 'pro' || user?.subscription === 'pro';
  const paymentStatus = latestRequest ? latestRequest.status : null; // 'PENDING' | 'APPROVED' | 'REJECTED' | null

  return (
    <div id="billing-view-container" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Settings Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span>Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-purple-600 dark:text-purple-400 font-bold">Billing / Subscription</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Billing & Subscription</span>
            {isPro ? (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase font-extrabold tracking-wider">
                Pro Plan Active
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 uppercase font-extrabold tracking-wider">
                Free Starter Plan
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your VoiceFlow AI subscription, manual payment verification, and invoices.
          </p>
        </div>

        <button
          onClick={fetchPaymentStatus}
          disabled={isLoading}
          className="self-start md:self-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CURRENT SUBSCRIPTION & PAYMENT STATUS CARD                             */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Current Membership Tier
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-3">
              <span>{isPro ? 'PRO Plan' : 'FREE Starter Plan'}</span>
              {isPro && <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Pill */}
            {paymentStatus === 'PENDING' && (
              <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Payment Status: PENDING
                </span>
              </div>
            )}

            {paymentStatus === 'APPROVED' && (
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Payment Status: APPROVED
                </span>
              </div>
            )}

            {paymentStatus === 'REJECTED' && (
              <div className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Payment Status: REJECTED
                </span>
              </div>
            )}

            {!paymentStatus && !isPro && (
              <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                No Active Payment Request
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Condition Displays according to User Flow Spec */}
        {isPro ? (
          /* IF PRO: "Your Pro plan is active." */
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                  Your Pro plan is active.
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300/80">
                  All Pro Studio features, 100,000 character allowance, multi-language speech, and priority rendering are fully unlocked.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-emerald-500/20 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Plan Tier:</span>
                <p className="font-bold text-slate-900 dark:text-white">Pro Creator</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Payment Verified By:</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {latestRequest?.reviewedBy || 'Admin (Verified)'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Pro Expiry / Renewal:</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {renewalDate || latestRequest?.reviewedAt
                    ? new Date(renewalDate || Date.now() + 30 * 86400000).toLocaleDateString()
                    : 'Active (30-day term)'}
                </p>
              </div>
            </div>
          </div>
        ) : paymentStatus === 'PENDING' ? (
          /* IF PENDING: "Your payment is being reviewed." */
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] font-extrabold uppercase">
                  <span>Status: PENDING</span>
                </div>
                <h3 className="text-lg font-black text-amber-900 dark:text-amber-200">
                  Your payment is being reviewed.
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Your payment request has been received and is queued for verification by the Admin.
                  Once verified, your Pro membership will activate immediately.
                </p>
              </div>
            </div>

            {latestRequest && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-amber-300/40 dark:border-amber-800/40 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Transaction ID (TID):</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">
                    {latestRequest.transactionId}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Amount Sent:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{latestRequest.amount}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Submitted Date:</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {new Date(latestRequest.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Payment Number:</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">
                    {latestRequest.paymentNumber || PAYMENT_NUMBER}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : paymentStatus === 'REJECTED' ? (
          /* IF REJECTED */
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/60 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 text-[11px] font-extrabold uppercase">
                  <span>Status: REJECTED</span>
                </div>
                <h3 className="text-lg font-black text-rose-900 dark:text-rose-200">
                  Payment Request Not Verified
                </h3>
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  <strong>Admin Reason:</strong>{' '}
                  {latestRequest?.adminNote ||
                    'Transaction ID could not be located in bank records. Please check the TID or re-upload your receipt screenshot.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-rose-300/40 dark:border-rose-800/40">
              <span className="text-xs text-slate-500">Your account remains on the Free plan.</span>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all cursor-pointer"
              >
                Submit New Payment Request
              </button>
            </div>
          </div>
        ) : (
          /* IF FREE (NO REQUEST SUBMITTED YET) */
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                You are currently on the Starter Free tier.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
                Upgrade to Pro Creator to unlock 100,000 monthly characters, all 50+ multilingual neural voices, custom voice cloning, and commercial monetization.
              </p>
            </div>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade to Pro</span>
            </button>
          </div>
        )}

        {/* PROMINENT PAYMENT ACCOUNT CARD */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/90 to-indigo-950 border border-purple-500/40 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                Official Admin Subscription Payment Number
              </div>
              <div className="text-2xl font-mono font-black tracking-wider text-white">
                {PAYMENT_NUMBER}
              </div>
              <div className="text-[11px] text-slate-300">
                Easypaisa • JazzCash • Nayapay • Sadapay • Bank Raast
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopyNumber}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedNumber
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
              }`}
            >
              {copiedNumber ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNumber ? 'Number Copied!' : 'Copy Payment Number'}</span>
            </button>

            {!isPro && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PLANS COMPARISON (FREE VS PRO)                                         */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Choose Your Production Plan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FREE STARTER PLAN */}
          <div
            className={`p-6 rounded-3xl border bg-white dark:bg-slate-900 transition-all ${
              !isPro
                ? 'border-purple-600 ring-2 ring-purple-600/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Starter Tier
              </span>
              {!isPro && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Current Plan
                </span>
              )}
            </div>

            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Free Plan</h3>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                PKR 0 <span className="text-xs font-normal text-slate-500">/ forever</span>
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>10,000 monthly studio characters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Standard natural AI voices</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Standard MP3 audio export</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>2 Active audio projects</span>
              </li>
            </ul>
          </div>

          {/* PRO CREATOR PLAN */}
          <div
            className={`p-6 rounded-3xl border bg-white dark:bg-slate-900 relative transition-all shadow-xl ${
              isPro
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-purple-600 dark:border-purple-500 ring-2 ring-purple-600/30'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Most Popular
              </span>
              {isPro ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Current Active Plan
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Manual Verification
                </span>
              )}
            </div>

            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Pro Creator</span>
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              </h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                PKR 2,500 <span className="text-xs font-normal text-slate-500">/ month ($29)</span>
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>100,000 monthly characters (10x Free)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>All 50+ Multilingual neural voices & emotions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Custom Voice Cloning (up to 5 clones)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Lossless WAV & Studio MP3 exports</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>AI Video Dubbing with subtitle sync</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Priority GPU synthesis & commercial rights</span>
              </li>
            </ul>

            <div className="mt-6">
              {isPro ? (
                <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center border border-emerald-500/20">
                  Plan Active — Renews {renewalDate || 'in 30 days'}
                </div>
              ) : (
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade to Pro Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PAYMENT REQUESTS HISTORY & INVOICES                                    */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Payment Request & Subscription History
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {requestHistory.length} Record{requestHistory.length === 1 ? '' : 's'}
          </span>
        </div>

        {requestHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No manual payment requests logged yet. Click &quot;Upgrade to Pro&quot; to submit a subscription request.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[10px] text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Transaction ID (TID)</th>
                  <th className="py-3 px-4">Payment Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Admin Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requestHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {item.planName || item.plan.toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {item.amount}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {item.transactionId}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{item.paymentNumber}</td>
                    <td className="py-3.5 px-4">
                      {item.status === 'PENDING' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          Pending
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Approved
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'APPROVED' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Approved by {item.reviewedBy || 'Admin'}
                        </span>
                      ) : item.status === 'REJECTED' ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          {item.adminNote || 'Transaction rejected'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Under review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Payment Modal */}
      <ManualPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSubmitted={(req) => {
          fetchPaymentStatus();
        }}
      />
    </div>
  );
};
