import React, { useState } from 'react';
import { Menu, X, Compass, Search, Award, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSearch?: (query: string) => void;
}

export default function Navbar({ currentTab, setCurrentTab, onSearch }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const menuItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'opportunities', label: 'Opportunities', icon: Award },
    { id: 'blog', label: 'Insights & Blog', icon: Compass },
    { id: 'tracker', label: 'My Career Tracker', icon: BookmarkCheck }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
  };

  return (
    <nav id="app-navbar" className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs backdrop-blur-md bg-white/95 h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              id="nav-logo-btn"
              onClick={() => { setCurrentTab('home'); setIsOpen(false); }} 
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center text-white transform group-hover:scale-105 transition-transform duration-200 shrink-0 shadow-sm">
                <div className="w-5 h-5 border-2 border-white rounded-xs rotate-45 flex items-center justify-center">
                  <span className="-rotate-45 text-[10px] font-extrabold font-mono select-none">NS</span>
                </div>
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-xl text-brand-navy leading-tight flex items-center tracking-tight">
                  NextStep<span className="text-brand-orange">Africa</span>
                </div>
                <div className="text-[9px] text-brand-green font-extrabold tracking-wider uppercase font-mono">
                  Public Health Gateway
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Search & Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <form onSubmit={handleSearchSubmit} className="relative w-64">
              <input
                id="navbar-search-input"
                type="text"
                placeholder="Search opportunities..."
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-navy/20 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              <button id="navbar-search-submit" type="submit" className="absolute right-3.5 top-2 text-slate-400 hover:text-brand-navy">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center space-x-6">
              {menuItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    id={`nav-item-${item.id}`}
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`relative py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center ${
                      isActive 
                        ? 'text-brand-orange border-b-2 border-brand-orange pb-0.5' 
                        : 'text-brand-navy hover:text-brand-orange'
                    }`}
                  >
                    <span>{item.label === 'Insights & Blog' ? 'Blog' : item.label === 'My Career Tracker' ? 'Tracker' : item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-brand-navy p-2 rounded-md hover:bg-slate-100 focus:outline-hidden transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-slate-200/80 bg-white overflow-hidden shadow-inner"
          >
            <div className="px-4 py-3 space-y-3">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  id="mobile-search-input"
                  type="text"
                  placeholder="Search health fields, regions..."
                  value={searchVal}
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                    if (onSearch) onSearch(e.target.value);
                  }}
                  className="w-full bg-slate-100 border-none rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-navy/20"
                />
                <button id="mobile-search-submit" type="submit" className="absolute right-3 top-2.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      id={`mobile-nav-item-${item.id}`}
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-navy/5 text-brand-navy border-l-4 border-brand-orange'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-brand-orange' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
