import React from 'react';

export function Logo({ className = "w-[63px] h-[63px]" }: { className?: string }) {
  return (
    <svg className={`group ${className}`} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Soft realistic drop shadow for depth */}
        <filter id="cube-depth-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="6" stdDeviation="5" floodColor="var(--primary)" floodOpacity="0.16" />
        </filter>

        {/* Inner Soft Glow */}
        <filter id="cube-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Bronze Metallic Gradients for Hexagon Faces */}
        {/* Top Face (Lid): Bright highlights */}
        <linearGradient id="topFaceGrad" x1="72" y1="96" x2="184" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--accent) 75%, #ffffff 25%)" />
          <stop offset="50%" stopColor="color-mix(in srgb, var(--accent) 90%, #ffffff 10%)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>

        {/* Left Face: Deep shadows */}
        <linearGradient id="leftFaceGrad" x1="72" y1="96" x2="128" y2="192" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--accent) 50%, var(--primary) 50%)" />
        </linearGradient>

        {/* Right Face: Medium shade */}
        <linearGradient id="rightFaceGrad" x1="128" y1="128" x2="184" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--accent) 85%, var(--primary) 15%)" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--accent) 65%, var(--primary) 35%)" />
        </linearGradient>

        {/* Specular Highlight Overlay Gradient */}
        <linearGradient id="specularGrad" x1="128" y1="64" x2="128" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>

        {/* CSS Animations for Exploding Isometric Cube */}
        <style>
          {`
            .logo-cube-top {
              transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              transform: translateY(-2px);
              transform-origin: 128px 96px;
            }
            .group:hover .logo-cube-top {
              transform: translateY(-12px) scale(1.02);
            }
            .logo-cube-left {
              transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              transform: translate(-1.73px, 1px);
              transform-origin: 100px 144px;
            }
            .group:hover .logo-cube-left {
              transform: translate(-5.2px, 3px);
            }
            .logo-cube-right {
              transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              transform: translate(1.73px, 1px);
              transform-origin: 156px 144px;
            }
            .group:hover .logo-cube-right {
              transform: translate(5.2px, 3px);
            }
            @keyframes slowBreath {
              0% { transform: scale(1); }
              50% { transform: scale(1.02); }
              100% { transform: scale(1); }
            }
            .logo-container {
              transform-origin: 128px 128px;
              transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .group:hover .logo-container {
              transform: rotate(-3deg);
            }
            @keyframes pulseShadow {
              0% { opacity: 0.12; }
              50% { opacity: 0.22; }
              100% { opacity: 0.12; }
            }
            .logo-shadow-glow {
              animation: pulseShadow 3s ease-in-out infinite;
              transform-origin: 128px 128px;
            }
          `}
        </style>
      </defs>

      {/* Main Filter Group for Depth Shadows */}
      <g filter="url(#cube-depth-shadow)" className="logo-container">
        
        {/* Soft Ambient Bronze Glow behind the cube */}
        <circle cx="128" cy="128" r="50" fill="var(--accent)" opacity="0.12" className="logo-shadow-glow" filter="url(#cube-glow)" />

        {/* 1. LEFT FACE (Sliding down-left on hover) */}
        <g className="logo-cube-left">
          {/* Main Face Panel */}
          <polygon points="72,96 128,128 128,192 72,160" fill="url(#leftFaceGrad)" />
          {/* Subtle inner border bevel shadow */}
          <polygon points="72,96 128,128 128,192 72,160" stroke="color-mix(in srgb, var(--accent) 30%, var(--primary) 70%)" strokeWidth="1.5" opacity="0.25" />
          {/* Top-Left Specular highlight */}
          <line x1="72" y1="96" x2="128" y2="128" stroke="#ffffff" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
        </g>

        {/* 2. RIGHT FACE (Sliding down-right on hover) */}
        <g className="logo-cube-right">
          {/* Main Face Panel */}
          <polygon points="128,128 184,96 184,160 128,192" fill="url(#rightFaceGrad)" />
          {/* Subtle inner border bevel shadow */}
          <polygon points="128,128 184,96 184,160 128,192" stroke="color-mix(in srgb, var(--accent) 30%, var(--primary) 70%)" strokeWidth="1.5" opacity="0.25" />
          {/* Top-Right Specular highlight */}
          <line x1="128" y1="128" x2="184" y2="96" stroke="#ffffff" strokeWidth="1" opacity="0.25" strokeLinecap="round" />
        </g>

        {/* 3. TOP FACE / LID (Sliding straight up on hover) */}
        <g className="logo-cube-top">
          {/* Main Face Panel */}
          <polygon points="128,64 184,96 128,128 72,96" fill="url(#topFaceGrad)" />
          {/* Outer edge highlight line */}
          <polygon points="128,64 184,96 128,128 72,96" stroke="color-mix(in srgb, var(--accent) 80%, #ffffff 20%)" strokeWidth="1" opacity="0.3" />
          {/* Specular highlights on the top point ridges */}
          <line x1="72" y1="96" x2="128" y2="64" stroke="#ffffff" strokeWidth="1.6" opacity="0.7" strokeLinecap="round" />
          <line x1="128" y1="64" x2="184" y2="96" stroke="#ffffff" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
          
          {/* Center visual accent (like a glowing package stripe or keyhole) */}
          <polygon points="120,96 128,91 136,96 128,101" fill="#ffffff" opacity="0.35" />
        </g>

      </g>
    </svg>
  );
}



