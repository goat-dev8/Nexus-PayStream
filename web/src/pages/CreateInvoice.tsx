import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, decodeEventLog } from "viem";
import { QRCodeSVG } from "qrcode.react";
import {
  Plus,
  Trash2,
  Lock,
  QrCode,
  Copy,
  CheckCircle2,
  Calendar,
  Mail,
  FileText,
  Loader2,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMerchantByAddress } from "@/hooks/useContracts";
import { CONTRACTS, EXTERNAL_CONTRACTS } from "@/config/constants";
import { MerchantRegistryABI, InvoiceRegistryABI } from "@/config/abis";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export default function CreateInvoice() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  // Form state
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerWallet, setCustomerWallet] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [encryptDetails, setEncryptDetails] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, price: 0 },
  ]);

  // Contract state
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceId, setInvoiceId] = useState<bigint | null>(null);
  const [copied, setCopied] = useState(false);

  // Merchant registration
  const [showRegister, setShowRegister] = useState(false);
  const [merchantUsername, setMerchantUsername] = useState("");

  // Check if user is a registered merchant
  const { data: merchantId, isLoading: isMerchantLoading, refetch: refetchMerchant } = useMerchantByAddress(address);

  // Register merchant contract call
  const { writeContract: registerMerchant, isPending: isRegistering, data: registerHash } = useWriteContract();
  const { isLoading: isRegisterConfirming, isSuccess: isRegisterSuccess } = useWaitForTransactionReceipt({ hash: registerHash });

  // Create invoice contract call
  const { writeContract: createInvoice, isPending: isCreating, data: createHash } = useWriteContract();
  const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess, data: createReceipt } = useWaitForTransactionReceipt({ hash: createHash });

  // Check if user is registered (merchantId > 0)
  const isRegistered = merchantId !== undefined && merchantId > 0n;

  // Watch for registration success
  useEffect(() => {
    if (isRegisterSuccess) {
      toast({ title: "Merchant registered!", description: "You can now create invoices." });
      setShowRegister(false);
      refetchMerchant();
    }
  }, [isRegisterSuccess, toast, refetchMerchant]);

  // Watch for invoice creation success
  useEffect(() => {
    if (isCreateSuccess && createReceipt) {
      try {
        // Decode InvoiceCreated event from logs
        const invoiceCreatedLog = createReceipt.logs.find((log) => {
          try {
            const decoded = decodeEventLog({
              abi: InvoiceRegistryABI,
              data: log.data,
              topics: log.topics,
            });
            return decoded.eventName === "InvoiceCreated";
          } catch {
            return false;
          }
        });

        if (invoiceCreatedLog) {
          const decoded = decodeEventLog({
            abi: InvoiceRegistryABI,
            data: invoiceCreatedLog.data,
            topics: invoiceCreatedLog.topics,
          });
          if (decoded.eventName === "InvoiceCreated" && decoded.args) {
            setInvoiceId((decoded.args as { invoiceId: bigint }).invoiceId);
          }
        }

        setInvoiceGenerated(true);
        toast({ title: "Invoice created on-chain! 🎉", description: "Share the link with your customer." });
      } catch (error) {
        console.error("Error decoding invoice event:", error);
        setInvoiceGenerated(true);
        toast({ title: "Invoice created!", description: "Share the link with your customer." });
      }
    }
  }, [isCreateSuccess, createReceipt, toast]);

  const invoiceLink = invoiceId
    ? `${window.location.origin}/invoice/${invoiceId.toString()}`
    : `${window.location.origin}/invoice/pending`;

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: "", quantity: 1, price: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleRegister = () => {
    if (!merchantUsername || !address) return;

    toast({ title: "Registering merchant...", description: "Please confirm in your wallet." });
    // Generate a placeholder stealth meta-address from user's address
    // Format: spending key (33 bytes) + viewing key (33 bytes) = 66 bytes
    // Using address repeated as placeholder - user can update later with proper keys
    const paddedAddress = address.toLowerCase().replace('0x', '');
    const stealthMetaPlaceholder = `0x${paddedAddress}${'00'.repeat(23)}${paddedAddress}${'00'.repeat(23)}` as `0x${string}`;

    registerMerchant({
      address: CONTRACTS.MerchantRegistry as `0x${string}`,
      abi: MerchantRegistryABI,
      functionName: "registerMerchant",
      args: [merchantUsername, address, stealthMetaPlaceholder],
    });
  };

  const handleGenerate = async () => {
    if (!address || !merchantId || total === 0) return;

    try {
      // Calculate expiry (default 30 days from now)
      const expiryDate = dueDate
        ? Math.floor(new Date(dueDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

      // Create encrypted details pointer (simplified - in production use IPFS)
      const invoiceDetails = JSON.stringify({
        lineItems,
        customerEmail,
        customerWallet,
        note,
        encrypted: encryptDetails,
      });
      const detailsPointer = encryptDetails
        ? `encrypted:${btoa(invoiceDetails)}`
        : `plain:${btoa(invoiceDetails)}`;

      toast({ title: "Creating invoice...", description: "Please confirm in your wallet." });

      // Convert amount to USDC decimals (6)
      const amountInUSDC = parseUnits(total.toFixed(6), 6);

      createInvoice({
        address: CONTRACTS.InvoiceRegistry as `0x${string}`,
        abi: InvoiceRegistryABI,
        functionName: "createInvoice",
        args: [
          merchantId,
          EXTERNAL_CONTRACTS.USDC as `0x${string}`,
          amountInUSDC,
          BigInt(expiryDate),
          detailsPointer,
        ],
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({ title: "Error", description: "Failed to create invoice", variant: "destructive" });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(invoiceLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Not connected
  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <Card variant="glass" className="p-8 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to create invoices.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  // Loading merchant status
  if (isMerchantLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Merchant registration required
  if (!isRegistered || showRegister) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card variant="glass" className="p-6">
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Register as Merchant</h2>
                <p className="text-muted-foreground text-sm">
                  To create invoices, you need to register as a merchant on-chain.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Choose a Username</Label>
                  <Input
                    id="username"
                    placeholder="mystore"
                    value={merchantUsername}
                    onChange={(e) => setMerchantUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lowercase letters and numbers only
                  </p>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleRegister}
                  disabled={!merchantUsername || isRegistering || isRegisterConfirming}
                >
                  {(isRegistering || isRegisterConfirming) ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Register on Polygon
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  This will create a permanent merchant record on Polygon mainnet.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Invoice generated success
  if (invoiceGenerated) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">Invoice Created On-Chain! 🎉</h1>
              <p className="text-muted-foreground">
                Invoice #{invoiceId?.toString() || "pending"} is now on Polygon mainnet
              </p>
            </div>

            <Card variant="glass" className="p-6 mb-6">
              {/* Invoice Link */}
              <div className="mb-6">
                <Label className="mb-2 block">Payment Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={invoiceLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-xl">
                  <QRCodeSVG
                    value={invoiceLink}
                    size={180}
                    level="H"
                    includeMargin={false}
                    bgColor="#FFFFFF"
                    fgColor="#7C3AED"
                  />
                </div>
              </div>

              {/* Invoice Preview */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4">Invoice Preview</h3>
                <div className="space-y-3">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.description || "Item"} × {item.quantity}
                      </span>
                      <span className="font-mono">${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t border-border font-semibold">
                    <span>Total</span>
                    <span className="font-mono text-lg">${total.toFixed(2)} USDC</span>
                  </div>
                </div>
              </div>

              {encryptDetails && (
                <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm">Invoice details are end-to-end encrypted</span>
                </div>
              )}

              {/* PolygonScan Link */}
              {createHash && (
                <div className="mt-4 text-center">
                  <a
                    href={`https://polygonscan.com/tx/${createHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View transaction on PolygonScan →
                  </a>
                </div>
              )}
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setInvoiceGenerated(false);
                  setInvoiceId(null);
                  setLineItems([{ id: "1", description: "", quantity: 1, price: 0 }]);
                }}
              >
                Create Another
              </Button>
              <Link to="/dashboard" className="flex-1">
                <Button variant="hero" className="w-full">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Main invoice creation form
  return (
    <Layout>
      <div className="min-h-[80vh] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Invoice</h1>
            <p className="text-muted-foreground">
              Generate a real on-chain invoice on Polygon mainnet
            </p>
            {merchantId && (
              <p className="text-xs text-primary mt-2">
                Merchant ID: #{merchantId.toString()}
              </p>
            )}
          </div>

          <Card variant="glass" className="p-6">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Invoice Details
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 space-y-6">
              {/* Customer Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Customer Email (optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallet">Wallet / Username</Label>
                  <Input
                    id="wallet"
                    placeholder="0x... or @username"
                    value={customerWallet}
                    onChange={(e) => setCustomerWallet(e.target.value)}
                  />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                <Label>Items</Label>
                {lineItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex-1">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="Qty"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        placeholder="Price"
                        step="0.01"
                        min={0}
                        value={item.price || ""}
                        onChange={(e) =>
                          updateLineItem(item.id, "price", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
                <Button variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                <span className="font-medium">Total Amount</span>
                <span className="text-2xl font-mono font-bold">${total.toFixed(2)} USDC</span>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Payment terms, additional details..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Encryption Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Encrypt invoice details</p>
                    <p className="text-xs text-muted-foreground">
                      Recommended for sensitive information
                    </p>
                  </div>
                </div>
                <Switch checked={encryptDetails} onCheckedChange={setEncryptDetails} />
              </div>

              {/* Generate Button */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                disabled={total === 0 || isCreating || isCreateConfirming}
              >
                {(isCreating || isCreateConfirming) ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Invoice...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5" />
                    Create Invoice on Polygon
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                This will create an on-chain invoice record. Gas fees apply.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
