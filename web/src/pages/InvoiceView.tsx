import { useParams, Link } from "react-router-dom";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, toBytes } from "viem";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
    Copy,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    ExternalLink,
    Wallet,
    CreditCard,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useInvoice, useUSDCBalance } from "@/hooks/useContracts";
import { useToast } from "@/hooks/use-toast";
import { CONTRACTS, EXTERNAL_CONTRACTS } from "@/config/constants";
import { ERC20ABI, InvoiceRegistryABI } from "@/config/abis";

export default function InvoiceView() {
    const { id } = useParams<{ id: string }>();
    const { address, isConnected } = useAccount();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [payStep, setPayStep] = useState<"idle" | "approving" | "transferring" | "marking">("idle");

    const invoiceId = BigInt(id || "0");
    const { data: invoice, isLoading, error, refetch } = useInvoice(invoiceId);
    const { data: usdcBalance } = useUSDCBalance(address);

    // Contract calls for payment - three separate steps
    const { writeContract: approveUSDC, isPending: isApproving, data: approveHash } = useWriteContract();
    const { writeContract: transferUSDC, isPending: isTransferring, data: transferHash } = useWriteContract();
    const { writeContract: callMarkPaid, isPending: isMarking, data: markHash } = useWriteContract();

    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isLoading: isTransferConfirming, isSuccess: isTransferSuccess } = useWaitForTransactionReceipt({ hash: transferHash });
    const { isLoading: isMarkConfirming, isSuccess: isMarkSuccess } = useWaitForTransactionReceipt({ hash: markHash });

    // Step 2: After approval, transfer USDC to the InvoiceRegistry
    useEffect(() => {
        if (isApproveSuccess && payStep === "approving" && invoice && address) {
            setPayStep("transferring");
            toast({ title: "Step 2/3: Transferring USDC...", description: "Please confirm the transfer." });

            // Transfer USDC to the InvoiceRegistry contract
            transferUSDC({
                address: EXTERNAL_CONTRACTS.USDC as `0x${string}`,
                abi: ERC20ABI,
                functionName: "transfer",
                args: [CONTRACTS.InvoiceRegistry as `0x${string}`, invoice.amount],
            });
        }
    }, [isApproveSuccess, payStep, invoice, address, transferUSDC, toast]);

    // Step 3: After transfer, call markPaid to update invoice status
    useEffect(() => {
        if (isTransferSuccess && payStep === "transferring" && invoice && address && transferHash) {
            setPayStep("marking");
            toast({ title: "Step 3/3: Marking paid...", description: "Please confirm to update invoice status." });

            // Generate a bytes32 hash from the transfer tx hash
            const paymentTxHashBytes = keccak256(toBytes(transferHash));

            // Call markPaid on InvoiceRegistry
            callMarkPaid({
                address: CONTRACTS.InvoiceRegistry as `0x${string}`,
                abi: InvoiceRegistryABI,
                functionName: "markPaid",
                args: [invoiceId, paymentTxHashBytes, address, invoice.amount],
            });
        }
    }, [isTransferSuccess, payStep, invoice, address, transferHash, callMarkPaid, invoiceId, toast]);

    // Final: After markPaid, show success
    useEffect(() => {
        if (isMarkSuccess && payStep === "marking") {
            setPayStep("idle");
            toast({ title: "Payment complete! 🎉", description: "Invoice has been marked as paid on-chain." });
            refetch();
        }
    }, [isMarkSuccess, payStep, toast, refetch]);

    const invoiceLink = `${window.location.origin}/invoice/${id}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(invoiceLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePay = () => {
        if (!address || !invoice) return;

        setPayStep("approving");
        toast({ title: "Step 1/3: Approving USDC...", description: "Please confirm in your wallet." });

        approveUSDC({
            address: EXTERNAL_CONTRACTS.USDC as `0x${string}`,
            abi: ERC20ABI,
            functionName: "approve",
            args: [CONTRACTS.InvoiceRegistry as `0x${string}`, invoice.amount],
        });
    };

    const formatUSDC = (amount: bigint) => {
        return (Number(amount) / 1e6).toFixed(2);
    };

    const isProcessing = isApproving || isTransferring || isMarking ||
        isApproveConfirming || isTransferConfirming || isMarkConfirming;

    const getButtonText = () => {
        if (isApproving || isApproveConfirming) return "Approving USDC...";
        if (isTransferring || isTransferConfirming) return "Transferring USDC...";
        if (isMarking || isMarkConfirming) return "Marking Paid...";
        return `Pay $${formatUSDC(invoice?.amount || 0n)} USDC`;
    };

    // Loading state
    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-[80vh] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    // Error state
    if (error || !invoice) {
        return (
            <Layout>
                <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                    <Card variant="glass" className="p-8 text-center max-w-md">
                        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Invoice Not Found</h2>
                        <p className="text-muted-foreground mb-4">
                            Invoice #{id} could not be found on Polygon mainnet.
                        </p>
                        <Link to="/">
                            <Button variant="outline">Return to Home</Button>
                        </Link>
                    </Card>
                </div>
            </Layout>
        );
    }

    const isPaid = invoice.status === 1;
    const isExpired = invoice.expiry < BigInt(Math.floor(Date.now() / 1000));
    const canPay = !isPaid && !isExpired && isConnected;

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg"
                >
                    {/* Status Banner */}
                    {isPaid ? (
                        <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                            <div>
                                <p className="font-semibold text-green-400">Invoice Paid</p>
                                <p className="text-sm text-muted-foreground">
                                    Payment received on Polygon mainnet
                                </p>
                            </div>
                        </div>
                    ) : isExpired ? (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
                            <Clock className="h-6 w-6 text-red-400" />
                            <div>
                                <p className="font-semibold text-red-400">Invoice Expired</p>
                                <p className="text-sm text-muted-foreground">
                                    This invoice is no longer valid
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <Card variant="glass" className="p-6">
                        <CardHeader className="p-0 pb-4 text-center">
                            <CardTitle className="text-2xl">Invoice #{id}</CardTitle>
                            <p className="text-muted-foreground text-sm mt-1">
                                On Polygon Mainnet
                            </p>
                        </CardHeader>

                        <CardContent className="p-0 space-y-6">
                            {/* Amount */}
                            <div className="text-center py-6 border-y border-border">
                                <p className="text-muted-foreground text-sm mb-1">Amount Due</p>
                                <p className="text-4xl font-mono font-bold">
                                    ${formatUSDC(invoice.amount)}
                                </p>
                                <p className="text-muted-foreground text-sm mt-1">USDC</p>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center">
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

                            {/* Payment Link */}
                            <div className="space-y-2">
                                <Label>Payment Link</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={invoiceLink}
                                        readOnly
                                        className="font-mono text-xs"
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

                            {/* Invoice Details */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Token</span>
                                    <span className="font-mono">USDC</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Merchant ID</span>
                                    <span className="font-mono">#{invoice.merchantId.toString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Expiry</span>
                                    <span className="font-mono">
                                        {new Date(Number(invoice.expiry) * 1000).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={isPaid ? "text-green-400" : isExpired ? "text-red-400" : "text-yellow-400"}>
                                        {isPaid ? "Paid" : isExpired ? "Expired" : "Pending"}
                                    </span>
                                </div>
                            </div>

                            {/* Pay Button (for payers) */}
                            {canPay && (
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Your USDC Balance</span>
                                        <span className="font-mono">${usdcBalance ? formatUSDC(usdcBalance) : "0.00"}</span>
                                    </div>
                                    <Button
                                        variant="hero"
                                        size="lg"
                                        className="w-full"
                                        onClick={handlePay}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                {getButtonText()}
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-5 w-5" />
                                                {getButtonText()}
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        3-step payment: Approve → Transfer → Confirm
                                    </p>
                                </div>
                            )}

                            {/* Not connected prompt */}
                            {!isConnected && !isPaid && (
                                <div className="text-center p-4 rounded-lg bg-secondary/50">
                                    <Wallet className="h-8 w-8 text-primary mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        Connect your wallet to pay this invoice
                                    </p>
                                </div>
                            )}

                            {/* PolygonScan Link */}
                            <div className="text-center pt-4">
                                <a
                                    href={`https://polygonscan.com/address/${CONTRACTS.InvoiceRegistry}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    View on PolygonScan <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </Layout>
    );
}
