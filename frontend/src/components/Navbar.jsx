import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Leaf, Flame, Trophy, Award, Compass, Calculator, 
  BarChart3, User as UserIcon, LogOut, Shield, Menu, X, Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Leaf },
    { name: 'Calculator', href: '/calculator', icon: Calculator },
    { name: 'Tracker', href: '/tracker', icon: BarChart3 },
    { name: 'AI Insights', href: '/recommendations', icon: Sparkles },
    { name: 'Challenges', href: '/challenges', icon: Award },
    { name: 'Community', href: '/community', icon: Compass },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-dark-950/70 border-b border-white/[0.05] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2 group">
              <div className="p-2 bg-brand-500/10 rounded-xl group-hover:bg-brand-500/20 border border-brand-500/20 transition-all">
                <Leaf className="h-5 w-5 text-brand-400" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-100 to-brand-300">
                EcoTrack <span className="text-brand-400 font-extrabold">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
                        : 'text-white/70 hover:text-white hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Status / Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                {/* Points Pill */}
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-300 text-xs font-semibold shadow-inner">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{user.points} XP</span>
                </div>

                {/* Streak Pill */}
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-semibold shadow-inner">
                  <Flame className="h-3.5 w-3.5 fill-orange-500/10" />
                  <span>{user.streak} Days</span>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    aria-label="User profile menu"
                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40 rounded-full"
                  >
                    <img
                      className="h-9 w-9 rounded-full object-cover border border-white/20 shadow-md"
                      src={user.profilePhoto}
                      alt={user.name}
                    />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div 
                        role="menu"
                        aria-label="User profile dropdown"
                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-dark-900 border border-white/[0.08] p-1.5 shadow-2xl backdrop-blur-xl z-20"
                      >
                        <div className="px-3.5 py-3 border-b border-white/[0.06]">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="py-1" role="none">
                          <Link
                            to="/profile"
                            role="menuitem"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/[0.04] transition-all"
                          >
                            <UserIcon className="h-4 w-4 text-white/40" />
                            <span>My Profile</span>
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              role="menuitem"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm text-brand-300 hover:bg-brand-500/5 transition-all"
                            >
                              <Shield className="h-4 w-4 text-brand-400" />
                              <span>Admin Panel</span>
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              logout();
                            }}
                            role="menuitem"
                            className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/5 transition-all text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-white/70 hover:text-white px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="glass-button-primary !px-4 !py-2 text-xs font-bold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
              className="inline-flex items-center justify-center p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.04] focus:outline-none transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && user && (
        <div className="lg:hidden bg-dark-900 border-b border-white/[0.06] py-3 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          {/* Mobile Profile Link */}
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-white/70 hover:text-white hover:bg-white/[0.03]"
          >
            <UserIcon className="h-5 w-5" />
            <span>My Profile</span>
          </Link>

          {/* Mobile Admin Link */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-brand-300 hover:bg-brand-500/5"
            >
              <Shield className="h-5 w-5" />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* Mobile Log Out */}
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/5 text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
