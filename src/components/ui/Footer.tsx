import Link from 'next/link';
import { Github, Twitter, Mail, Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-hairline/80 bg-surface mt-24 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-8">
        
        {/* Column 1: Brand & Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-primary font-sans tracking-tight">
              Contri<span className="text-accent">bo</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-accent font-bold px-2 py-0.5 bg-accent/10 rounded-full border border-accent/20">
              v1.0
            </span>
          </div>
          <p className="text-secondary text-sm max-w-sm font-normal leading-relaxed">
            Your premium companion for discovering, matching, and tracking paid open-source mentorship programs and verified starter issues.
          </p>
          <div className="flex items-center gap-4 text-muted pt-2">
            <a href="https://github.com/subhranshudash13-dotcom/Contribo" target="_blank" rel="noopener noreferrer" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md p-1 transition-colors" aria-label="GitHub">
              <Github size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md p-1 transition-colors" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="mailto:support@contribo.com" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md p-1 transition-colors" aria-label="Email support">
              <Mail size={18} />
            </a>
          </div>
        </div>
        
        {/* Column 2: Product */}
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wider text-primary mb-4 font-mono">Product</h3>
          <ul className="space-y-2.5 text-sm text-secondary font-normal">
            <li>
              <Link href="/programs" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors">
                Programs Directory
              </Link>
            </li>
            <li>
              <Link href="/matcher" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors flex items-center gap-1.5">
                <span>Orbit AI</span>
                <Sparkles size={12} className="text-accent animate-pulse" />
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors">
                User Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wider text-primary mb-4 font-mono">Resources</h3>
          <ul className="space-y-2.5 text-sm text-secondary font-normal">
            <li>
              <Link href="/resources" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors">
                Guides & Resources
              </Link>
            </li>
            <li>
              <Link href="/proposal-studio" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors">
                Proposal Studio
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Community */}
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wider text-primary mb-4 font-mono">Community</h3>
          <ul className="space-y-2.5 text-sm text-secondary font-normal">
            <li>
              <a href="https://github.com/subhranshudash13-dotcom/Contribo" target="_blank" rel="noopener noreferrer" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors">
                GitHub Repository
              </a>
            </li>
            <li>
              <Link href="/guidelines" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors">
                Code of Conduct
              </Link>
            </li>

          </ul>
        </div>

        {/* Column 5: Legal */}
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wider text-primary mb-4 font-mono">Legal</h3>
          <ul className="space-y-2.5 text-sm text-secondary font-normal">
            <li>
              <Link href="/privacy-policy" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors">
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link href="/accessibility" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md transition-colors">
                Accessibility Statement
              </Link>
            </li>
          </ul>
        </div>

      </div>
      
      {/* Bottom Bar: Left Status, Center Attribution, Right Copyright */}
      <div className="max-w-[1320px] mx-auto mt-12 pt-8 border-t border-hairline/80 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Left: Operational Status */}
        <div className="flex items-center gap-2 text-xs font-mono text-secondary order-2 md:order-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold text-primary">All Systems Operational</span>
        </div>

        {/* Center: Creator Attribution */}
        <p className="text-sm font-medium text-primary flex items-center justify-center gap-1.5 order-1 md:order-2">
          <span>Made with love by</span>
          <a
            href="https://github.com/subhranshudash13-dotcom"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent hover:underline decoration-accent/60 underline-offset-4 transition-colors"
          >
            Subhranshu Sekhar Dash
          </a>
        </p>

        {/* Right: Copyright */}
        <p className="text-xs text-muted text-center md:text-right order-3">
          © 2026 Contribo. Built for the global open-source community.
        </p>
      </div>
    </footer>
  );
}
