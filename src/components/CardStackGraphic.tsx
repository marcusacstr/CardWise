import React from 'react';

const CardStackGraphic = () => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Container with responsive but controlled size */}
      <div className="relative w-80 h-48 mx-auto sm:w-96 sm:h-56 lg:w-80 lg:h-48">
        {/* Card 1 (Bottom) */}
        <div className="absolute bottom-0 left-0 w-56 h-36 sm:w-64 sm:h-40 lg:w-56 lg:h-36 bg-green-700 rounded-lg transform rotate-6 shadow-lg">
        </div>
        {/* Card 2 */}
        <div className="absolute bottom-2 left-2 w-56 h-36 sm:w-64 sm:h-40 lg:w-56 lg:h-36 bg-gray-400 rounded-lg transform rotate-3 shadow-lg">
        </div>
        {/* Card 3 */}
        <div className="absolute bottom-4 left-4 w-56 h-36 sm:w-64 sm:h-40 lg:w-56 lg:h-36 bg-gray-200 rounded-lg transform rotate-1 shadow-lg">
        </div>
        {/* Card 4 (Top) */}
        <div className="absolute bottom-6 left-6 w-56 h-36 sm:w-64 sm:h-40 lg:w-56 lg:h-36 bg-gradient-to-br from-green-600 to-green-800 rounded-lg shadow-xl">
          <div className="absolute top-3 left-3 w-8 h-5 bg-gray-300 rounded-sm"></div>
          <div className="absolute top-3 right-3 text-white text-sm font-semibold">CardWise</div>
          <div className="absolute bottom-3 right-3 text-white text-xl">)))</div>
        </div>
      </div>
    </div>
  );
};

export default CardStackGraphic; 