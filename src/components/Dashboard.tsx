import React, { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { Opportunity, SavedOpportunity } from '../types';
import { BookmarkCheck, Calendar, Clock, Edit3, Trash2, ArrowRightLeft, LayoutGrid, CheckSquare, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  opportunities: Opportunity[];
  onRemoveBookmark: (oppId: string) => void;
  setCurrentTab: (tab: string) => void;
}

export default function Dashboard({ opportunities, onRemoveBookmark, setCurrentTab }: DashboardProps) {
  const [savedItems, setSavedItems] = useState<SavedOpportunity[]>([]);
  const [activeItemNotesId, setActiveItemNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [tempDeadline, setTempDeadline] = useState('');

  useEffect(() => {
    setSavedItems(db.getSavedOpportunities());
  }, [opportunities]);

  const handleUpdateStatus = (oppId: string, status: SavedOpportunity['status']) => {
    const matched = savedItems.find(s => s.opportunityId === oppId);
    if (matched) {
      const updated = db.saveOpportunityToTracker({
        ...matched,
        status
      });
      setSavedItems(db.getSavedOpportunities());
    }
  };

  const handleSaveNotesAndDeadline = (oppId: string) => {
    const matched = savedItems.find(s => s.opportunityId === oppId);
    if (matched) {
      db.saveOpportunityToTracker({
        ...matched,
        notes: tempNotes,
        targetDeadline: tempDeadline
      });
      setSavedItems(db.getSavedOpportunities());
      setActiveItemNotesId(null);
    }
  };

  const handleStartEditing = (item: SavedOpportunity) => {
    setActiveItemNotesId(item.opportunityId);
    setTempNotes(item.notes || '');
    setTempDeadline(item.targetDeadline || '');
  };

  // Compute Stats
  const totalSaved = savedItems.length;
  const draftingCount = savedItems.filter(i => i.status === 'Drafting').length;
  const submittedCount = savedItems.filter(i => i.status === 'Submitted').length;
  const interviewCount = savedItems.filter(i => i.status === 'Interview').length;
  const acceptedCount = savedItems.filter(i => i.status === 'Accepted').length;

  // Get full Opportunity structures
  const enrichedItems = savedItems.map(saved => {
    const opp = opportunities.find(o => o.id === saved.opportunityId);
    return {
      saved,
      opp
    };
  }).filter(item => item.opp !== undefined) as { saved: SavedOpportunity; opp: Opportunity }[];

  const getStatusBadgeStyles = (status: SavedOpportunity['status']) => {
    switch (status) {
      case 'Interested':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Drafting':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Submitted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Interview':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <div id="tracker-dashboard" className="bg-slate-50 -mt-px">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-brand-navy rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-brand-navy">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BookmarkCheck className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-brand-green px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>STUDENT & PROFESSIONAL WORKSPACE</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight leading-tight">
            Your Public Health Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
            Organize your upcoming fellowships, jobs, and research deadlines in one clean dashboard. Plan submissions, update pipeline stages, and document your goals.
          </p>
        </div>
      </div>

      {/* Analytics Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-2xl text-left shadow-xs">
          <p className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">TOTAL BOOKMARKED</p>
          <p className="text-2xl font-bold font-display text-brand-navy mt-1">{totalSaved}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-2xl text-left shadow-xs">
          <p className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">IN DRAFT PHASE</p>
          <p className="text-2xl font-bold font-display text-amber-600 mt-1">{draftingCount}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-2xl text-left shadow-xs">
          <p className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">APPLICATIONS SUBMITTED</p>
          <p className="text-2xl font-bold font-display text-purple-700 mt-1">{submittedCount}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-2xl text-left shadow-xs">
          <p className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">ACTIVE INTERVIEWS</p>
          <p className="text-2xl font-bold font-display text-indigo-700 mt-1">{interviewCount}</p>
        </div>
      </div>

      {/* Tracker Grid Content */}
      {enrichedItems.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-brand-navy">Your pipeline is empty</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              You haven't bookmarked any public health opportunities yet. Browse our directory and click the bookmark button on any opportunity to start tracking.
            </p>
          </div>
          <button
            id="tracker-browse-btn"
            onClick={() => setCurrentTab('opportunities')}
            className="inline-flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-xs cursor-pointer"
          >
            <span>Browse Opportunities</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-display font-extrabold text-lg text-brand-navy border-b border-slate-100 pb-2">
            Active Applications Pipeline
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {enrichedItems.map(({ saved, opp }) => (
                <motion.div
                  id={`tracker-item-${opp.id}`}
                  key={opp.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-brand-navy/35 hover:shadow-md transition-all duration-300"
                >
                  <div>
                    {/* Top Stats Label */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadgeStyles(saved.status)}`}>
                          {saved.status}
                        </span>
                      </div>
                      
                      <button
                        id={`tracker-remove-${opp.id}`}
                        onClick={() => onRemoveBookmark(opp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Remove from Tracker"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Org and Title */}
                    <div className="mb-4">
                      <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">{opp.organization}</p>
                      <h3 className="font-display font-bold text-sm text-brand-navy leading-snug">{opp.title}</h3>
                    </div>

                    {/* Progress Control buttons */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 space-y-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                        Update Pipeline Stage
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(['Interested', 'Drafting', 'Submitted', 'Interview', 'Accepted', 'Rejected'] as SavedOpportunity['status'][]).map((stage) => (
                          <button
                            id={`stage-btn-${opp.id}-${stage}`}
                            key={stage}
                            onClick={() => handleUpdateStatus(opp.id, stage)}
                            className={`text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                              saved.status === stage
                                ? 'bg-brand-navy text-white shadow-xs'
                                : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-100'
                            }`}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Deadline and Notes values */}
                    <div className="space-y-2.5 text-xs text-slate-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-500">Official Deadline:</span>
                        <span className="font-bold text-brand-navy">
                          {opp.deadline.toLowerCase() === 'rolling' ? 'Rolling' : new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      </div>

                      {saved.targetDeadline && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                          <span className="font-medium text-slate-500">Your Target Submission Date:</span>
                          <span className="font-bold text-brand-orange">
                            {new Date(saved.targetDeadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {saved.notes && (
                        <div className="bg-slate-50 border-l-3 border-brand-green p-3 rounded-r-lg text-xs leading-relaxed text-slate-600">
                          <span className="font-mono text-[9px] font-bold text-slate-400 uppercase block mb-1">My Checklist & Notes</span>
                          {saved.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form toggle and save */}
                  <div>
                    {activeItemNotesId === opp.id ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-slate-100 pt-3 mt-3 space-y-3 bg-slate-50/50 p-3 rounded-lg border border-slate-200"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Target Submission Date</label>
                          <input
                            id={`edit-deadline-input-${opp.id}`}
                            type="date"
                            value={tempDeadline}
                            onChange={(e) => setTempDeadline(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-navy"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Application Notes / Checklist</label>
                          <textarea
                            id={`edit-notes-input-${opp.id}`}
                            rows={3}
                            placeholder="Add your login, checklist tasks, or interview notes..."
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:outline-hidden focus:ring-1 focus:ring-brand-navy resize-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            id={`cancel-notes-btn-${opp.id}`}
                            onClick={() => setActiveItemNotesId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            id={`save-notes-btn-${opp.id}`}
                            onClick={() => handleSaveNotesAndDeadline(opp.id)}
                            className="bg-brand-green hover:bg-brand-green-hover text-white px-3 py-1 rounded font-semibold cursor-pointer"
                          >
                            Save Updates
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <button
                        id={`edit-tracker-btn-${opp.id}`}
                        onClick={() => handleStartEditing(saved)}
                        className="w-full border border-slate-200 hover:border-brand-navy/20 hover:bg-brand-navy/5 text-brand-navy font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit notes & target dates</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
