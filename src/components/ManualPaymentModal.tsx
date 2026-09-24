import React, { useState, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  Upload,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
  Phone,
  FileCheck,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PaymentRequest } from '../types';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSubmitted?: (request: PaymentRequest) => void;
  defaultPlan?: 'pro' | 'business';
}

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSubmitted,
  defaultPlan = 'pro',
}) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const PAYMENT_NUMBER = '03095793662';

  // Step state & forms
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'annual'>('monthly');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [senderName, setSenderName] = useState(user?.name || '');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [paymentScreenshotName, setPaymentScreenshotName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Easypaisa / JazzCash / Mobile Banking');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<PaymentRequest | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const planAmount = selectedCycle === 'annual' ? 'PKR 24,000' : 'PKR 2,500';
  const planUsdEquivalent = selectedCycle === 'annual' ? '$240 / yr (Save 20%)' : '$29 / mo';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER);
    setCopied(true);
    success('Payment number copied to clipboard: ' + PAYMENT_NUMBER);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastError('Please select a valid image screenshot (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastError('Screenshot file size must be less than 5MB.');
      return;
    }

    setPaymentScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentScreenshot(reader.result as string);
      success('Payment screenshot uploaded successfully.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      toastError('Please enter your Transaction ID (Trx ID / TID).');
      return;
    }

    if (!paymentScreenshot) {
      toastError('Please upload a screenshot of your payment receipt as proof.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify({
          userId: user?.id || 'u-' + Date.now(),
          userEmail: user?.email || '',
          userName: user?.name || senderName || 'User',
          plan: 'pro',
          planName: `Pro Creator (${selectedCycle === 'annual' ? 'Annual' : 'Monthly'})`,
          amount: planAmount,
          paymentNumber: PAYMENT_NUMBER,
          transactionId: transactionId.trim(),
          paymentScreenshot,
          senderNumber: senderNumber.trim(),
          senderName: senderName.trim(),
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment request.');
      }

      setSubmittedRequest(data.paymentRequest);
      success('Payment submitted successfully! Your payment will be reviewed by Admin.');
      if (onPaymentSubmitted && data.paymentRequest) {
        onPaymentSubmitted(data.paymentRequest);
      }
    } catch (err: any) {
      toastError(err.message || 'Error submitting payment request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetModal = () => {
    setSubmittedRequest(null);
    setTransactionId('');
    setPaymentScreenshot('');
    setPaymentScreenshotName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={handleResetModal}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Upgrade to Pro</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Manual Approval
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official VoiceFlow Studio Subscription Payment Verification
              </p>
            </div>
          </div>
          <button
            onClick={handleResetModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {submittedRequest ? (
            /* SUBMITTED CONFIRMATION STATE */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-500 mx-auto flex items-center justify-center animate-bounce">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Status: PENDING ADMIN REVIEW
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Payment Submitted Successfully
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Your payment has been logged in the system and will be verified manually by the Admin.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Selected Plan</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {submittedRequest.planName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Amount Sent</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {submittedRequest.amount}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Admin Payment Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {submittedRequest.paymentNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Transaction ID (TID)</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {submittedRequest.transactionId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Submission Time</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(submittedRequest.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 text-xs text-blue-800 dark:text-blue-300 max-w-md mx-auto flex items-start gap-3 text-left">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-bold">Next Steps:</p>
                  <p className="mt-1 opacity-90">
                    Once the Admin verifies your transaction against the account records, your account will be upgraded to <strong>PRO</strong> automatically and all Pro studio features will unlock.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Done / Close
                </button>
              </div>
            </div>
          ) : (
            /* STEP-BY-STEP PAYMENT FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step Flow Indicators */}
              <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold">
                {[
                  { step: '1', title: 'Plan' },
                  { step: '2', title: 'Send' },
                  { step: '3', title: 'TID' },
                  { step: '4', title: 'Proof' },
                  { step: '5', title: 'Approval' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-1"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-mono">
                      {item.step}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-full">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Choose Billing Cycle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    1. Choose Subscription Cycle
                  </label>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    Pro Creator Plan
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCycle('monthly')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedCycle === 'monthly'
                        ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 ring-2 ring-purple-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Monthly Pass
                      </span>
                      {selectedCycle === 'monthly' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                      PKR 2,500{' '}
                      <span className="text-xs font-normal text-slate-500">/ month</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">$29 USD equivalent</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCycle('annual')}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      selectedCycle === 'annual'
                        ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 ring-2 ring-purple-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="absolute -top-2 right-3 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold uppercase rounded-full">
                      Save 20%
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Annual Pass
                      </span>
                      {selectedCycle === 'annual' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                      PKR 24,000{' '}
                      <span className="text-xs font-normal text-slate-500">/ year</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">$240 USD equivalent</div>
                  </button>
                </div>
              </div>

              {/* Step 2: PROMINENT PAYMENT CARD WITH 03095793662 */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white shadow-xl relative overflow-hidden border border-purple-500/30 space-y-4">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span>2. Send your payment to the following number:</span>
                  </div>
                  <span className="text-xs bg-purple-500/30 text-purple-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    Required: {planAmount}
                  </span>
                </div>

                {/* Big Number Card */}
                <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-xs text-slate-400 font-medium">
                      Admin Official Payment Account
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white">
                      {PAYMENT_NUMBER}
                    </div>
                    <div className="text-[11px] text-purple-300">
                      Supports: JazzCash • Easypaisa • Nayapay • Sadapay • Bank Raast
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied Number!' : 'Copy Number'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300/90 leading-relaxed space-y-1 relative z-10">
                  <p className="font-semibold text-white">Payment Instructions:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-300">
                    <li>Open your mobile banking app (Easypaisa, JazzCash, Nayapay, or Bank).</li>
                    <li>
                      Send exact payment of <strong>{planAmount}</strong> to{' '}
                      <strong>{PAYMENT_NUMBER}</strong>.
                    </li>
                    <li>Save the transfer screenshot / receipt and copy the Transaction ID.</li>
                  </ol>
                </div>
              </div>

              {/* Step 3: Transaction ID & Sender Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    3. Enter Transaction ID & Transfer Details
                  </label>
                  <span className="text-[11px] text-slate-400">Required for manual matching</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Transaction ID (Trx ID / TID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 09283746192 or TID#..."
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Payment Method Used
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Easypaisa">Easypaisa</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="Nayapay">Nayapay</option>
                      <option value="Sadapay">Sadapay</option>
                      <option value="Bank Transfer (Raast)">Bank Transfer (Raast / IBFT)</option>
                      <option value="Other">Other Mobile Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Sender Mobile / Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0300xxxxxxx"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Sender Name (As shown on receipt)
                    </label>
                    <input
                      type="text"
                      placeholder="Sender Account Name"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span>Linked User Account:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {user?.name} ({user?.email})
                  </span>
                </div>
              </div>

              {/* Step 4: Upload Payment Proof / Screenshot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    4. Upload Payment Screenshot <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">PNG, JPG, WebP (Max 5MB)</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />

                {paymentScreenshot ? (
                  <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={paymentScreenshot}
                        alt="Payment Proof"
                        className="w-14 h-14 object-cover rounded-xl border border-emerald-500/30"
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate">
                          {paymentScreenshotName || 'Payment_Proof_Receipt.png'}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" />
                          <span>Screenshot ready for submission</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentScreenshot('');
                        setPaymentScreenshotName('');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 group"
                  >
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-purple-500 mx-auto transition-colors" />
                    <div className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      Click to upload payment receipt screenshot
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Drag & drop your screenshot or browse your device
                    </div>
                  </div>
                )}
              </div>

              {/* Step 5: Submission Policy & Submit Request */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div className="leading-relaxed">
                    <strong>Manual Review Notice:</strong> Your subscription will NOT be activated immediately. Our Admin manually verifies each transaction against the account <strong>{PAYMENT_NUMBER}</strong> before unlocking Pro features. Status will show <strong>PENDING</strong> until approved.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleResetModal}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileCheck className="w-4 h-4" />
                    )}
                    <span>{isSubmitting ? 'Submitting Proof...' : 'Submit Payment Request'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
