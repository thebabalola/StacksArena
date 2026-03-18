import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.svg" alt="StacksArena" width={28} height={28} />
              <span className="text-lg font-black tracking-tight">Stacks<span className="text-primary">Arena</span></span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The premier on-chain gaming arena built on Stacks L2, secured by Bitcoin. Compete, win, and collect.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Mainnet Live</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2">
              {[["Arena", "/arena"], ["Lottery", "/lottery"], ["Assets", "/assets"]].map(([label, href]) => (
                <li key={href}><Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="space-y-2">
              {[["Stacks Network", "https://stacks.co"], ["Hiro Wallet", "https://wallet.hiro.so"], ["Bitcoin", "https://bitcoin.org"]].map(([label, href]) => (
                <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 StacksArena Protocol. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Secured by Bitcoin via Stacks L2</p>
        </div>
      </div>
    </footer>
  );
}
