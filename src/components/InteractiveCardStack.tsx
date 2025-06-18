'use client';

import React from 'react';

export default function InteractiveCardStack() {
  return (
    <div className="relative w-80 h-80 perspective-1000 group">
      {/* Base card */}
      <div className="absolute w-64 h-40 bg-green-700 rounded-lg shadow-xl transition-transform duration-500 ease-in-out transform rotate-y-0 group-hover:-translate-y-6 group-hover:translate-x-6 group-hover:-rotate-z-12 z-10 p-4 flex flex-col justify-between">
        <div className="text-white text-sm font-bold">CardWise</div>
        <div className="text-white text-xl font-bold self-end">**** 1234</div>
      </div>

      {/* Middle card */}
      <div className="absolute w-64 h-40 bg-green-600 rounded-lg shadow-xl transition-transform duration-500 ease-in-out transform rotate-y-0 group-hover:translate-y-0 group-hover:-translate-x-6 group-hover:rotate-z-6 z-20 p-4 flex flex-col justify-between" style={{ top: '3rem', left: '1.5rem' }}>
         <div className="text-white text-sm font-bold">CardWise</div>
         <div className="text-white text-xl font-bold self-end">**** 5678</div>
      </div>

      {/* Top card */}
      <div className="absolute w-64 h-40 bg-green-500 rounded-lg shadow-xl transition-transform duration-500 ease-in-out transform rotate-y-0 group-hover:translate-y-6 group-hover:translate-x-0 group-hover:rotate-z-0 z-30 p-4 flex flex-col justify-between" style={{ top: '6rem', left: '3rem' }}>
         <div className="text-white text-sm font-bold">CardWise</div>
         <div className="text-white text-xl font-bold self-end">**** 9012</div>
      </div>
    </div>
  );
}
