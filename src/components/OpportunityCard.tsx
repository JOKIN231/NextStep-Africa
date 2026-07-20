import React, { useState } from 'react';
import { Calendar, MapPin, Tag, Share2, Bookmark, BookmarkCheck, ExternalLink, Building2, ClipboardCheck, Gift, Clock, X } from 'lucide-react';
import { Opportunity } from '../types';
import { trackEvent } from '../lib/analytics';
import { motion, AnimatePresence } from 'motion/react';
import SmartImage from './SmartImage';

interface OpportunityCardProps {
  key?: string;
  opportunity: Opportunity;
  isSaved: boolean;
  onToggleSave: () => void;
  onShare?: (title: string, id: string) => void;
}

type DeadlineTone = 'closed' | 'urgent' | 'warning' | 'safe' | 'neutral';

const DEADLINE_CHIP_STYLES: Record<DeadlineTone, string> = {
  closed: 'bg-white/5 text-frost-dim/60 border-white/10',
  urgent: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  warning: 'bg-amber-signal/15 text-amber-signal border-amber-signal/30',
  safe: 'bg-pulse/15 text-pulse border-pulse/30',
  neutral: 'bg-glow-indigo/15 text-glow-indigo border-glow-indigo/30',
};

export default function OpportunityCard({ opportunity, isSaved, onToggleSave, onShare }: OpportunityCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Fellowship':
        return 'bg-pulse/10 text-pulse border-pulse/25';
      case 'Internship':
        return 'bg-glow-indigo/10 text-glow-indigo border-glow-indigo/25';
      case 'Job':
        return 'bg-amber-signal/10 text-amber-signal border-amber-signal/25';
      case 'Funding':
        return 'bg-cyan-400/10 text-cyan-300 border-cyan-400/25';
      case 'Scholarship':
        return 'bg-purple-400/10 text-purple-300 border-purple-400/25';
      default:
        return 'bg-rose-400/10 text-rose-300 border-rose-400/25';
    }
  };

  // Interactive deadline tracking — a subtle alert chip that escalates in
  // urgency as the window closes, rather than plain static text.
  const getDeadlineInfo = (deadlineStr: string): { label: string; tone: DeadlineTone } => {
    if (deadlineStr.toLowerCase() === 'rolling') {
      return { label: 'Rolling Admission', tone: 'neutral' };
    }
    const deadlineDate = new Date(deadlineStr);
    if (isNaN(deadlineDate.getTime())) return { label: deadlineStr, tone: 'neutral' };

    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Closed', tone: 'closed' };
    if (diffDays === 0) return { label: 'Closes today', tone: 'urgent' };
    if (diffDays <= 7) return { label: `${diffDays}d left`, tone: 'urgent' };
    if (diffDays <= 30) return { label: `${diffDays}d left`, tone: 'warning' };
    return { label: `${diffDays}d left`, tone: 'safe' };
  };

  const formattedDeadline = (deadlineStr: string) => {
    if (deadlineStr.toLowerCase() === 'rolling') return 'Rolling Admission';
    try {
      const opt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(deadlineStr).toLocaleDateString('en-US', opt);
    } catch {
      return deadlineStr;
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(opportunity.title, opportunity.id);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/?oppId=${opportunity.id}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const deadlineInfo = getDeadlineInfo(opportunity.deadline);

  return (
    <>
      {/* Grid Card */}
      <motion.div
        id={`opp-card-${opportunity.id}`}
        layout
        whileHover={{ y: -6 }}
        className="group bg-glass/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col justify-between relative transition-all duration-300 ease-out overflow-hidden hover:border-white/25 hover:shadow-2xl hover:shadow-indigo-500/10"
      >
        {/* Image Banner */}
        <SmartImage
          src={opportunity.imageUrl}
          seed={opportunity.id}
          category={opportunity.opportunityType}
          alt={opportunity.title}
          className="-mx-6 -mt-6 mb-4 h-36 rounded-t-2xl"
        />

        {/* Top Header Row */}
        <div>
          <div className="flex justify-between items-start gap-4 mb-4">
            <span
              id={`opp-card-badge-${opportunity.id}`}
              className={`text-xs font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase font-display ${getTypeStyles(opportunity.opportunityType)}`}
            >
              {opportunity.opportunityType}
            </span>
            
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                id={`opp-card-share-btn-${opportunity.id}`}
                onClick={handleShareClick}
                className="p-1.5 rounded-lg text-frost-dim hover:text-frost hover:bg-white/10 transition-all duration-300 ease-out cursor-pointer"
                title="Copy share link"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
              <button
                id={`opp-card-bookmark-btn-${opportunity.id}`}
                onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                className={`p-1.5 rounded-lg transition-all duration-300 ease-out cursor-pointer ${
                  isSaved 
                    ? 'text-amber-signal bg-amber-signal/10 hover:bg-amber-signal/20' 
                    : 'text-frost-dim hover:text-amber-signal hover:bg-white/10'
                }`}
                title={isSaved ? "Saved to Tracker" : "Save to Tracker"}
              >
                {isSaved ? <BookmarkCheck className="w-4.5 h-4.5" /> : <Bookmark className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Org & Title */}
          <div className="mb-3.5">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-frost-dim mb-1">
              <Building2 className="w-3.5 h-3.5 text-frost-dim shrink-0" />
              <span className="line-clamp-1">{opportunity.organization}</span>
            </div>
            <h3 className="font-display font-bold text-base text-frost leading-snug group-hover:text-amber-signal transition-colors duration-300 line-clamp-2">
              {opportunity.title}
            </h3>
          </div>

          {/* Meta (Location & Deadline) */}
          <div className="space-y-1.5 mb-4 border-b border-white/10 pb-3 text-xs text-frost-dim">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-frost-dim shrink-0" />
              <span className="line-clamp-1">{opportunity.location} ({opportunity.locationType})</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-frost-dim shrink-0" />
                <span className="font-medium">Deadline: {formattedDeadline(opportunity.deadline)}</span>
              </div>
              <span className={`flex items-center space-x-1 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase font-mono border shrink-0 ${DEADLINE_CHIP_STYLES[deadlineInfo.tone]}`}>
                {deadlineInfo.tone === 'urgent' && <Clock className="w-3 h-3 shrink-0" />}
                <span>{deadlineInfo.label}</span>
              </span>
            </div>
          </div>

          {/* Description Excerpt */}
          <p className="text-xs text-frost-dim line-clamp-3 mb-4 leading-relaxed">
            {opportunity.description}
          </p>
        </div>

        {/* Card Footer: Tags & CTA */}
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {opportunity.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] font-medium text-frost-dim bg-white/5 px-2 py-0.5 rounded font-mono">
                #{tag}
              </span>
            ))}
            {opportunity.tags.length > 3 && (
              <span className="text-[10px] font-bold text-frost-dim/70 font-mono px-1">
                +{opportunity.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Button CTA */}
          <div className="flex items-center gap-2">
            <button
              id={`opp-card-details-btn-${opportunity.id}`}
              onClick={() => setShowModal(true)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-frost border border-white/10 hover:border-white/25 font-bold text-xs py-2 rounded-full transition-all duration-300 ease-out text-center cursor-pointer"
            >
              Requirements & Details
            </button>
            <a
              id={`opp-card-apply-btn-${opportunity.id}`}
              href={opportunity.applyUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('opportunity_apply_click', { opportunity_id: opportunity.id, opportunity_title: opportunity.title, source: 'card' })}
              className="px-4 py-2 rounded-full bg-amber-signal hover:bg-amber-signal-hover text-void transition-all duration-300 ease-out cursor-pointer flex items-center justify-center active:scale-95"
              title="Apply directly on organization website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {copiedShare && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-void text-frost text-[10px] px-2 py-1 rounded font-mono z-10 animate-fade-in shadow-lg border border-white/15">
            Share link copied!
          </div>
        )}
      </motion.div>

      {/* Details Modal overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-void-deep/80 backdrop-blur-sm">
            <motion.div
              id={`opp-modal-${opportunity.id}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-glass/95 backdrop-blur-md rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl shadow-indigo-500/10 border border-white/15 flex flex-col"
            >
              {/* Hero Image */}
              <SmartImage
                src={opportunity.imageUrl}
                seed={opportunity.id}
                category={opportunity.opportunityType}
                alt={opportunity.title}
                className="h-44 sm:h-56 shrink-0 rounded-t-3xl sm:rounded-t-2xl"
              />

              {/* Header */}
              <div className="p-6 border-b border-white/10 sticky top-0 bg-glass/95 backdrop-blur-md z-10 flex justify-between items-start gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-display tracking-wider uppercase ${getTypeStyles(opportunity.opportunityType)}`}>
                      {opportunity.opportunityType}
                    </span>
                    <span className="text-[10px] text-frost-dim font-mono font-medium flex items-center bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3 mr-1 text-frost-dim" />
                      {opportunity.location} ({opportunity.locationType})
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono uppercase ${DEADLINE_CHIP_STYLES[deadlineInfo.tone]}`}>
                      {deadlineInfo.label}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-xl text-frost leading-tight">
                    {opportunity.title}
                  </h2>
                  <p className="text-sm text-pulse font-semibold mt-1">
                    {opportunity.organization}
                  </p>
                </div>
                <button
                  id={`opp-modal-close-${opportunity.id}`}
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-frost-dim hover:text-frost hover:bg-white/10 cursor-pointer transition-all duration-300 ease-out shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-6">
                
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-frost-dim uppercase tracking-wider font-mono flex items-center mb-2.5">
                    <Building2 className="w-4 h-4 mr-1.5 text-glow-indigo" />
                    Opportunity Overview
                  </h4>
                  <p className="text-sm text-frost-dim leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                    {opportunity.description}
                  </p>
                </div>

                {/* Eligibility Requirements */}
                <div>
                  <h4 className="text-xs font-bold text-frost-dim uppercase tracking-wider font-mono flex items-center mb-2.5">
                    <ClipboardCheck className="w-4 h-4 mr-1.5 text-amber-signal" />
                    Eligibility & Requirements
                  </h4>
                  <p className="text-sm text-frost-dim leading-relaxed border-l-2 border-amber-signal pl-4">
                    {opportunity.eligibility}
                  </p>
                </div>

                {/* Benefits & Funding */}
                <div>
                  <h4 className="text-xs font-bold text-frost-dim uppercase tracking-wider font-mono flex items-center mb-2.5">
                    <Gift className="w-4 h-4 mr-1.5 text-pulse" />
                    Benefits & Funding Coverage
                  </h4>
                  <p className="text-sm text-frost-dim leading-relaxed border-l-2 border-pulse pl-4">
                    {opportunity.benefits}
                  </p>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10 text-xs text-frost-dim">
                  <div>
                    <span className="font-mono text-frost-dim/70 block mb-1">DEADLINE</span>
                    <span className="font-semibold text-frost flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-frost-dim" />
                      {formattedDeadline(opportunity.deadline)}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-frost-dim/70 block mb-1">PUBLISHED ON</span>
                    <span className="font-semibold text-frost flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-frost-dim" />
                      {new Date(opportunity.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {opportunity.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-medium text-frost-dim bg-white/5 border border-white/10 px-3 py-1 rounded-full font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-white/10 bg-white/[0.03] flex items-center justify-between gap-4 sticky bottom-0 z-10">
                <button
                  id={`opp-modal-save-btn-${opportunity.id}`}
                  onClick={() => { onToggleSave(); }}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ease-out cursor-pointer border ${
                    isSaved 
                      ? 'bg-amber-signal/10 text-amber-signal border-amber-signal/30 hover:bg-amber-signal/20' 
                      : 'bg-white/5 text-frost hover:bg-white/10 border-white/10'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-signal" /> : <Bookmark className="w-4 h-4 text-frost-dim" />}
                  <span>{isSaved ? "Saved to Career Tracker" : "Save for Later"}</span>
                </button>
                
                <a
                  id={`opp-modal-apply-btn-${opportunity.id}`}
                  href={opportunity.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('opportunity_apply_click', { opportunity_id: opportunity.id, opportunity_title: opportunity.title, source: 'modal' })}
                  className="flex items-center space-x-2 bg-amber-signal hover:bg-amber-signal-hover text-void font-bold text-xs px-6 py-2.5 rounded-lg shadow-md shadow-amber-signal/20 transition-all duration-300 ease-out cursor-pointer active:scale-95"
                >
                  <span>Apply Direct on Org Site</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
