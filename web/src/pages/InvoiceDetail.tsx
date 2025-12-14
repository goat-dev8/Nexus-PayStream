import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  FileText,
  Download,
  ExternalLink,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Mock invoice data
const mockInvoice = {
  id: "nxs_inv_8f7d2a4c",
  status: "paid" as const,
  amount: 1250.0,
  currency: "USDC",
  customer: "Acme Corp",
  customerWallet: "0x742d...3a4f",
  createdAt: "2024-01-15T10:30:00Z",
  paidAt: "2024-01-16T14:22:00Z",
  dueDate: "2024-01-22",
  items: [
    { description: "Web Development Services", quantity: 1, price: 1000 },
    { description: "Hosting (3 months)", quantity: 1, price: 250 },
  ],
  txHash: "0x8f7d2a4c...1b2c3d4e",
  encrypted: true,
};

const statusConfig = {
  draft: {
    label: "Draft",
    icon: FileText,
    class: "badge-pending",
  },
  sent: {
    label: "Sent",
    icon: Clock,
    class: "badge-pending",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    class: "badge-success",
  },
  expired: {
    label: "Expired",
    icon: Clock,
    class: "text-destructive bg-destructive/10 border-destructive/30",
  },
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const invoice = mockInvoice; // In real app, fetch based on id
  const status = statusConfig[invoice.status];
  const StatusIcon = status.icon;

  return (
    <Layout>
      <div className="min-h-[80vh] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          {/* Back Link */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">Invoice #{id || invoice.id}</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.class}`}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
              </div>
              <p className="text-muted-foreground">
                Created on {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
            </div>

            {invoice.status === "paid" && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            )}
          </div>

          {/* Main Content */}
          <div className="grid gap-6">
            {/* Payment Summary */}
            <Card variant="glass" className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="text-4xl font-bold font-mono">
                    ${invoice.amount.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground">{invoice.currency}</p>
                </div>

                {invoice.status === "paid" && (
                  <motion.div
                    initial={{ scale: 2, opacity: 0, rotate: -15 }}
                    animate={{ scale: 1, opacity: 1, rotate: -15 }}
                    transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
                    className="px-4 py-2 border-2 border-green-400 text-green-400 text-sm font-bold rounded"
                  >
                    PAID
                  </motion.div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium">{invoice.customer}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {invoice.customerWallet}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <p className="font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                  {invoice.paidAt && (
                    <p className="text-sm text-green-400">
                      Paid on {new Date(invoice.paidAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Line Items */}
            <Card variant="glass" className="p-6">
              <h3 className="font-semibold mb-4">Items</h3>
              <div className="space-y-3">
                {invoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-mono">${item.price.toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 font-semibold">
                  <span>Total</span>
                  <span className="text-xl font-mono">
                    ${invoice.amount.toFixed(2)} {invoice.currency}
                  </span>
                </div>
              </div>
            </Card>

            {/* Transaction Details (if paid) */}
            {invoice.status === "paid" && (
              <Card variant="glass" className="p-6">
                <h3 className="font-semibold mb-4">Transaction Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">
                      Transaction Hash
                    </span>
                    <a
                      href="#"
                      className="flex items-center gap-2 font-mono text-sm text-primary hover:underline"
                    >
                      {invoice.txHash}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Network</span>
                    <span className="text-sm">Polygon Mainnet</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">
                      Payment Type
                    </span>
                    <span className="badge-primary">
                      <Shield className="h-3 w-3" />
                      Stealth Address
                    </span>
                  </div>
                </div>

                {invoice.encrypted && (
                  <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Invoice details were encrypted end-to-end
                    </span>
                  </div>
                )}
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
