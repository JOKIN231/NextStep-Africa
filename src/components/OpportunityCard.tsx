import React, { useState } from 'react';
import { Calendar, MapPin, Tag, Share2, Bookmark, BookmarkCheck, ExternalLink, GraduationCap, Building2, ClipboardCheck, Gift, Clock, AlertCircle, X } from 'lucide-react';
import { Opportunity, SavedOpportunity } from '../types';
import { db } from '../lib/supabase';
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

export default function OpportunityCard({ opportunity, isSaved, onToggleSave, onShare }: OpportunityCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Get opportunity type custom badge colors
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Fellowship':
        return 'bg-blue-50 text-brand-navy border-blue-100/50';
      case 'Internship':
        return 'bg-green-50 text-brand-green border-green-100/50';
      case 'Job':
        return 'bg-amber-50 text-amber-700 border-amber-100/50';
      case 'Funding':
        return 'bg-cyan-50 text-cyan-700 border-cyan-100/50';
      case 'Scholarship':
        return 'bg-purple-50 text-purple-700 border-purple-100/50';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-100/50';
    }
  };

  // Get deadline color & warning badge
  const isDeadlineSoon = (deadlineStr: string) => {
    if (deadlineStr.toLowerCase() === 'rolling') return false;
    const deadlineDate = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 14; // Within 2 weeks
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

  return (
    <>
      {/* Grid Card */}
      <motion.div
        id={`opp-card-${opportunity.id}`}
        layout
        whileHover={{ y: -6, boxShadow: '0 16px 32px -12px rgba(13, 71, 161, 0.12)' }}
        className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between relative transition-all duration-350 overflow-hidden hover:border-brand-navy/40"
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-colors cursor-pointer"
                title="Copy share link"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
              <button
                id={`opp-card-bookmark-btn-${opportunity.id}`}
                onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isSaved 
                    ? 'text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20' 
                    : 'text-slate-400 hover:text-brand-orange hover:bg-slate-100'
                }`}
                title={isSaved ? "Saved to Tracker" : "Save to Tracker"}
              >
                {isSaved ? <BookmarkCheck className="w-4.5 h-4.5" /> : <Bookmark className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Org & Title */}
          <div className="mb-3.5">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{opportunity.organization}</span>
            </div>
            <h3 className="font-display font-bold text-base text-brand-navy leading-snug group-hover:text-brand-orange transition-colors line-clamp-2">
              {opportunity.title}
            </h3>
          </div>

          {/* Meta (Location & Deadline) */}
          <div className="space-y-1.5 mb-4 border-b border-slate-100 pb-3 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{opportunity.location} ({opportunity.locationType})</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">Deadline: {formattedDeadline(opportunity.deadline)}</span>
              </div>
              {isDeadlineSoon(opportunity.deadline) && (
                <span className="flex items-center space-x-1 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Soon</span>
                </span>
              )}
            </div>
          </div>

          {/* Description Excerpt */}
          <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
            {opportunity.description}
          </p>
        </div>

        {/* Card Footer: Tags & CTA */}
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {opportunity.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                #{tag}
              </span>
            ))}
            {opportunity.tags.length > 3 && (
              <span className="text-[10px] font-bold text-slate-400 font-mono px-1">
                +{opportunity.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Button CTA */}
          <div className="flex items-center gap-2">
            <button
              id={`opp-card-details-btn-${opportunity.id}`}
              onClick={() => setShowModal(true)}
              className="flex-1 bg-slate-50 hover:bg-brand-navy/5 text-brand-navy border border-slate-200/50 hover:border-brand-navy/20 font-bold text-xs py-2 rounded-full transition-all text-center cursor-pointer"
            >
              Requirements & Details
            </button>
            <a
              id={`opp-card-apply-btn-${opportunity.id}`}
              href={opportunity.applyUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('opportunity_apply_click', { opportunity_id: opportunity.id, opportunity_title: opportunity.title, source: 'card' })}
              className="px-4 py-2 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white transition-all cursor-pointer flex items-center justify-center"
              title="Apply directly on organization website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {copiedShare && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-mono z-10 animate-fade-in shadow-lg">
            Share link copied!
          </div>
        )}
      </motion.div>

      {/* Details Modal overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              id={`opp-modal-${opportunity.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
            >
              {/* Hero Image */}
              <SmartImage
                src={opportunity.imageUrl}
                seed={opportunity.id}
                category={opportunity.opportunityType}
                alt={opportunity.title}
                className="h-44 sm:h-56 shrink-0 rounded-t-2xl"
              />

              {/* Header */}
              <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-start gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-display tracking-wider uppercase ${getTypeStyles(opportunity.opportunityType)}`}>
                      {opportunity.opportunityType}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-medium flex items-center bg-slate-100 px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                      {opportunity.location} ({opportunity.locationType})
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-xl text-brand-navy leading-tight">
                    {opportunity.title}
                  </h2>
                  <p className="text-sm text-brand-green font-semibold mt-1">
                    {opportunity.organization}
                  </p>
                </div>
                <button
                  id={`opp-modal-close-${opportunity.id}`}
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-6">
                
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center mb-2.5">
                    <Building2 className="w-4 h-4 mr-1.5 text-brand-navy" />
                    Opportunity Overview
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {opportunity.description}
                  </p>
                </div>

                {/* Eligibility Requirements */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center mb-2.5">
                    <ClipboardCheck className="w-4 h-4 mr-1.5 text-brand-orange" />
                    Eligibility & Requirements
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed border-l-3 border-brand-orange pl-4">
                    {opportunity.eligibility}
                  </p>
                </div>

                {/* Benefits & Funding */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center mb-2.5">
                    <Gift className="w-4 h-4 mr-1.5 text-brand-green" />
                    Benefits & Funding Coverage
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed border-l-3 border-brand-green pl-4">
                    {opportunity.benefits}
                  </p>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <div>
                    <span className="font-mono text-slate-400 block mb-1">DEADLINE</span>
                    <span className="font-semibold text-brand-navy flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {formattedDeadline(opportunity.deadline)}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-slate-400 block mb-1">PUBLISHED ON</span>
                    <span className="font-semibold text-brand-navy flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {new Date(opportunity.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {opportunity.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4 sticky bottom-0 z-10">
                <button
                  id={`opp-modal-save-btn-${opportunity.id}`}
                  onClick={() => { onToggleSave(); }}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    isSaved 
                      ? 'bg-brand-orange/10 text-brand-orange border-brand-orange/30 hover:bg-brand-orange/20' 
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4 text-brand-orange" /> : <Bookmark className="w-4 h-4 text-slate-400" />}
                  <span>{isSaved ? "Saved to Career Tracker" : "Save for Later"}</span>
                </button>
                
                <a
                  id={`opp-modal-apply-btn-${opportunity.id}`}
                  href={opportunity.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('opportunity_apply_click', { opportunity_id: opportunity.id, opportunity_title: opportunity.title, source: 'modal' })}
                  className="flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-md shadow-brand-orange/15 transition-all cursor-pointer"
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
