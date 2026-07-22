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
    <nav id="app-navbar" className="sticky top-0 z-50 bg-void/90 backdrop-blur-md border-b border-white/10 h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button
              id="nav-logo-btn"
              onClick={() => { setCurrentTab('home'); setIsOpen(false); }}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="relative w-10 h-10 shrink-0">
                <div className="absolute inset-0 rounded-lg bg-pulse/30 blur-md group-hover:bg-pulse/50 transition-all duration-300" />
                <div className="relative w-10 h-10 bg-glass border border-white/15 rounded-lg flex items-center justify-center text-frost transform group-hover:scale-105 transition-transform duration-300 ease-out">
                  <div className="w-5 h-5 border-2 border-pulse rounded-xs rotate-45 flex items-center justify-center">
                    <span className="-rotate-45 text-[10px] font-extrabold font-mono select-none">NS</span>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-xl text-frost leading-tight flex items-center tracking-tight">
                  NextStep<span className="text-amber-signal">Africa</span>
                </div>
                <div className="text-[9px] text-pulse font-extrabold tracking-wider uppercase font-mono">
                  Public Health Gateway
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Search & Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <form onSubmit={handleSearchSubmit} className="relative w-64 group">
              <input
                id="navbar-search-input"
                type="text"
                placeholder="search://opportunities"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-full bg-white/5 hover:bg-white/[0.07] border border-white/10 rounded-full py-1.5 pl-4 pr-10 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-signal/40 focus:border-amber-signal/40 focus:bg-white/[0.08] transition-all duration-300 ease-out text-frost placeholder-frost-dim/70"
              />
              <button id="navbar-search-submit" type="submit" className="absolute right-3.5 top-2 text-frost-dim group-focus-within:text-amber-signal transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center space-x-1">
              {menuItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    id={`nav-item-${item.id}`}
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`relative px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out cursor-pointer flex items-center ${
                      isActive
                        ? 'text-pulse bg-pulse/10 border border-pulse/30 shadow-[0_0_16px_-4px_rgba(52,211,153,0.4)]'
                        : 'text-frost-dim border border-transparent hover:text-frost hover:bg-white/5'
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
              className="text-frost-dim hover:text-frost p-2 rounded-md hover:bg-white/5 focus:outline-hidden transition-all duration-300 ease-out active:scale-90"
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
            className="lg:hidden border-t border-white/10 bg-void/98 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  id="mobile-search-input"
                  type="text"
                  placeholder="search://fields, regions..."
                  value={searchVal}
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                    if (onSearch) onSearch(e.target.value);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-3 pr-10 text-sm font-mono text-frost placeholder-frost-dim/70 focus:outline-hidden focus:ring-2 focus:ring-amber-signal/40"
                />
                <button id="mobile-search-submit" type="submit" className="absolute right-3 top-3 text-frost-dim">
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
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ease-out active:scale-[0.98] ${
                        isActive
                          ? 'bg-pulse/10 text-pulse border-l-4 border-pulse'
                          : 'text-frost-dim hover:bg-white/5 hover:text-frost'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-pulse' : 'text-frost-dim'}`} />
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
