import React from 'react';

export function HeroBackground() {
    return (
        <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none z-0 overflow-hidden hidden lg:block">
            {/* Extended Tech Grid Background (High Visibility) */}
            <div className="absolute inset-x-0 bottom-0 h-[450px] bg-[linear-gradient(to_right,var(--hairline)_1.5px,transparent_1.5px),linear-gradient(to_top,var(--hairline)_1.5px,transparent_1.5px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_80%_100%,black_80%,transparent_100%)] opacity-70" />
            

        </div>
    );
}
