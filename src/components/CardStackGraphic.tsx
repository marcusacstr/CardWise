import React from 'react';

const CardStackGraphic = () => {
  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
      {/* Responsive container with proper aspect ratio */}
      <div className="relative w-full" style={{ paddingBottom: '62.5%' /* 8:5 aspect ratio */ }}>
        {/* Card 1 (Bottom) */}
        <div className="absolute bottom-0 left-0 w-3/4 h-3/5 bg-green-700 rounded-lg transform rotate-6 shadow-lg">
        </div>
        {/* Card 2 */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 w-3/4 h-3/5 bg-gray-400 rounded-lg transform rotate-3 shadow-lg">
        </div>
        {/* Card 3 */}
        <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 md:bottom-12 md:left-12 lg:bottom-16 lg:left-16 w-3/4 h-3/5 bg-gray-200 rounded-lg transform rotate-1 shadow-lg">
        </div>
        {/* Card 4 (Top) */}
        <div className="absolute bottom-6 left-6 sm:bottom-12 sm:left-12 md:bottom-18 md:left-18 lg:bottom-24 lg:left-24 w-3/4 h-3/5 bg-gradient-to-br from-green-600 to-green-800 rounded-lg shadow-xl">
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 w-6 h-4 sm:w-7 sm:h-5 md:w-8 md:h-6 bg-gray-300 rounded-sm"></div>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-white text-xs sm:text-sm md:text-base font-semibold">CardWise</div>
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 text-white text-lg sm:text-xl md:text-2xl">)))</div>
        </div>
      </div>
    </div>
  );
};

export default CardStackGraphic; 