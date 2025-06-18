import React from 'react';

const CardStackGraphic = () => {
  return (
    <div className="relative w-64 h-64">
      {/* Card 1 (Bottom) */}
      <div className="absolute bottom-0 left-0 w-48 h-32 bg-green-700 rounded-lg transform rotate-6">
      </div>
      {/* Card 2 */}
      <div className="absolute bottom-8 left-8 w-48 h-32 bg-gray-400 rounded-lg transform rotate-3">
      </div>
      {/* Card 3 */}
      <div className="absolute bottom-16 left-16 w-48 h-32 bg-gray-200 rounded-lg transform rotate-1">
      </div>
      {/* Card 4 (Top) */}
      <div className="absolute bottom-24 left-24 w-48 h-32 bg-gradient-to-br from-green-600 to-green-800 rounded-lg">
        <div className="absolute top-4 left-4 w-8 h-6 bg-gray-300 rounded-sm"></div>
        <div className="absolute top-6 right-4 text-white text-sm font-semibold">CardWise</div>
        <div className="absolute bottom-4 right-4 text-white text-2xl">)))</div>
      </div>
    </div>
  );
};

export default CardStackGraphic; 