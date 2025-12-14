import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Key,
  Server,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/effects";

const securityFeatures = [
  {
    icon: Eye,
    title: "Stealth Addresses (ERC-5564)",
    description:
      "Every payment generates a unique, unlinkable stealth address. Observers cannot connect your payments on-chain, preserving your financial privacy.",
    details: [
      "One-time addresses per transaction",
      "Meta-address published, actual addresses hidden",
      "Compatible with standard wallets",
      "No trusted setup required",
    ],
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "Invoice details, memos, and customer information are encrypted client-side before being stored. Only you and your customer can decrypt them.",
    details: [
      "AES-256-GCM encryption",
      "Keys derived locally",
      "Zero-knowledge to our servers",
      "Optional recipient-only encryption",
    ],
  },
  {
    icon: Key,
    title: "Client-Side Key Storage",
    description:
      "Your private keys never leave your device. We use browser-native APIs for secure key generation and storage.",
    details: [
      "Keys stored in browser's secure storage",
      "No server-side key exposure",
      "Optional hardware wallet support",
      "Exportable for backup",
    ],
  },
];

const onchainData = [
  {
    item: "Payment amounts",
    location: "On-chain",
    encrypted: false,
    note: "Visible for transparency",
  },
  {
    item: "Stealth addresses",
    location: "On-chain",
    encrypted: false,
    note: "Unlinkable to your identity",
  },
  {
    item: "Invoice details",
    location: "Off-chain (IPFS)",
    encrypted: true,
    note: "E2E encrypted",
  },
  {
    item: "Customer emails",
    location: "Off-chain",
    encrypted: true,
    note: "Never on-chain",
  },
  {
    item: "Memos",
    location: "On-chain (optional)",
    encrypted: true,
    note: "Encrypted if enabled",
  },
];

const threatModel = [
  {
    threat: "Blockchain surveillance",
    mitigation: "Stealth addresses break the link between payments",
    status: "mitigated",
  },
  {
    threat: "Server compromise",
    mitigation: "E2E encryption means we can't read your data",
    status: "mitigated",
  },
  {
    threat: "Man-in-the-middle attacks",
    mitigation: "All communications over HTTPS, keys verified locally",
    status: "mitigated",
  },
  {
    threat: "Metadata leakage",
    mitigation: "Minimal metadata stored, timing analysis difficult",
    status: "reduced",
  },
  {
    threat: "Smart contract vulnerabilities",
    mitigation: "Audited contracts, bug bounty program",
    status: "mitigated",
  },
];

export default function Security() {
  return (
    <Layout>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6 neon-glow">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Security & Privacy</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nexus PayStream is built with privacy and security as foundational principles.
              Here's how we protect your payments and data.
            </p>
          </motion.div>

          {/* Security Features */}
          <div className="space-y-6 mb-12">
            {securityFeatures.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 0.1}>
                <Card variant="glass" className="p-6">
                  <CardHeader className="p-0 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 neon-glow-sm">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 ml-16">
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {feature.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          {/* On-chain vs Off-chain */}
          <ScrollReveal>
            <Card variant="glass" className="p-6 mb-12">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  What's On-chain vs Off-chain
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  {onchainData.map((item) => (
                    <div
                      key={item.item}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        {item.encrypted ? (
                          <Lock className="h-4 w-4 text-primary" />
                        ) : (
                          <FileCheck className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm">{item.item}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">{item.location}</span>
                        <span
                          className={
                            item.encrypted ? "badge-primary" : "text-muted-foreground"
                          }
                        >
                          {item.encrypted ? "Encrypted" : item.note}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Threat Model */}
          <ScrollReveal>
            <Card variant="gradient" className="p-6 mb-12">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Threat Model
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  We openly document the threats we consider and how we address them.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {threatModel.map((item) => (
                    <div
                      key={item.threat}
                      className="p-4 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <span className="font-medium">{item.threat}</span>
                        <span
                          className={
                            item.status === "mitigated"
                              ? "badge-success"
                              : "badge-pending"
                          }
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.mitigation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Audit & Verification */}
          <ScrollReveal>
            <Card variant="glass" className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl">Verification & Audits</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <a
                    href="#"
                    className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <FileCheck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Verified Contracts</p>
                      <p className="text-xs text-muted-foreground">View on Polygonscan</p>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Security Audit</p>
                      <p className="text-xs text-muted-foreground">Read the full report</p>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Have a security concern? Contact security@nexuspay.stream
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </Layout>
  );
}
