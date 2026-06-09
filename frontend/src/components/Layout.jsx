import React from 'react';
import Navbar from './Navbar';
import ChatBot from './ChatBot';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main id="main-content" tabIndex="-1" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
        {children}
      </main>

      {/* Global Floating AI Chatbot */}
      <ChatBot />
    </div>
  );
};

export default Layout;
