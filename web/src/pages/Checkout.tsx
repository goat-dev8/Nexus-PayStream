import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield, Wallet, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Checkout() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("");
  const [privacyMode, setPrivacyMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    // Simulate payment
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card variant="glass" className="p-8 max-w-md mx-auto">
              <div className="relative mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                </motion.div>
                
                {/* Stamp animation */}
                <motion.div
                  initial={{ scale: 2, opacity: 0, rotate: -15 }}
                  animate={{ scale: 1, opacity: 1, rotate: -15 }}
                  transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
                  className="absolute -top-4 -right-4 px-3 py-1 border-2 border-green-400 text-green-400 text-xs font-bold rounded rotate-[-15deg]"
                >
                  PAID
                </motion.div>
              </div>

              <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
              <p className="text-muted-foreground mb-6">
                Your payment of ${amount} USDC has been sent privately.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono">${amount} USDC</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-mono truncate ml-2">{recipient}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm">
                  <span className="text-muted-foreground">Privacy</span>
                  <span className="badge-success">Stealth Address</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">Transaction is unlinkable on-chain</span>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsComplete(false);
                  setAmount("");
                  setRecipient("");
                  setMemo("");
                }}
              >
                Make Another Payment
              </Button>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground">
              Send private stablecoin payments instantly
            </p>
          </div>

          <Card variant="glass" className="p-6">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Payment Details
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 space-y-6">
              {/* Recipient */}
              <div className="space-y-2">
                <Label htmlFor="recipient">Pay to</Label>
                <div className="relative">
                  <Input
                    id="recipient"
                    placeholder="@merchant or merchant.eth"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="pr-32"
                  />
                  {recipient && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <span className="badge-success text-xs">
                        <Shield className="h-3 w-3" />
                        Stealth enabled
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl font-mono h-14 pr-20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">$</span>
                    </div>
                    <span className="font-medium">USDC</span>
                  </div>
                </div>
              </div>

              {/* Memo */}
              <div className="space-y-2">
                <Label htmlFor="memo">Memo (optional)</Label>
                <Input
                  id="memo"
                  placeholder="Payment for services..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Privacy mode</p>
                    <p className="text-xs text-muted-foreground">Pay to stealth address</p>
                  </div>
                </div>
                <Switch
                  checked={privacyMode}
                  onCheckedChange={setPrivacyMode}
                />
              </div>

              {/* Gas Estimate */}
              {amount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Network fee (est.)</span>
                    <span className="font-mono">~$0.02</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-mono font-semibold">
                      ${(parseFloat(amount) + 0.02).toFixed(2)} USDC
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Pay Button */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handlePay}
                disabled={!amount || !recipient || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ${amount || "0.00"} USDC
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Transaction Steps */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  {["Generating stealth address...", "Encrypting memo...", "Broadcasting transaction..."].map(
                    (step, index) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.5 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {step}
                      </motion.div>
                    )
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
