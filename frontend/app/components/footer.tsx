import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <img 
                src="/stacksarena-logo.png" 
                alt="StacksArena" 
                className="w-10 h-10 object-contain transition-transform group-hover:scale-110" 
              />
              <span className="text-lg font-black tracking-tighter text-foreground font-[var(--font-display)] uppercase">
                STACKS<span className="text-primary italic">ARENA</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The premier Bitcoin-native commitment protocol on Stacks L2. Enforce behavior, secure savings, and dynamic on-chain locking powered by Clarity smart contracts.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Protocol Live</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2">
              {[["Dashboard", "/"], ["Create Vault", "/create"], ["Active Locks", "/vaults"], ["Global Stats", "/stats"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="space-y-2">
              {[["Stacks Network", "https://stacks.co"], ["Hiro Explorer", "https://explorer.hiro.so"], ["Bitcoin Core", "https://bitcoin.org"]].map(([label, href]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 StacksArena Protocol. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Secured by Bitcoin consensus via Stacks L2</p>
        </div>
      </div>
    </footer>
  );
}
