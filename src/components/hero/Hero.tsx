'use client';

import React from 'react';
import { HeroBackground } from './HeroBackground';
import { HeroContent } from './HeroContent';
import { 
  GSoCLogo, 
  OutreachyLogo, 
  LFXLogo, 
  HacktoberfestLogo, 
  SummerOfBitcoinLogo, 
  MLHLogo,
  ESoCLogo
} from '@/components/ui/ProgramLogos';
import './hero.css';

// Inline organization SVG helpers for rich visual diversity
function KubernetesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 6.1v11.8l9 4.1 9-4.1V6.1L12 2z" fill="#326CE5" />
      <path d="M12 5.5v13m-6.5-6.5h13m-9.2-3.8l9.2 9.2m0-9.2L8.8 17.7" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.5" fill="#326CE5" stroke="#FFF" strokeWidth="1.5" />
    </svg>
  );
}

function PythonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2c-3.1 0-3 .7-3 2.1v1.9h6V5.5c0-1.4.1-2.1-3-2.1v-.8a1.2 1.2 0 0 0-1.2-1.2h-1.6c-.6 0-1.2.6-1.2 1.2z" fill="#3776AB" />
      <path d="M12 22c3.1 0 3-.7 3-2.1v-1.9H9v1.4c0 1.4-.1 2.1 3 2.1v.8c0 .6.6 1.2 1.2 1.2h1.6c.6 0 1.2-.6 1.2-1.2z" fill="#FFE873" />
      <path d="M9 7.5V11H5.5c-1.4 0-2.1.1-2.1 3s.7 3 2.1 3H9v-3h6v3.5c0 1.4-.1 2.1-3 2.1H8.5c-1.4 0-2.1-.1-2.1-3V12" fill="#3776AB" />
      <path d="M15 16.5V13h3.5c1.4 0 2.1-.1 2.1-3s-.7-3-2.1-3H15v3H9V6.5c0-1.4.1-2.1 3-2.1h3.5c1.4 0 2.1.1 2.1 3V12" fill="#FFE873" />
      <circle cx="10.5" cy="4" r="0.75" fill="#FFF" />
      <circle cx="13.5" cy="20" r="0.75" fill="#000" />
    </svg>
  );
}

function CNCFIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#008BB8" />
      <path d="M12 5l6 3.5v7L12 19l-6-3.5v-7L12 5z" fill="#FFF" fillOpacity="0.2" stroke="#FFF" strokeWidth="1.2" />
      <path d="M12 9l3 1.7v3.5l-3 1.8-3-1.8v-3.5L12 9z" fill="#FFF" />
    </svg>
  );
}

function DockerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 13.5c0-.8.6-1.5 1.5-1.5H5.8c.4 0 .7.3.7.7v1.5H3v-.7zm3.8 0c0-.8.6-1.5 1.5-1.5h1.3c.4 0 .7.3.7.7v1.5H6.8v-.7zm3.8 0c0-.8.6-1.5 1.5-1.5h1.3c.4 0 .7.3.7.7v1.5H10.6v-.7zm4.2-3.8c0-.8.6-1.5 1.5-1.5H18c.4 0 .7.3.7.7v1.5h-4.2v-.7zm-3.8 0c0-.8.6-1.5 1.5-1.5h1.3c.4 0 .7.3.7.7v1.5H11v-.7z" fill="#2496ED" />
      <path d="M2.5 17c5 0 9.2-2.3 11-5.5.8-.3 1.8-.1 2.5.5.5.4 1.2.6 1.8.4 1.2-.4 1.6-1.8 1.6-1.8s-.6-.2-1.2.1c-.8.4-1.8.1-2.2-.6a5 5 0 0 0-4-2H2v6.5C2 16.2 2.2 17 2.5 17z" fill="#2496ED" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full object-contain" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  );
}

function TensorFlowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#FF6F00" fillOpacity="0.2" stroke="#FF6F00" strokeWidth="1.5" />
      <path d="M12 6v12M7.5 8.5h9M9 13.5h6" stroke="#FF6F00" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ApacheIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2v20c-5.5-3-9-9-9-14 0-3 2.5-6 9-6z" fill="#D22128" />
      <path d="M12 2v20c5.5-3 9-9 9-14 0-3-2.5-6-9-6z" fill="#F25F22" />
    </svg>
  );
}

function LinuxFoundationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#0070FF" />
      <path d="M6 6h4v12H6V6zm8 0h4v4h-4V6zm0 8h4v4h-4v-4z" fill="#FFF" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full object-contain text-primary" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

export function Hero() {
  const COL_1_LOGOS = [
    { name: 'GSoC', logo: <GSoCLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#4285F4]/5 dark:bg-[#4285F4]/10 border-[#4285F4]/15' },
    { name: 'Kubernetes', logo: <KubernetesIcon />, bg: 'bg-[#326ce5]/5 dark:bg-[#326ce5]/10 border-[#326ce5]/15' },
    { name: 'Outreachy', logo: <OutreachyLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#E37154]/5 dark:bg-[#E37154]/10 border-[#E37154]/15' },
    { name: 'Python', logo: <PythonIcon />, bg: 'bg-[#3776ab]/5 dark:bg-[#3776ab]/10 border-[#3776ab]/15' },
    { name: 'LFX Mentorship', logo: <LFXLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#00C0F3]/5 dark:bg-[#00C0F3]/10 border-[#00C0F3]/15' },
    { name: 'European Summer of Code', logo: <ESoCLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#003399]/5 dark:bg-[#003399]/10 border-[#003399]/15' },
    { name: 'GitHub', logo: <GitHubIcon />, bg: 'bg-primary/5 border-primary/10' }
  ];

  const COL_2_LOGOS = [
    { name: 'CNCF', logo: <CNCFIcon />, bg: 'bg-[#008bb8]/5 dark:bg-[#008bb8]/10 border-[#008bb8]/15' },
    { name: 'MLH Fellowship', logo: <MLHLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#0A2540]/5 dark:bg-[#0A2540]/10 border-[#0A2540]/15' },
    { name: 'Docker', logo: <DockerIcon />, bg: 'bg-[#2496ed]/5 dark:bg-[#2496ed]/10 border-[#2496ed]/15' },
    { name: 'Hacktoberfest', logo: <HacktoberfestLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#FF7A00]/5 dark:bg-[#FF7A00]/10 border-[#FF7A00]/15' },
    { name: 'Google', logo: <GoogleIcon />, bg: 'bg-[#EA4335]/5 dark:bg-[#EA4335]/10 border-[#EA4335]/15' },
    { name: 'Summer of Bitcoin', logo: <SummerOfBitcoinLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#F7931A]/5 dark:bg-[#F7931A]/10 border-[#F7931A]/15' }
  ];

  const COL_3_LOGOS = [
    { name: 'TensorFlow', logo: <TensorFlowIcon />, bg: 'bg-[#FF6F00]' },
    { name: 'Apache', logo: <ApacheIcon />, bg: 'bg-[#D22128]' },
    { name: 'Linux Foundation', logo: <LinuxFoundationIcon />, bg: 'bg-[#0070FF]' },
    { name: 'GSoC', logo: <GSoCLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#4285F4]' },
    { name: 'Python', logo: <PythonIcon />, bg: 'bg-[#3776ab]' },
    { name: 'Kubernetes', logo: <KubernetesIcon />, bg: 'bg-[#326ce5]' }
  ];

  const COL_4_LOGOS = [
    { name: 'Linux Foundation', logo: <LinuxFoundationIcon />, bg: 'bg-[#0070FF]' },
    { name: 'Hacktoberfest', logo: <HacktoberfestLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#FF7A00]' },
    { name: 'Google', logo: <GoogleIcon />, bg: 'bg-[#EA4335]' },
    { name: 'CNCF', logo: <CNCFIcon />, bg: 'bg-[#008bb8]' },
    { name: 'Outreachy', logo: <OutreachyLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#E37154]' },
    { name: 'European Summer of Code', logo: <ESoCLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#003399]' },
    { name: 'LFX Mentorship', logo: <LFXLogo color={true} className="w-full h-full object-contain" />, bg: 'bg-[#00C0F3]' }
  ];

  return (
    <section className="hero overflow-hidden relative">
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:pl-16 xl:pl-24 lg:pr-8 h-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8 lg:pt-0">
        
        {/* Left Side: Hero content descriptors & searches */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <HeroContent />
        </div>
        
        {/* Right Side: Floating organization & program rows */}
        <div className="lg:col-span-5 relative h-[402px] lg:h-[502px] w-full hidden lg:flex flex-col items-center justify-center overflow-hidden select-none mt-[57px] sm:mt-[89px] lg:-mr-12">
          
          {/* Rows horizontal layout */}
          <div className="flex flex-col justify-center gap-6 lg:gap-8 w-[150%] h-full rotate-0">
            
            {/* Row 1: Right */}
            <div className="flex animate-scroll-right-slow w-max">
              <div className="flex gap-6 lg:gap-8 pr-6 lg:pr-8">
                {COL_1_LOGOS.map((item, idx) => (
                  <div key={`col1-a-${idx}`} title={item.name} className="w-[56px] lg:w-[64px] aspect-square flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group bg-transparent border-none shadow-none">
                    <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{item.logo}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-6 lg:gap-8 pr-6 lg:pr-8">
                {COL_1_LOGOS.map((item, idx) => (
                  <div key={`col1-b-${idx}`} title={item.name} className="w-[56px] lg:w-[64px] aspect-square flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group bg-transparent border-none shadow-none">
                    <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{item.logo}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Right (synchronized direction) */}
            <div className="flex animate-scroll-right-slow w-max">
              <div className="flex gap-6 lg:gap-8 pr-6 lg:pr-8">
                {COL_2_LOGOS.map((item, idx) => (
                  <div key={`col2-a-${idx}`} title={item.name} className="w-[56px] lg:w-[64px] aspect-square flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group bg-transparent border-none shadow-none">
                    <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{item.logo}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-6 lg:gap-8 pr-6 lg:pr-8">
                {COL_2_LOGOS.map((item, idx) => (
                  <div key={`col2-b-${idx}`} title={item.name} className="w-[56px] lg:w-[64px] aspect-square flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group bg-transparent border-none shadow-none">
                    <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{item.logo}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: Right */}
            <div className="flex animate-scroll-right-slow w-max">
              <div className="flex gap-6 lg:gap-8 pr-6 lg:pr-8">
                {COL_3_LOGOS.map((item, idx) => (
                  <div key={`col3-a-${idx}`} title={item.name} className="w-[56px] lg:w-[64px] aspect-square flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group bg-transparent border-none shadow-none">
                    <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{item.logo}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-6 lg:gap-8 pr-6 lg:pr-8">
                {COL_3_LOGOS.map((item, idx) => (
                  <div key={`col3-b-${idx}`} title={item.name} className="w-[56px] lg:w-[64px] aspect-square flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group bg-transparent border-none shadow-none">
                    <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{item.logo}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 4: Right (synchronized direction) */}
            <div className="flex animate-scroll-right-slow w-max">
              <div className="flex gap-6 lg:gap-8 pr-6 lg:pr-8">
                {COL_4_LOGOS.map((item, idx) => (
                  <div key={`col4-a-${idx}`} title={item.name} className="w-[56px] lg:w-[64px] aspect-square flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group bg-transparent border-none shadow-none">
                    <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{item.logo}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-6 lg:gap-8 pr-6 lg:pr-8">
                {COL_4_LOGOS.map((item, idx) => (
                  <div key={`col4-b-${idx}`} title={item.name} className="w-[56px] lg:w-[64px] aspect-square flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group bg-transparent border-none shadow-none">
                    <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{item.logo}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
      
      <HeroBackground />
    </section>
  );
}
