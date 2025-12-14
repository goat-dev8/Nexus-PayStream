import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  {
    label: "Products",
    children: [
      { label: "Checkout", href: "/checkout", description: "Accept payments instantly" },
      { label: "Invoices", href: "/invoices/new", description: "Bill clients securely" },
      { label: "Yield", href: "/yield", description: "Earn on idle funds" },
    ],
  },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Docs", href: "/docs" },
  { label: "Security", href: "/security" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProductsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setProductsOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-card mt-4 px-4 py-3 sm:px-6" style={{ overflow: 'visible' }}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-accent opacity-80" />
                <div className="absolute inset-[2px] rounded-md bg-background flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">N</span>
                </div>
              </div>
              <span className="font-bold text-lg tracking-tight">NEXUS</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    ref={dropdownRef}
                    className="relative group"
                  >
                    <button
                      className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setProductsOpen(!productsOpen)}
                    >
                      {link.label}
                      <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", productsOpen && "rotate-180")} />
                    </button>
                    {productsOpen && (
                      <>
                        {/* Invisible bridge to prevent gap issues */}
                        <div className="absolute top-full left-0 h-2 w-full" />
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-[calc(100%+8px)] left-0 w-64 glass-card p-2 z-[9999] shadow-xl border border-border"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              to={child.href}
                              onClick={() => setProductsOpen(false)}
                              className="block px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                            >
                              <div className="font-medium text-sm">{child.label}</div>
                              <div className="text-xs text-muted-foreground">{child.description}</div>
                            </Link>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href!}
                    className={cn(
                      "px-4 py-2 text-sm transition-colors",
                      location.pathname === link.href
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  Settings
                </Button>
              </Link>
              <ConnectButton
                chainStatus="icon"
                showBalance={false}
                accountStatus="address"
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-border"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.label}>
                      <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                        {link.label}
                      </div>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-6 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href!}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <div className="pt-4 mt-2 border-t border-border flex flex-col gap-2">
                  <Link to="/settings" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Settings
                    </Button>
                  </Link>
                  <div className="px-2">
                    <ConnectButton
                      chainStatus="icon"
                      showBalance={false}
                      accountStatus="address"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
