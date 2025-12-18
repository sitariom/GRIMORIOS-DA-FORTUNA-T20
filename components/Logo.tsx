import React from 'react';

const Logo: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    xs: { container: 'w-10 h-10', font: 'text-sm', scale: 'scale-[0.4]', hideText: false },
    sm: { container: 'w-16 h-16', font: 'text-lg', scale: 'scale-[0.6]', hideText: false },
    md: { container: 'w-24 h-24', font: 'text-2xl', scale: 'scale-[1.0]', hideText: false },
    lg: { container: 'w-48 h-48', font: 'text-5xl', scale: 'scale-[1.8]', hideText: false }
  };

  return (
    <div className={`flex items-center justify-center group cursor-default select-none ${size === 'xs' ? 'gap-2' : 'flex-col'}`}>
      <div className={`${sizes[size].container} relative flex items-center justify-center transition-all duration-700 group-hover:rotate-[-5deg] group-hover:scale-110 shrink-0`}>
        
        {/* Glow Aura - Pulsing effect */}
        <div className="absolute inset-0 bg-fantasy-gold rounded-full opacity-20 blur-xl animate-pulse group-hover:opacity-40 transition-opacity"></div>
        
        {/* The Grimoire SVG */}
        <div className={`${sizes[size].scale} transition-transform origin-center`}>
          <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]">
            {/* Book Base (Capa) */}
            <path d="M15 10C15 7.23858 17.2386 5 20 5H85C87.7614 5 90 7.23858 90 10V110C90 112.761 87.7614 115 85 115H20C17.2386 115 15 112.761 15 110V10Z" 
              className="fill-fantasy-wood dark:fill-black stroke-fantasy-gold/30 dark:stroke-fantasy-gold/20" strokeWidth="2" />
            
            {/* Pages - Side effect */}
            <path d="M90 15H95V105H90V15Z" className="fill-fantasy-parchment dark:fill-fantasy-parchment/30" />
            <path d="M92 18H95V102H92V18Z" className="fill-black/10 dark:fill-white/5" />
            
            {/* Spine detail (Lombada) */}
            <path d="M15 10C15 7.23858 12.7614 5 10 5V115C12.7614 115 15 112.761 15 110V10Z" className="fill-fantasy-gold/50 dark:fill-fantasy-gold/30" />
            
            {/* Golden Corners (Filigrana) */}
            <path d="M20 5H35L20 20V5Z" className="fill-fantasy-gold dark:fill-fantasy-gold/80" />
            <path d="M85 5H70L85 20V5Z" className="fill-fantasy-gold dark:fill-fantasy-gold/80" />
            <path d="M20 115H35L20 100V115Z" className="fill-fantasy-gold dark:fill-fantasy-gold/80" />
            <path d="M85 115H70L85 100V115Z" className="fill-fantasy-gold dark:fill-fantasy-gold/80" />
            
            {/* Central Seal (Wax Seal) */}
            <circle cx="52" cy="60" r="22" className="fill-fantasy-blood shadow-inner" />
            <circle cx="52" cy="60" r="18" className="fill-fantasy-gold/20" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
            
            {/* Central Coin Symbol (The Fortuna) */}
            <g className="animate-float">
               <circle cx="52" cy="60" r="12" className="fill-fantasy-gold" />
               <circle cx="52" cy="60" r="10" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
               <text x="52" y="66" fontFamily="MedievalSharp" fontSize="16" fill="rgba(0,0,0,0.6)" textAnchor="middle" fontWeight="bold">G</text>
            </g>

            {/* Magic Glow on Seal */}
            <circle cx="52" cy="60" r="24" className="stroke-fantasy-gold/40 animate-pulse" fill="none" strokeWidth="1" />
          </svg>
        </div>
      </div>
      
      {/* App Name Styling */}
      <div className={`font-medieval uppercase tracking-tighter text-center leading-none ${sizes[size].font} ${size === 'xs' ? 'text-left' : 'mt-6'}`}>
        <span className="text-fantasy-gold block drop-shadow-[0_2px_4px_rgba(212,175,55,0.4)] group-hover:text-white transition-colors duration-500">Grimório</span>
        <span className="text-fantasy-parchment dark:text-fantasy-parchment/60 group-hover:text-fantasy-gold transition-colors duration-500">da Fortuna</span>
      </div>
    </div>
  );
};

export default Logo;