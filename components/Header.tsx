
import React from 'react';

interface HeaderProps {
    isAuthenticated: boolean;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated, onLogout }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            G
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Grehni <span className="font-normal text-gray-500">(गृहणी)</span>
          </h1>
        </div>
        {isAuthenticated && (
            <button
                onClick={onLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
                Logout
            </button>
        )}
      </div>
    </header>
  );
};