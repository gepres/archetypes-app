import React from 'react';
import { ArchetypeId } from '../../types';

interface ArchetypeIllustratedArtworkProps {
  archetypeId: ArchetypeId;
  className?: string;
}

export const ArchetypeIllustratedArtwork: React.FC<ArchetypeIllustratedArtworkProps> = ({
  archetypeId,
  className = 'w-full h-full',
}) => {
  switch (archetypeId) {
    case 'rey':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="rey-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#2A3828" />
              <stop offset="50%" stopColor="#131F19" />
              <stop offset="100%" stopColor="#080F0D" />
            </radialGradient>
            <radialGradient id="rey-glow" cx="50%" cy="30%" r="45%">
              <stop offset="0%" stopColor="#D6A84F" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#D6A84F" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rey-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE898" />
              <stop offset="50%" stopColor="#D6A84F" />
              <stop offset="100%" stopColor="#8A631E" />
            </linearGradient>
            <linearGradient id="rey-robe" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#431D28" />
              <stop offset="60%" stopColor="#240D14" />
              <stop offset="100%" stopColor="#14060A" />
            </linearGradient>
          </defs>
          <rect width="320" height="380" fill="url(#rey-bg)" />
          <circle cx="160" cy="130" r="110" fill="url(#rey-glow)" />
          
          {/* Celestial Sunburst / Mandala behind head */}
          <g stroke="url(#rey-gold)" strokeWidth="1.5" opacity="0.35" strokeDasharray="3 3">
            <circle cx="160" cy="130" r="85" />
            <circle cx="160" cy="130" r="65" />
            <circle cx="160" cy="130" r="45" />
          </g>
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="160"
              y1="130"
              x2={160 + Math.cos((i * 30 * Math.PI) / 180) * 95}
              y2={130 + Math.sin((i * 30 * Math.PI) / 180) * 95}
              stroke="url(#rey-gold)"
              strokeWidth="1"
              opacity="0.25"
            />
          ))}

          {/* Throne Backrest */}
          <path
            d="M85 380 L85 170 Q160 110 235 170 L235 380 Z"
            fill="#18241F"
            stroke="url(#rey-gold)"
            strokeWidth="2"
            opacity="0.9"
          />
          <path d="M100 175 Q160 125 220 175" stroke="url(#rey-gold)" strokeWidth="1.5" fill="none" opacity="0.6" />

          {/* King Robes & Shoulders */}
          <path
            d="M60 380 C70 280 100 220 125 205 L160 225 L195 205 C220 220 250 280 260 380 Z"
            fill="url(#rey-robe)"
            stroke="url(#rey-gold)"
            strokeWidth="2"
          />
          {/* Ermine Collar Fur */}
          <path
            d="M125 205 C140 215 150 225 160 225 C170 225 180 215 195 205 C210 220 225 240 230 270 C200 275 160 280 160 280 C160 280 120 275 90 270 C95 240 110 220 125 205 Z"
            fill="#F2EFE6"
            stroke="#D6A84F"
            strokeWidth="1.5"
          />
          {/* Royal Scepter */}
          <g transform="translate(230, 160)">
            <line x1="0" y1="0" x2="-20" y2="180" stroke="url(#rey-gold)" strokeWidth="4" />
            <circle cx="0" cy="0" r="10" fill="url(#rey-gold)" />
            <path d="M-6 -6 L6 6 M-6 6 L6 -6" stroke="#0E1513" strokeWidth="2" />
            <circle cx="0" cy="0" r="4" fill="#86EFAC" />
          </g>

          {/* King Head & Beard Silhouette */}
          <circle cx="160" cy="150" r="30" fill="#E6C8A0" />
          <path
            d="M140 155 Q160 210 180 155 Q175 145 160 145 Q145 145 140 155 Z"
            fill="#F2EFE6"
            stroke="#D6A84F"
            strokeWidth="1"
          />
          {/* Royal Crown */}
          <path
            d="M132 135 L132 110 L144 122 L160 98 L176 122 L188 110 L188 135 Z"
            fill="url(#rey-gold)"
            stroke="#FFE898"
            strokeWidth="2"
          />
          <circle cx="160" cy="112" r="3" fill="#EF4444" />
          <circle cx="144" cy="125" r="2.5" fill="#3B82F6" />
          <circle cx="176" cy="125" r="2.5" fill="#3B82F6" />

          {/* Golden Floating Embers */}
          <circle cx="90" cy="100" r="2" fill="#FFE898" opacity="0.8" />
          <circle cx="230" cy="90" r="1.5" fill="#FFE898" opacity="0.7" />
          <circle cx="120" cy="70" r="2" fill="#FFE898" opacity="0.6" />
          <circle cx="200" cy="65" r="2.5" fill="#FFE898" opacity="0.9" />
        </svg>
      );

    case 'guerrero':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="guerrero-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#3B1717" />
              <stop offset="60%" stopColor="#1A0D0D" />
              <stop offset="100%" stopColor="#0A0505" />
            </radialGradient>
            <linearGradient id="blade-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
            <linearGradient id="armor-steel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect width="320" height="380" fill="url(#guerrero-bg)" />
          
          {/* Crossed Combat Geometry Background */}
          <line x1="20" y1="40" x2="300" y2="320" stroke="#EF4444" strokeWidth="1" opacity="0.25" />
          <line x1="300" y1="40" x2="20" y2="320" stroke="#EF4444" strokeWidth="1" opacity="0.25" />
          <circle cx="160" cy="160" r="95" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3" />

          {/* Shield Silhouette Left */}
          <path
            d="M50 180 Q80 140 100 170 L100 260 Q70 290 50 250 Z"
            fill="url(#armor-steel)"
            stroke="#EF4444"
            strokeWidth="2"
          />
          <path d="M75 170 L75 260" stroke="#EF4444" strokeWidth="2" opacity="0.6" />

          {/* Warrior Body & Heavy Plated Armor */}
          <path
            d="M75 380 L105 230 L160 250 L215 230 L245 380 Z"
            fill="url(#armor-steel)"
            stroke="#EF4444"
            strokeWidth="2"
          />
          {/* Crimson Pauldrons / Shoulders */}
          <path d="M70 240 L115 210 L130 250 L80 270 Z" fill="#991B1B" stroke="#F87171" strokeWidth="1.5" />
          <path d="M250 240 L205 210 L190 250 L240 270 Z" fill="#991B1B" stroke="#F87171" strokeWidth="1.5" />

          {/* Helmet with T-visor */}
          <path
            d="M135 175 C135 125 185 125 185 175 L180 195 C170 205 150 205 140 195 Z"
            fill="url(#armor-steel)"
            stroke="#EF4444"
            strokeWidth="2"
          />
          {/* Glowing Visor */}
          <path d="M145 160 L175 160 M160 155 L160 185" stroke="#FCA5A5" strokeWidth="3" strokeLinecap="round" />

          {/* Central Flaming Two-Handed Sword */}
          <g transform="translate(160, 50)">
            {/* Sword Blade */}
            <path d="M0 0 L8 200 L0 230 L-8 200 Z" fill="url(#blade-glow)" />
            {/* Crossguard */}
            <rect x="-35" y="200" width="70" height="10" rx="4" fill="#D6A84F" stroke="#FFE898" strokeWidth="1.5" />
            {/* Hilt & Pommel */}
            <rect x="-4" y="210" width="8" height="35" fill="#450A0A" />
            <circle cx="0" cy="250" r="7" fill="#D6A84F" />
          </g>

          {/* Crimson Embers */}
          <circle cx="70" cy="110" r="2.5" fill="#EF4444" />
          <circle cx="240" cy="130" r="2" fill="#F87171" />
          <circle cx="90" cy="60" r="1.5" fill="#FCA5A5" />
          <circle cx="260" cy="70" r="3" fill="#EF4444" opacity="0.8" />
        </svg>
      );

    case 'mago':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="mago-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#102542" />
              <stop offset="60%" stopColor="#0B132B" />
              <stop offset="100%" stopColor="#040814" />
            </radialGradient>
            <radialGradient id="arcane-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="robe-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>
          <rect width="320" height="380" fill="url(#mago-bg)" />
          
          {/* Arcane Geometric Constellations & Circles */}
          <circle cx="160" cy="140" r="100" stroke="#60A5FA" strokeWidth="1.5" opacity="0.35" />
          <polygon
            points="160,40 245,190 75,190"
            stroke="#93C5FD"
            strokeWidth="1"
            fill="none"
            opacity="0.25"
          />
          <polygon
            points="160,240 245,90 75,90"
            stroke="#93C5FD"
            strokeWidth="1"
            fill="none"
            opacity="0.25"
          />
          <circle cx="160" cy="140" r="50" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

          {/* Hooded Mage Robes */}
          <path
            d="M60 380 C80 270 110 220 130 195 L160 215 L190 195 C210 220 240 270 260 380 Z"
            fill="url(#robe-indigo)"
            stroke="#60A5FA"
            strokeWidth="1.5"
          />
          
          {/* Deep Mysterious Hood */}
          <path
            d="M125 180 Q160 100 195 180 Q160 210 125 180 Z"
            fill="#090D16"
            stroke="#38BDF8"
            strokeWidth="2"
          />
          {/* Glowing Eyes of Perception in Void */}
          <circle cx="150" cy="165" r="3" fill="#67E8F9" filter="drop-shadow(0 0 4px #06B6D4)" />
          <circle cx="170" cy="165" r="3" fill="#67E8F9" filter="drop-shadow(0 0 4px #06B6D4)" />

          {/* Levitation Hands & Floating Arcane Orb */}
          <circle cx="160" cy="245" r="60" fill="url(#arcane-glow)" />
          <circle cx="160" cy="245" r="18" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
          <circle cx="160" cy="245" r="8" fill="#FFFFFF" />

          {/* Orbital Runes around orb */}
          <ellipse cx="160" cy="245" rx="42" ry="12" stroke="#38BDF8" strokeWidth="1.5" transform="rotate(-25 160 245)" />
          <ellipse cx="160" cy="245" rx="42" ry="12" stroke="#38BDF8" strokeWidth="1.5" transform="rotate(25 160 245)" />

          {/* Runes & Starlight */}
          <circle cx="80" cy="80" r="2" fill="#BAE6FD" />
          <circle cx="240" cy="75" r="2.5" fill="#67E8F9" />
          <circle cx="260" cy="150" r="1.5" fill="#BAE6FD" />
          <circle cx="60" cy="180" r="2" fill="#67E8F9" />
        </svg>
      );

    case 'amante':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="amante-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#341324" />
              <stop offset="50%" stopColor="#1A0F17" />
              <stop offset="100%" stopColor="#0A0509" />
            </radialGradient>
            <radialGradient id="rose-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="emerald-vine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <rect width="320" height="380" fill="url(#amante-bg)" />
          
          {/* Rose Aura & Radiance */}
          <circle cx="160" cy="150" r="90" fill="url(#rose-glow)" />

          {/* Flowing Organic Heart & Vine Mandala */}
          <path
            d="M160 100 C130 50 70 80 100 140 C120 180 160 220 160 220 C160 220 200 180 220 140 C250 80 190 50 160 100 Z"
            stroke="#F43F5E"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            fill="none"
            opacity="0.4"
          />

          {/* Lover's Lyre / Lute of Passion */}
          <g transform="translate(160, 210)">
            <path
              d="M-30 -50 C-45 -10 -35 40 0 55 C35 40 45 -10 30 -50 C20 -40 10 -30 0 -30 C-10 -30 -20 -40 -30 -50 Z"
              fill="#2E1020"
              stroke="#D6A84F"
              strokeWidth="2"
            />
            {/* Sound hole */}
            <circle cx="0" cy="15" r="12" fill="#0E050A" stroke="#F43F5E" strokeWidth="1.5" />
            {/* Strings */}
            <line x1="-8" y1="-40" x2="-8" y2="40" stroke="#FFE898" strokeWidth="1" />
            <line x1="-3" y1="-40" x2="-3" y2="40" stroke="#FFE898" strokeWidth="1" />
            <line x1="3" y1="-40" x2="3" y2="40" stroke="#FFE898" strokeWidth="1" />
            <line x1="8" y1="-40" x2="8" y2="40" stroke="#FFE898" strokeWidth="1" />
          </g>

          {/* Beautiful Flowing Hair & Head Silhouette */}
          <path
            d="M125 150 C120 100 200 100 195 150 C210 180 220 220 225 270 C200 250 180 260 160 260 C140 260 120 250 95 270 C100 220 110 180 125 150 Z"
            fill="#1E0C18"
            stroke="#F43F5E"
            strokeWidth="1.5"
          />
          <circle cx="160" cy="140" r="24" fill="#FCE7F3" />
          {/* Floral Crown of Roses and Emerald Leaves */}
          <path d="M136 128 Q160 118 184 128" stroke="url(#emerald-vine)" strokeWidth="3" />
          <circle cx="145" cy="124" r="4" fill="#F43F5E" />
          <circle cx="160" cy="120" r="5" fill="#FB7185" />
          <circle cx="175" cy="124" r="4" fill="#F43F5E" />

          {/* Floating petals and starlight */}
          <circle cx="80" cy="90" r="3" fill="#FB7185" opacity="0.8" />
          <circle cx="235" cy="100" r="2.5" fill="#FDA4AF" opacity="0.8" />
          <circle cx="100" cy="220" r="3.5" fill="#F43F5E" opacity="0.7" />
          <circle cx="220" cy="230" r="2" fill="#FB7185" opacity="0.9" />
        </svg>
      );

    case 'padre':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="padre-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#2E2413" />
              <stop offset="60%" stopColor="#1A140B" />
              <stop offset="100%" stopColor="#0D0A05" />
            </radialGradient>
            <linearGradient id="oak-wood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A16207" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
          </defs>
          <rect width="320" height="380" fill="url(#padre-bg)" />

          {/* Tree of Ancestral Roots Background */}
          <g stroke="#D6A84F" strokeWidth="1.5" opacity="0.35">
            <path d="M160 220 Q160 120 120 70 M160 150 Q190 90 220 60 M160 180 Q130 140 90 120" />
            <path d="M160 300 Q140 340 90 370 M160 310 Q180 340 230 370" />
          </g>

          {/* Strong Protective Guardian Cloak */}
          <path
            d="M65 380 C75 260 105 210 135 190 L160 205 L185 190 C215 210 245 260 255 380 Z"
            fill="#27180E"
            stroke="#D6A84F"
            strokeWidth="2"
          />

          {/* Weathered Wise Face & Beard */}
          <circle cx="160" cy="140" r="28" fill="#E6C8A0" />
          <path
            d="M135 145 Q160 215 185 145 Q175 130 160 130 Q145 130 135 145 Z"
            fill="#E2E8F0"
            stroke="#94A3B8"
            strokeWidth="1"
          />

          {/* Lantern of Warm Guidance (Left Hand) */}
          <g transform="translate(90, 210)">
            <line x1="0" y1="-25" x2="0" y2="0" stroke="#D6A84F" strokeWidth="2" />
            <rect x="-14" y="0" width="28" height="36" rx="4" fill="#0D0A05" stroke="#D6A84F" strokeWidth="2" />
            <circle cx="0" cy="18" r="8" fill="#FEF08A" filter="drop-shadow(0 0 10px #FACC15)" />
            <line x1="-10" y1="0" x2="10" y2="36" stroke="#D6A84F" strokeWidth="1" opacity="0.6" />
            <line x1="10" y1="0" x2="-10" y2="36" stroke="#D6A84F" strokeWidth="1" opacity="0.6" />
          </g>

          {/* Ancient Oak Staff (Right Hand) */}
          <g transform="translate(230, 80)">
            <line x1="0" y1="0" x2="-15" y2="300" stroke="url(#oak-wood)" strokeWidth="6" strokeLinecap="round" />
            <circle cx="0" cy="0" r="10" fill="#D6A84F" stroke="#FFE898" strokeWidth="2" />
            <circle cx="0" cy="0" r="4" fill="#22C55E" />
          </g>

          {/* Warm Amber Embers */}
          <circle cx="90" cy="170" r="3" fill="#FACC15" opacity="0.8" />
          <circle cx="110" cy="190" r="2" fill="#FEF08A" opacity="0.9" />
          <circle cx="230" cy="60" r="2" fill="#D6A84F" opacity="0.6" />
        </svg>
      );

    case 'cuidador':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="cuidador-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#122E22" />
              <stop offset="60%" stopColor="#0B1A13" />
              <stop offset="100%" stopColor="#040D09" />
            </radialGradient>
            <radialGradient id="healing-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="380" fill="url(#cuidador-bg)" />

          {/* Healing Waves & Leaf Mandala */}
          <circle cx="160" cy="150" r="95" stroke="#34D399" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.3" />
          <circle cx="160" cy="150" r="70" fill="url(#healing-aura)" />

          {/* Hooded Sage of Compassion */}
          <path
            d="M70 380 C85 270 115 220 135 200 L160 215 L185 200 C205 220 235 270 250 380 Z"
            fill="#12281E"
            stroke="#10B981"
            strokeWidth="1.5"
          />

          {/* Gentle Head & Hood */}
          <path
            d="M125 180 Q160 110 195 180 Q160 205 125 180 Z"
            fill="#1A382B"
            stroke="#34D399"
            strokeWidth="1.5"
          />
          <circle cx="160" cy="155" r="20" fill="#E6C8A0" />

          {/* Sacred Chalice with Living Sprout (Hands Holding) */}
          <g transform="translate(160, 240)">
            {/* Chalice */}
            <path
              d="M-22 -10 Q0 -20 22 -10 L16 20 Q0 30 -16 20 Z"
              fill="#062E1D"
              stroke="#34D399"
              strokeWidth="2"
            />
            <rect x="-4" y="20" width="8" height="20" fill="#34D399" />
            <ellipse cx="0" cy="40" rx="18" ry="6" fill="#062E1D" stroke="#34D399" strokeWidth="1.5" />
            
            {/* Glowing Golden Sprout */}
            <path d="M0 -15 Q-15 -35 0 -45 Q15 -35 0 -15 Z" fill="#86EFAC" stroke="#D6A84F" strokeWidth="1" />
            <path d="M0 -30 Q-12 -25 -8 -15" stroke="#86EFAC" strokeWidth="1.5" />
            <path d="M0 -30 Q12 -25 8 -15" stroke="#86EFAC" strokeWidth="1.5" />
          </g>

          {/* Restorative Green Light Orbs */}
          <circle cx="80" cy="110" r="3" fill="#86EFAC" opacity="0.8" />
          <circle cx="240" cy="110" r="2.5" fill="#34D399" opacity="0.8" />
          <circle cx="90" cy="220" r="2" fill="#86EFAC" opacity="0.7" />
          <circle cx="230" cy="230" r="3" fill="#A7F3D0" opacity="0.9" />
        </svg>
      );

    case 'bufon':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="bufon-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#3B2610" />
              <stop offset="60%" stopColor="#1F1306" />
              <stop offset="100%" stopColor="#0D0702" />
            </radialGradient>
          </defs>
          <rect width="320" height="380" fill="url(#bufon-bg)" />

          {/* Spiraling Juggler Curves */}
          <path
            d="M60 120 Q160 30 260 120 Q160 210 60 120"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
            opacity="0.4"
          />

          {/* Dual Masks of Comedy and Tragedy */}
          <g transform="translate(105, 140) rotate(-15)">
            <ellipse cx="0" cy="0" rx="22" ry="28" fill="#1C140A" stroke="#F59E0B" strokeWidth="2" />
            {/* Smiling Eyes and Mouth */}
            <path d="M-12 -6 Q-8 -12 -4 -6" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 -6 Q8 -12 12 -6" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
            <path d="M-10 8 Q0 20 10 8" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>

          <g transform="translate(215, 140) rotate(15)">
            <ellipse cx="0" cy="0" rx="22" ry="28" fill="#1C140A" stroke="#F43F5E" strokeWidth="2" />
            {/* Somber Eyes and Mouth */}
            <path d="M-12 -10 Q-8 -6 -4 -10" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 -10 Q8 -6 12 -10" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
            <path d="M-10 14 Q0 4 10 14" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>

          {/* Central Tri-Cornered Jester Hat */}
          <g transform="translate(160, 100)">
            <path
              d="M-40 20 Q-70 -30 -30 -40 Q-20 -10 0 -15 Q20 -10 30 -40 Q70 -30 40 20 Z"
              fill="#7C2D12"
              stroke="#F59E0B"
              strokeWidth="2"
            />
            {/* Bells */}
            <circle cx="-32" cy="-40" r="5" fill="#FACC15" stroke="#78350F" strokeWidth="1" />
            <circle cx="32" cy="-40" r="5" fill="#FACC15" stroke="#78350F" strokeWidth="1" />
            <circle cx="0" cy="-18" r="4" fill="#FACC15" stroke="#78350F" strokeWidth="1" />
          </g>

          {/* Juggler Spheres */}
          <circle cx="80" cy="70" r="7" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="1.5" />
          <circle cx="160" cy="40" r="9" fill="#EF4444" stroke="#FECACA" strokeWidth="1.5" />
          <circle cx="240" cy="70" r="7" fill="#3B82F6" stroke="#BFDBFE" strokeWidth="1.5" />
          <circle cx="160" cy="270" r="8" fill="#10B981" stroke="#A7F3D0" strokeWidth="1.5" />
        </svg>
      );

    case 'explorador':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="explorador-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#0E2A38" />
              <stop offset="60%" stopColor="#081822" />
              <stop offset="100%" stopColor="#030A0F" />
            </radialGradient>
          </defs>
          <rect width="320" height="380" fill="url(#explorador-bg)" />

          {/* Distant Mountain Peaks & Horizon */}
          <path d="M0 260 L90 170 L170 240 L240 160 L320 260 L320 380 L0 380 Z" fill="#0A1820" opacity="0.8" />
          <path d="M90 170 L110 200 L70 200 Z" fill="#E2E8F0" opacity="0.4" />
          <path d="M240 160 L260 190 L220 190 Z" fill="#E2E8F0" opacity="0.4" />

          {/* Grand Star Compass / Astrolabe */}
          <g transform="translate(160, 120)">
            <circle cx="0" cy="0" r="65" stroke="#38BDF8" strokeWidth="1.5" opacity="0.4" />
            <circle cx="0" cy="0" r="50" stroke="#0284C7" strokeWidth="1" strokeDasharray="3 3" />
            {/* 8-Point Compass Star */}
            <path d="M0 -55 L6 -10 L55 0 L6 10 L0 55 L-6 10 L-55 0 L-6 -10 Z" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
            <path d="M0 -55 L6 -10 L0 0 Z" fill="#7DD3FC" />
            <path d="M55 0 L10 6 L0 0 Z" fill="#7DD3FC" />
            <path d="M0 55 L-6 10 L0 0 Z" fill="#7DD3FC" />
            <path d="M-55 0 L-10 -6 L0 0 Z" fill="#7DD3FC" />
            <circle cx="0" cy="0" r="5" fill="#FACC15" />
          </g>

          {/* Silhouette of Pilgrim Traveler with Walking Staff */}
          <g transform="translate(160, 230)">
            <ellipse cx="0" cy="60" rx="35" ry="50" fill="#061219" stroke="#38BDF8" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="16" fill="#061219" stroke="#38BDF8" strokeWidth="1.5" />
            {/* Wide-brim Traveller Hat */}
            <ellipse cx="0" cy="-6" rx="26" ry="6" fill="#0F2B38" stroke="#38BDF8" strokeWidth="1.5" />
            {/* Staff */}
            <line x1="28" y1="-20" x2="28" y2="120" stroke="#D6A84F" strokeWidth="3" strokeLinecap="round" />
            <circle cx="28" cy="-20" r="4" fill="#38BDF8" />
          </g>

          {/* Celestial Wayfinder Stars */}
          <circle cx="60" cy="50" r="2" fill="#BAE6FD" />
          <circle cx="100" cy="35" r="1.5" fill="#BAE6FD" />
          <circle cx="230" cy="40" r="2.5" fill="#FDE047" />
          <circle cx="270" cy="70" r="1.5" fill="#BAE6FD" />
        </svg>
      );

    case 'creador':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="creador-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#382613" />
              <stop offset="60%" stopColor="#201407" />
              <stop offset="100%" stopColor="#0B0602" />
            </radialGradient>
          </defs>
          <rect width="320" height="380" fill="url(#creador-bg)" />

          {/* Sacred Blueprint Grid & Concentric Gears */}
          <g stroke="#D6A84F" strokeWidth="1" opacity="0.3">
            <line x1="40" y1="40" x2="280" y2="40" strokeDasharray="3 3" />
            <line x1="40" y1="100" x2="280" y2="100" strokeDasharray="3 3" />
            <line x1="40" y1="160" x2="280" y2="160" strokeDasharray="3 3" />
            <circle cx="160" cy="140" r="75" strokeWidth="1.5" />
          </g>

          {/* Giant Cosmic Gear */}
          <g transform="translate(160, 140)">
            <circle cx="0" cy="0" r="45" fill="#1C1107" stroke="#D6A84F" strokeWidth="2" />
            <circle cx="0" cy="0" r="20" fill="#0B0602" stroke="#F59E0B" strokeWidth="2" />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x="-6"
                y="-55"
                width="12"
                height="14"
                rx="2"
                fill="#D6A84F"
                transform={`rotate(${i * 45})`}
              />
            ))}
          </g>

          {/* The Blacksmith Anvil & Hammer */}
          <g transform="translate(160, 260)">
            {/* Anvil Base */}
            <path
              d="M-50 40 L-40 0 L40 0 L55 -15 L55 0 L50 40 Z"
              fill="#27272A"
              stroke="#D6A84F"
              strokeWidth="2"
            />
            {/* Hammer on Top of Anvil */}
            <g transform="translate(-10, -25) rotate(-20)">
              <rect x="-15" y="-12" width="30" height="18" rx="3" fill="#52525B" stroke="#F59E0B" strokeWidth="1.5" />
              <rect x="-3" y="6" width="6" height="40" fill="#92400E" stroke="#D6A84F" strokeWidth="1" />
            </g>
          </g>

          {/* Creation Sparks of Innovation */}
          <circle cx="140" cy="225" r="3" fill="#FDE047" filter="drop-shadow(0 0 6px #F59E0B)" />
          <circle cx="170" cy="215" r="2.5" fill="#F97316" />
          <circle cx="130" cy="205" r="2" fill="#FDE047" />
          <circle cx="185" cy="235" r="2" fill="#FDE047" />
        </svg>
      );

    case 'sabio':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="sabio-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#132738" />
              <stop offset="60%" stopColor="#0B1620" />
              <stop offset="100%" stopColor="#04090E" />
            </radialGradient>
          </defs>
          <rect width="320" height="380" fill="url(#sabio-bg)" />

          {/* Concentric Circles of Universal Truth */}
          <circle cx="160" cy="130" r="90" stroke="#38BDF8" strokeWidth="1" opacity="0.3" />
          <circle cx="160" cy="130" r="65" stroke="#38BDF8" strokeWidth="1" strokeDasharray="5 3" opacity="0.4" />

          {/* Philosopher's Open Illuminated Tome / Book of Truth */}
          <g transform="translate(160, 220)">
            <path
              d="M0 0 C-30 -15 -60 -10 -90 -20 L-90 40 C-60 50 -30 45 0 60 C30 45 60 50 90 40 L90 -20 C60 -10 30 -15 0 0 Z"
              fill="#182A38"
              stroke="#38BDF8"
              strokeWidth="2"
            />
            {/* Book Pages Glow */}
            <path d="M-80 -10 C-55 -2 -30 -7 -5 5 L-5 50 C-30 38 -55 43 -80 32 Z" fill="#F8FAFC" opacity="0.85" />
            <path d="M80 -10 C55 -2 30 -7 5 5 L5 50 C30 38 55 43 80 32 Z" fill="#F8FAFC" opacity="0.85" />
            {/* Central Quill */}
            <line x1="0" y1="-30" x2="0" y2="55" stroke="#D6A84F" strokeWidth="2" />
          </g>

          {/* Owl of Wisdom & Illuminated Mind */}
          <g transform="translate(160, 115)">
            <circle cx="0" cy="0" r="28" fill="#0C1B26" stroke="#38BDF8" strokeWidth="2" />
            {/* Big Luminous Eyes */}
            <circle cx="-10" cy="-2" r="8" fill="#FEF08A" stroke="#38BDF8" strokeWidth="1.5" />
            <circle cx="-10" cy="-2" r="3" fill="#0F172A" />
            <circle cx="10" cy="-2" r="8" fill="#FEF08A" stroke="#38BDF8" strokeWidth="1.5" />
            <circle cx="10" cy="-2" r="3" fill="#0F172A" />
            {/* Beak */}
            <polygon points="0,5 -4,12 4,12" fill="#D6A84F" />
            {/* Feather Tufts */}
            <path d="M-18 -20 L-8 -15 M18 -20 L8 -15" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Floating Sacred Geometry */}
          <polygon points="70,70 90,105 50,105" stroke="#38BDF8" strokeWidth="1.5" fill="none" opacity="0.6" />
          <polygon points="250,70 270,105 230,105" stroke="#38BDF8" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>
      );

    case 'heroe':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="heroe-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#3B1212" />
              <stop offset="60%" stopColor="#1C0909" />
              <stop offset="100%" stopColor="#0A0303" />
            </radialGradient>
            <linearGradient id="lightning-bolt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
          </defs>
          <rect width="320" height="380" fill="url(#heroe-bg)" />

          {/* Dynamic Mountain Summit */}
          <polygon points="160,180 60,380 260,380" fill="#180A0A" stroke="#EF4444" strokeWidth="2" />

          {/* Radiant Hero Standing on Peak */}
          <g transform="translate(160, 140)">
            {/* Billowing Cape */}
            <path d="M-15 20 C-50 40 -60 90 -45 110 C-30 80 -10 60 0 50 Z" fill="#991B1B" stroke="#EF4444" strokeWidth="1.5" />
            {/* Hero Torso & Head */}
            <ellipse cx="0" cy="30" rx="16" ry="24" fill="#3F0D0D" stroke="#EF4444" strokeWidth="2" />
            <circle cx="0" cy="0" r="14" fill="#E6C8A0" stroke="#EF4444" strokeWidth="1.5" />
            {/* Victor's Laurel / Circlet */}
            <path d="M-12 -2 Q0 -8 12 -2" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
            {/* Raised Arm with Spear of Lightning */}
            <line x1="12" y1="20" x2="35" y2="-40" stroke="#FACC15" strokeWidth="3" />
            <polygon points="35,-55 30,-35 40,-35" fill="url(#lightning-bolt)" />
          </g>

          {/* Lightning Flash Cracking the Sky */}
          <path
            d="M195 20 L185 70 L205 75 L180 130"
            stroke="url(#lightning-bolt)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="drop-shadow(0 0 8px #FACC15)"
          />

          {/* Shattered Chains of Overcoming */}
          <g transform="translate(100, 270)" stroke="#94A3B8" strokeWidth="2">
            <ellipse cx="0" cy="0" rx="8" ry="5" fill="none" />
            <ellipse cx="14" cy="2" rx="8" ry="5" fill="none" />
            <line x1="24" y1="2" x2="36" y2="8" stroke="#EF4444" strokeWidth="2" strokeDasharray="2 2" />
          </g>
        </svg>
      );

    case 'rebelde':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="rebelde-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#38150A" />
              <stop offset="60%" stopColor="#1E0A04" />
              <stop offset="100%" stopColor="#0B0301" />
            </radialGradient>
            <linearGradient id="fire-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          <rect width="320" height="380" fill="url(#rebelde-bg)" />

          {/* Oppressive Stone Pillars Cracking */}
          <g stroke="#78350F" strokeWidth="2">
            <rect x="50" y="80" width="30" height="260" fill="#1C0E07" />
            <path d="M50 140 L70 150 L60 170" stroke="#F97316" strokeWidth="1.5" />
            <rect x="240" y="80" width="30" height="260" fill="#1C0E07" />
            <path d="M260 180 L245 195 L270 215" stroke="#F97316" strokeWidth="1.5" />
          </g>

          {/* Phoenix Wings of Transformation behind */}
          <path
            d="M160 180 C110 100 40 80 20 120 C50 150 100 170 160 210 C220 170 270 150 300 120 C280 80 210 100 160 180 Z"
            fill="none"
            stroke="url(#fire-grad)"
            strokeWidth="2"
            opacity="0.6"
          />

          {/* Blazing Torch of Radical Truth */}
          <g transform="translate(160, 160)">
            {/* Torch Handle */}
            <polygon points="-6,40 6,40 10,120 -10,120" fill="#451A03" stroke="#D6A84F" strokeWidth="1.5" />
            {/* Brazen Basket */}
            <path d="M-18 40 L18 40 L12 60 L-12 60 Z" fill="#78350F" stroke="#F97316" strokeWidth="2" />
            
            {/* Roaring Flames */}
            <path
              d="M0 -60 C-25 -20 -30 20 0 35 C30 20 25 -20 0 -60 Z"
              fill="url(#fire-grad)"
              filter="drop-shadow(0 0 12px #EA580C)"
            />
            <path d="M0 -40 C-12 -15 -15 15 0 25 C15 15 12 -15 0 -40 Z" fill="#FEF08A" />
          </g>

          {/* Flying Sparks of Revolution */}
          <circle cx="120" cy="80" r="2.5" fill="#FEF08A" />
          <circle cx="190" cy="65" r="3" fill="#F97316" />
          <circle cx="140" cy="50" r="2" fill="#FEF08A" />
          <circle cx="210" cy="95" r="2" fill="#DC2626" />
        </svg>
      );

    case 'sacerdote':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="sacerdote-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#030712" />
            </radialGradient>
            <radialGradient id="sac-glow" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="380" fill="url(#sacerdote-bg)" />
          <circle cx="160" cy="160" r="100" fill="url(#sac-glow)" />
          {/* Sacred Temple Columns & Veil */}
          <line x1="80" y1="60" x2="80" y2="340" stroke="#6366F1" strokeWidth="2" opacity="0.4" />
          <line x1="240" y1="60" x2="240" y2="340" stroke="#6366F1" strokeWidth="2" opacity="0.4" />
          <path d="M80 100 Q160 140 240 100" stroke="#A855F7" strokeWidth="1.5" fill="none" opacity="0.6" />
          {/* Sacred Chalice / Candlestick */}
          <g transform="translate(160, 180)">
            <path d="M-25 0 Q0 30 25 0 L15 60 Q0 65 -15 60 Z" fill="#312E81" stroke="#D6A84F" strokeWidth="2" />
            <path d="M-35 -10 Q0 -25 35 -10 Q0 15 -35 -10 Z" fill="#4338CA" stroke="#D6A84F" strokeWidth="1.5" />
            {/* Candle flame of inner wisdom */}
            <path d="M0 -30 Q-10 -10 0 5 Q10 -10 0 -30 Z" fill="#FDE047" filter="drop-shadow(0 0 10px #F59E0B)" />
            <circle cx="0" cy="-10" r="4" fill="#FFFFFF" />
          </g>
          {/* Lunar Crescent & Stars */}
          <path d="M160 70 A15 15 0 0 0 160 100 A10 10 0 0 1 160 70 Z" fill="#E0E7FF" opacity="0.8" />
        </svg>
      );

    case 'sanador':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="sanador-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#064E3B" />
              <stop offset="50%" stopColor="#022C22" />
              <stop offset="100%" stopColor="#011611" />
            </radialGradient>
            <radialGradient id="san-glow" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="380" fill="url(#sanador-bg)" />
          <circle cx="160" cy="160" r="100" fill="url(#san-glow)" />
          {/* Healing Waves of Water */}
          <path d="M40 300 Q100 280 160 300 T280 300" stroke="#34D399" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M60 320 Q110 305 160 320 T260 320" stroke="#10B981" strokeWidth="1.5" fill="none" opacity="0.4" />
          {/* Caduceus / Healing Plant of Life */}
          <g transform="translate(160, 160)">
            <line x1="0" y1="-80" x2="0" y2="80" stroke="#D6A84F" strokeWidth="3" />
            <circle cx="0" cy="-80" r="10" fill="#D6A84F" />
            {/* Twining Leaves / Serpents of Regeneration */}
            <path d="M-30 -40 Q0 -60 30 -40 Q0 -20 -30 0 Q0 20 30 40 Q0 60 -30 40" stroke="#34D399" strokeWidth="2.5" fill="none" />
            <path d="M30 -40 Q0 -60 -30 -40 Q0 -20 30 0 Q0 20 -30 40 Q0 60 30 40" stroke="#6EE7B7" strokeWidth="2" fill="none" opacity="0.8" />
          </g>
          <circle cx="160" cy="80" r="6" fill="#FDE047" opacity="0.9" />
        </svg>
      );

    case 'constructor':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="const-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#312E81" />
              <stop offset="50%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#0B091E" />
            </radialGradient>
            <linearGradient id="gold-pillar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#D6A84F" />
              <stop offset="100%" stopColor="#854D0E" />
            </linearGradient>
          </defs>
          <rect width="320" height="380" fill="url(#const-bg)" />
          {/* Blueprint Grid Lines */}
          <g stroke="#6366F1" strokeWidth="0.5" opacity="0.25">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`h-${i}`} x1="20" y1={40 + i * 35} x2="300" y2={40 + i * 35} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`v-${i}`} x1={40 + i * 35} y1="30" x2={40 + i * 35} y2="350" />
            ))}
          </g>
          {/* Classical Temple Facade / Solid Architecture */}
          <g transform="translate(160, 190)">
            {/* Pediment / Triangle Roof */}
            <polygon points="0,-100 -90,-40 90,-40" fill="#1F2937" stroke="url(#gold-pillar)" strokeWidth="2.5" />
            {/* Architrave */}
            <rect x="-95" y="-40" width="190" height="15" fill="#374151" stroke="url(#gold-pillar)" strokeWidth="1.5" />
            {/* 4 Sturdy Pillars */}
            <rect x="-85" y="-25" width="20" height="130" fill="#1F2937" stroke="url(#gold-pillar)" strokeWidth="2" />
            <rect x="-35" y="-25" width="20" height="130" fill="#1F2937" stroke="url(#gold-pillar)" strokeWidth="2" />
            <rect x="15" y="-25" width="20" height="130" fill="#1F2937" stroke="url(#gold-pillar)" strokeWidth="2" />
            <rect x="65" y="-25" width="20" height="130" fill="#1F2937" stroke="url(#gold-pillar)" strokeWidth="2" />
            {/* Solid Foundation Steps */}
            <rect x="-105" y="105" width="210" height="15" fill="#374151" stroke="url(#gold-pillar)" strokeWidth="2" />
            <rect x="-120" y="120" width="240" height="20" fill="#1F2937" stroke="url(#gold-pillar)" strokeWidth="2" />
          </g>
        </svg>
      );

    case 'soberano':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="sob-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#451A03" />
              <stop offset="50%" stopColor="#1C0E07" />
              <stop offset="100%" stopColor="#0B0502" />
            </radialGradient>
            <radialGradient id="sob-glow" cx="50%" cy="35%" r="45%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="380" fill="url(#sob-bg)" />
          <circle cx="160" cy="140" r="100" fill="url(#sob-glow)" />
          {/* Radiant Solar Crown of Inner Dignity */}
          <g transform="translate(160, 140)">
            {/* Solar Ring */}
            <circle cx="0" cy="0" r="70" stroke="#D6A84F" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
            {/* Solar Rays of Autonomy */}
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1="0"
                x2={Math.cos((i * 22.5 * Math.PI) / 180) * 85}
                y2={Math.sin((i * 22.5 * Math.PI) / 180) * 85}
                stroke="#FDE047"
                strokeWidth="1.5"
                opacity="0.5"
              />
            ))}
            {/* Sovereign Seal Center */}
            <circle cx="0" cy="0" r="35" fill="#78350F" stroke="#D6A84F" strokeWidth="3" />
            <polygon points="0,-22 18,12 -18,12" fill="#D6A84F" />
            <polygon points="0,22 18,-12 -18,-12" fill="#FDE047" opacity="0.6" />
          </g>
          {/* Sovereign Robe Silhouette */}
          <path d="M70 380 C85 270 120 230 160 230 C200 230 235 270 250 380 Z" fill="#29140B" stroke="#D6A84F" strokeWidth="2" />
        </svg>
      );

    case 'mistico':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="mist-bg" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="40%" stopColor="#0B0826" />
              <stop offset="100%" stopColor="#03020A" />
            </radialGradient>
            <radialGradient id="mist-nebula" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="380" fill="url(#mist-bg)" />
          <circle cx="160" cy="150" r="110" fill="url(#mist-nebula)" />
          {/* Cosmic Galaxy Spiral */}
          <g transform="translate(160, 150)">
            <path
              d="M0 0 C20 -40 80 -30 70 20 C60 70 -10 80 -60 50 C-110 20 -90 -60 -40 -90 C20 -120 110 -90 120 -20"
              stroke="#A5B4FC"
              strokeWidth="2"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M0 0 C-20 40 -80 30 -70 -20 C-60 -70 10 -80 60 -50 C110 -20 90 60 40 90 C-20 120 -110 90 -120 20"
              stroke="#E879F9"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
            />
            {/* Central Cosmic Eye / Star */}
            <circle cx="0" cy="0" r="8" fill="#FFFFFF" filter="drop-shadow(0 0 12px #818CF8)" />
          </g>
          {/* Stardust */}
          <circle cx="80" cy="80" r="1.5" fill="#FFFFFF" />
          <circle cx="240" cy="70" r="2" fill="#E0E7FF" />
          <circle cx="70" cy="240" r="1.5" fill="#C7D2FE" />
          <circle cx="250" cy="230" r="2" fill="#F472B6" />
          <circle cx="190" cy="290" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case 'integrador':
      return (
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="integ-bg" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <linearGradient id="polar-fire-water" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="65%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <rect width="320" height="380" fill="url(#integ-bg)" />
          {/* Sacred Geometric Mandala / Torus of Integration */}
          <g transform="translate(160, 160)">
            {/* Outer Ring of Unity */}
            <circle cx="0" cy="0" r="90" stroke="url(#polar-fire-water)" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="70" stroke="#D6A84F" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
            {/* Interlocking Yin Yang / Polarities */}
            <path d="M0 -70 A35 35 0 0 1 0 0 A35 35 0 0 0 0 70 A70 70 0 0 1 0 -70 Z" fill="#EF4444" opacity="0.3" stroke="#F59E0B" strokeWidth="1.5" />
            <path d="M0 -70 A35 35 0 0 1 0 0 A35 35 0 0 0 0 70 A70 70 0 0 0 0 -70 Z" fill="#3B82F6" opacity="0.3" stroke="#10B981" strokeWidth="1.5" />
            {/* The Unified Golden Center */}
            <circle cx="0" cy="0" r="14" fill="#D6A84F" filter="drop-shadow(0 0 10px #FDE047)" />
            <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
          </g>
          {/* Synthesis Rings */}
          <path d="M60 320 Q160 260 260 320" stroke="url(#polar-fire-water)" strokeWidth="2" fill="none" opacity="0.8" />
        </svg>
      );

    default:
      return null;
  }
};
