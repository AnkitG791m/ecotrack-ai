import React from 'react';
import Navbar from './Navbar';
import ChatBot from './ChatBot';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip to main content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main
        id="main-content"
        role="main"
        tabIndex="-1"
        className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none"
      >
        {children}
      </main>

      {/* Global Floating AI Chatbot */}
      <ChatBot />
    </div>
  );
};

export default Layout;
