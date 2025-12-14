import { Link } from "react-router-dom";
import { Shield, Lock, Wallet } from "lucide-react";

const footerLinks = {
  Products: [
    { label: "Checkout", href: "/checkout" },
    { label: "Invoices", href: "/invoices/new" },
    { label: "Yield", href: "/yield" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Security", href: "/security" },
    { label: "Settings", href: "/settings" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-accent opacity-80" />
                <div className="absolute inset-[2px] rounded-md bg-background flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">N</span>
                </div>
              </div>
              <span className="font-bold text-lg tracking-tight">NEXUS</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Private stablecoin payments that keep earning.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <Lock className="h-4 w-4" />
              <Wallet className="h-4 w-4" />
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-medium text-sm mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nexus PayStream. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="status-dot status-dot-success" />
            <span className="text-xs text-muted-foreground">
              Polygon Mainnet • Non-custodial • Privacy-first
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
