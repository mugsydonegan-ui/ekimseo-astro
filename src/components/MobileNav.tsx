import { useState } from 'react';

interface NavLink {
  href: string;
  label: string;
}

export default function MobileNav({ navLinks }: { navLinks: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-[#1a3a2a] hover:text-[#c9973a] transition-colors"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 top-[65px] z-40 bg-[#f5f0e8] border-t border-[#c9973a]/20">
          <nav className="flex flex-col p-8 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-0 py-4 text-2xl font-bold text-[#1a3a2a] border-b border-[#1a3a2a]/10 hover:text-[#c9973a] transition-colors tracking-tight"
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:mike@ekimseo.com"
              onClick={() => setOpen(false)}
              className="mt-6 inline-block px-6 py-4 text-base font-semibold text-[#f5f0e8] bg-[#1a3a2a] text-center hover:bg-[#c9973a] transition-colors"
            >
              Get a Free Content Audit
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
