import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Zap,
  TrendingUp,
  Users,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroBackground, ScrollReveal } from "@/components/effects";

const howItWorks = [
  {
    step: "01",
    icon: Wallet,
    title: "Connect & Configure",
    description: "Link your wallet, set your stealth meta-address, and configure your payout preferences in under 2 minutes.",
  },
  {
    step: "02",
    icon: Lock,
    title: "Share Payment Links",
    description: "Generate encrypted invoices or one-click checkout links. Customers pay to unlinkable stealth addresses.",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Receive & Earn",
    description: "Funds arrive privately. One click sweeps idle USDC into yield-generating vaults. Watch your treasury grow.",
  },
];

const privacyFeatures = [
  {
    icon: Eye,
    title: "Unlinkable Payments",
    description: "Each payment generates a unique stealth address using ERC-5564. No one can trace payment patterns on-chain.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Invoice details, memos, and customer data are encrypted client-side. Only you and your customer can read them.",
  },
  {
    icon: Shield,
    title: "Selective Disclosure",
    description: "Share specific transaction proofs with auditors without exposing your entire payment history.",
  },
];

const capitalFeatures = [
  {
    title: "Zero Idle Assets",
    value: "$0",
    description: "Every dollar works for you",
  },
  {
    title: "One-Click Sweep",
    value: "1s",
    description: "Instant vault deposits",
  },
  {
    title: "Current APY",
    value: "4.2%",
    description: "Via Aave V3 vaults",
  },
];

const teamFeatures = [
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Admin, member, and viewer roles with granular permissions for your entire team.",
  },
  {
    icon: FileCheck,
    title: "Export Everything",
    description: "Download transaction history, invoices, and analytics in CSV, JSON, or PDF format.",
  },
  {
    icon: Sparkles,
    title: "Real-Time Analytics",
    description: "Track GMV, conversion rates, average payment size, and yield performance live.",
  },
];

const securityFeatures = [
  "Verified smart contracts on Polygonscan",
  "All transactions visible on-chain",
  "Self-custody: your keys, your funds",
  "Open-source codebase (coming soon)",
  "Regular security audits",
];

const socialProof = [
  "Built on Polygon",
  "ERC-5564 Stealth",
  "ERC-4626 Vault",
  "Aave V3",
];

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <HeroBackground />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
              <span className="status-dot status-dot-success" />
              <span className="text-sm text-muted-foreground">Live on Polygon Mainnet</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Private stablecoin payments
              <br />
              <span className="text-gradient">that keep earning.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10">
              Receive USDC to stealth addresses (unlinkable). Encrypt invoice details end-to-end.
              Sweep idle funds into yield in one click.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/invoices/new">
                <Button variant="hero" size="xl">
                  Create Invoice
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/checkout">
                <Button variant="neon" size="xl">
                  Open Checkout
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="glass" size="xl">
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {socialProof.map((item) => (
                <span
                  key={item}
                  className="badge-primary"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How it works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to private, yield-generating payments
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <ScrollReveal key={step.step} delay={index * 0.1}>
                <Card variant="glass" className="p-6 h-full">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl font-bold text-primary/20">{step.step}</span>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Privacy by design
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built from the ground up with privacy as a core principle, not an afterthought
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {privacyFeatures.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 0.1}>
                <Card variant="gradient" className="p-6 h-full">
                  <CardContent className="p-0">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 neon-glow-sm">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Productive Capital */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Productive capital
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Why let your receivables sit idle? Nexus PayStream automatically sweeps incoming payments into yield-generating ERC-4626 vaults powered by Aave V3.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {capitalFeatures.map((feature) => (
                    <div key={feature.title} className="text-center p-4 rounded-xl bg-secondary/50">
                      <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                        {feature.value}
                      </div>
                      <div className="text-sm font-medium mb-1">{feature.title}</div>
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <Card variant="glass" className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Treasury Vault</h3>
                  <span className="badge-success">
                    <RefreshCw className="h-3 w-3" />
                    Auto-compound
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Deposited</span>
                    <span className="font-mono font-semibold">$24,580.00</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Earned (30d)</span>
                    <span className="font-mono font-semibold text-green-400">+$86.45</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-muted-foreground">Current APY</span>
                    <span className="font-mono font-semibold text-primary">4.21%</span>
                  </div>
                </div>
                <Button variant="hero" className="w-full mt-6">
                  <Zap className="h-4 w-4" />
                  Sweep Funds to Vault
                </Button>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Built for Teams */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Built for teams
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Collaborate securely with role-based access, detailed audit logs, and comprehensive exports
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {teamFeatures.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 0.1}>
                <Card variant="glass" className="p-6 h-full">
                  <CardContent className="p-0">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <Card variant="gradient" className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center neon-glow">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Enterprise Security</h3>
                    <p className="text-muted-foreground">Built for the paranoid</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {securityFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Security & transparency
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  We believe security comes from transparency. Our smart contracts are verified, our code is audited, and you always maintain full custody of your funds.
                </p>
                <p className="text-muted-foreground mb-8">
                  Every transaction is recorded on-chain, providing an immutable audit trail while our stealth address implementation ensures your payment patterns remain private.
                </p>
                <Link to="/security">
                  <Button variant="neon" size="lg">
                    Learn About Our Security
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <Card variant="gradient" className="p-12 text-center relative overflow-hidden">
              {/* Glow effect */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] opacity-30"
                style={{
                  background: "radial-gradient(ellipse, hsl(263, 70%, 50%), transparent 70%)",
                  filter: "blur(60px)",
                }}
              />
              
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to get started?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  Join forward-thinking businesses accepting private, yield-generating stablecoin payments today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/invoices/new">
                    <Button variant="hero" size="xl">
                      Create Your First Invoice
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/docs">
                    <Button variant="glass" size="xl">
                      Read the Docs
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
}
