import { motion } from "framer-motion";
import { Book, Code, Zap, HelpCircle, ArrowRight, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/effects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const quickstartSteps = [
  {
    step: "1",
    title: "Connect Your Wallet",
    description: "Link your Polygon-compatible wallet to get started.",
    code: null,
  },
  {
    step: "2",
    title: "Generate Stealth Meta-Address",
    description: "Create your stealth meta-address in Settings. This is shared publicly.",
    code: null,
  },
  {
    step: "3",
    title: "Create Your First Invoice",
    description: "Navigate to Invoices and create a payment request.",
    code: null,
  },
  {
    step: "4",
    title: "Share the Payment Link",
    description: "Send the encrypted invoice link to your customer.",
    code: null,
  },
];

const codeExamples = {
  createInvoice: `// Create an invoice via API
const response = await fetch('https://api.nexuspay.stream/v1/invoices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer nxs_sk_...',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 150.00,
    currency: 'USDC',
    customer_email: 'customer@example.com',
    items: [
      { description: 'Consulting', quantity: 1, price: 150.00 }
    ],
    encrypt: true,
    due_date: '2024-02-15'
  })
});

const invoice = await response.json();
console.log(invoice.payment_link);`,
  webhook: `// Handle payment webhook
app.post('/webhooks/nexus', async (req, res) => {
  const signature = req.headers['x-nexus-signature'];
  
  // Verify webhook signature
  if (!verifySignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = req.body;
  
  if (event.type === 'payment.completed') {
    const payment = event.data;
    
    // Update your database
    await db.orders.update({
      where: { invoiceId: payment.invoice_id },
      data: { status: 'paid', txHash: payment.tx_hash }
    });
    
    // Send confirmation email
    await sendConfirmationEmail(payment.customer_email);
  }
  
  res.status(200).send('OK');
});`,
  checkoutEmbed: `<!-- Embed checkout button -->
<script src="https://js.nexuspay.stream/v1/checkout.js"></script>

<button
  id="nexus-checkout"
  data-merchant="@yourusername"
  data-amount="99.00"
  data-currency="USDC"
  data-description="Premium Plan"
  data-success-url="https://yoursite.com/success"
>
  Pay with USDC
</button>

<script>
  NexusCheckout.init({
    publicKey: 'nxs_pk_...',
    onSuccess: (payment) => {
      console.log('Payment successful:', payment.id);
    },
    onError: (error) => {
      console.error('Payment failed:', error);
    }
  });
</script>`,
};

const faqs = [
  {
    question: "What is a stealth address?",
    answer:
      "A stealth address is a one-time address generated for each payment. It prevents observers from linking your payments on the blockchain, providing financial privacy while maintaining full transparency and auditability for you.",
  },
  {
    question: "How is my data encrypted?",
    answer:
      "We use AES-256-GCM encryption for all sensitive data. Encryption keys are derived client-side from your wallet signature, meaning even we cannot access your invoice details or customer information.",
  },
  {
    question: "Which tokens are supported?",
    answer:
      "Currently, we support USDC on Polygon. We're working on adding support for additional stablecoins including USDT and DAI.",
  },
  {
    question: "What are the fees?",
    answer:
      "Nexus PayStream charges 0.5% per transaction with no monthly fees. Network gas fees (typically <$0.01 on Polygon) are paid by the sender.",
  },
  {
    question: "How does the yield vault work?",
    answer:
      "Our ERC-4626 vault deposits your funds into Aave V3 on Polygon, earning variable interest. You can deposit, withdraw, or sweep incoming payments at any time.",
  },
  {
    question: "Is this non-custodial?",
    answer:
      "Yes. You always maintain full control of your funds. Payments go directly to stealth addresses that only you can access with your private keys.",
  },
];

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="p-4 rounded-lg bg-background/80 border border-border overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={handleCopy}
      >
        {copied ? (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export default function Docs() {
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
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
              <Book className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to integrate Nexus PayStream into your application
            </p>
          </motion.div>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            <Card variant="glass" className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Quickstart</p>
                  <p className="text-xs text-muted-foreground">Get started in 5 min</p>
                </div>
              </div>
            </Card>
            <Card variant="glass" className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">API Reference</p>
                  <p className="text-xs text-muted-foreground">Full API documentation</p>
                </div>
              </div>
            </Card>
            <Card variant="glass" className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">FAQs</p>
                  <p className="text-xs text-muted-foreground">Common questions</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quickstart */}
          <ScrollReveal>
            <Card variant="glass" className="p-6 mb-8">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quickstart for Merchants
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-6">
                  {quickstartSteps.map((step, index) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* API Examples */}
          <ScrollReveal>
            <Card variant="glass" className="p-6 mb-8">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Developer API
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="createInvoice">
                  <TabsList className="mb-6 bg-secondary/50">
                    <TabsTrigger value="createInvoice">Create Invoice</TabsTrigger>
                    <TabsTrigger value="webhook">Webhooks</TabsTrigger>
                    <TabsTrigger value="checkout">Checkout Embed</TabsTrigger>
                  </TabsList>

                  <TabsContent value="createInvoice">
                    <CodeBlock code={codeExamples.createInvoice} language="javascript" />
                  </TabsContent>
                  <TabsContent value="webhook">
                    <CodeBlock code={codeExamples.webhook} language="javascript" />
                  </TabsContent>
                  <TabsContent value="checkout">
                    <CodeBlock code={codeExamples.checkoutEmbed} language="html" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* FAQs */}
          <ScrollReveal>
            <Card variant="glass" className="p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-xl flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div
                      key={faq.question}
                      className="p-4 rounded-lg bg-secondary/50 border border-border"
                    >
                      <h4 className="font-medium mb-2">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </Layout>
  );
}
