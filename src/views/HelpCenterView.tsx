import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  BookOpen,
  Send,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Mic,
  Video,
  FileText,
  Volume2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { SupportTicketItem } from '../types';

export const HelpCenterView: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'technical' | 'billing' | 'feature' | 'feedback'>('technical');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/support/tickets')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tickets) setTickets(data.tickets);
      })
      .catch(() => {});
  }, []);

  const faqs = [
    {
      q: 'How does Voice Cloning work in VoiceFlow AI?',
      a: 'Upload a 10 to 60-second clear speech sample without background noise. Our neural engine extracts the acoustic vocal timbre, pitch harmonics, and speaking cadence. Once confirmed with ethical consent, you can synthesize unlimited speech with your cloned voice.',
    },
    {
      q: 'Which languages are supported with native emotion?',
      a: 'VoiceFlow supports Urdu (including Nastaliq and Roman Urdu), English (US, UK, Australia), Hindi, Punjabi, Arabic, Spanish, French, German, Japanese, and Portuguese with authentic emotional presets: Happy, Sad, Storyteller, Calm, and Professional.',
    },
    {
      q: 'Can I use generated voices in monetized YouTube and TikTok videos?',
      a: 'Yes! All Pro and Premium tier generations include full commercial monetization rights for YouTube, TikTok, podcasts, audiobooks, and client work with royalty-free licensing.',
    },
    {
      q: 'How accurate is the AI Video Dubbing tool?',
      a: 'Video dubbing utilizes a multi-step neural pipeline: audio extraction, Whisper STT transcription, neural translation preserving sentence length, speaker voice replication, and automated SRT subtitle synchrony.',
    },
    {
      q: 'What formats can I export my audio projects in?',
      a: 'You can export in standard broadcast MP3 (192kbps - 320kbps) as well as uncompressed 24-bit lossless WAV files ready for studio post-production.',
    },
  ];

  const tutorials = [
    {
      title: 'Voice Cloning Workflow',
      desc: 'Learn how to record high-clarity voice samples and clone custom voice personalities.',
      icon: Mic,
      duration: '4 min read',
    },
    {
      title: 'AI Writing & Script Studio',
      desc: 'Generate YouTube scripts, viral hooks, ad copy, and social posts with tone and style controls.',
      icon: Volume2,
      duration: '5 min read',
    },
    {
      title: 'AI Video Dubbing & Subtitles',
      desc: 'Translate English videos to Urdu, Hindi, or Arabic with voice replacement in 3 clicks.',
      icon: Video,
      duration: '6 min read',
    },
    {
      title: 'AI Script Writing & Voice Pacing',
      desc: 'Master the 12 specialized script generation tools and emotion delivery controls.',
      icon: FileText,
      duration: '3 min read',
    },
  ];

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: ticketSubject,
          category: ticketCategory,
          message: ticketMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTickets((prev) => [data.ticket, ...prev]);
      setTicketSubject('');
      setTicketMessage('');
      success('Support ticket created! We will reply via email shortly.');
    } catch (err: any) {
      toastError(err.message || 'Ticket creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="help-center-view" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-[#121324] border border-purple-500/20 shadow-xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base & Dedicated Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">How Can We Help You?</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Explore documentation, master studio workflows, browse answers, or submit a priority support ticket.
        </p>

        {/* Search */}
        <div className="relative max-w-lg mx-auto pt-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs, features, guides..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Tutorials Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <span>Step-by-Step Studio Tutorials</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tutorials.map((tut, idx) => {
            const Icon = tut.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#12131e] border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/50 text-purple-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white">{tut.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{tut.desc}</p>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{tut.duration}</span>
                  <span className="text-purple-400 font-bold hover:underline cursor-pointer">
                    Read Guide →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#12131e] border border-slate-800 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about voice synthesis & billing.</p>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-200 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Support & Ticket Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submit Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12131e] border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Contact Support / Report Issue</span>
            </h3>
            <p className="text-xs text-slate-400">
              Our engineering team responds within 2 hours on business days.
            </p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Category</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value="technical">Technical / Audio Synthesis</option>
                <option value="billing">Billing & Subscription</option>
                <option value="feature">Feature Request / Voice Dialect</option>
                <option value="feedback">General Feedback</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Subject</label>
              <input
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Brief summary of issue or question..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Detailed Message</label>
              <textarea
                rows={4}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Please describe what happened, language used, or requested feature..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
            </button>
          </form>
        </div>

        {/* Existing Tickets Feed */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12131e] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Your Support Tickets</h3>
              <p className="text-xs text-slate-400">Track resolution status of your submissions.</p>
            </div>

            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-purple-400 font-bold">{t.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'in-progress'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white">{t.subject}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{t.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-purple-300 text-xs">
            Direct VIP Support Email:{' '}
            <span className="font-mono font-bold text-white">support@voiceflow.ai</span>
          </div>
        </div>
      </div>
    </div>
  );
};
