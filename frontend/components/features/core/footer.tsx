import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/stacksarena-logo.png" 
              alt="StacksArena" 
              className="w-6 h-6 object-contain transition-transform group-hover:scale-110" 
            />
            <span className="text-sm font-black tracking-tighter text-foreground font-[var(--font-display)] uppercase hidden sm:block">
              STACKS<span className="text-primary italic">ARENA</span>
            </span>
          </Link>
          <span className="text-xs text-muted-foreground border-l border-border pl-4">
            © 2026. Secured by Bitcoin via Stacks L2.
          </span>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
            Dashboard
          </Link>
          <Link href="/create" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
            Create Lock
          </Link>
        </nav>
      </div>
    </footer>
  );
}
