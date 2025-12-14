import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useSignMessage } from "wagmi";
import { keccak256, toBytes, hexToBytes, bytesToHex } from "viem";
import {
    Eye,
    Wallet,
    AlertTriangle,
    RefreshCw,
    Send,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollReveal } from "@/components/effects";
import { useUSDCBalance } from "@/hooks/useContracts";

interface DetectedPayment {
    stealthAddress: string;
    balance: bigint;
    timestamp: number;
    ephemeralPubKey: string;
}

export default function StealthScanner() {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const [keysDeived, setKeysDerived] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [detectedPayments, setDetectedPayments] = useState<DetectedPayment[]>([]);
    const [showWarning, setShowWarning] = useState(true);

    const handleDeriveKeys = async () => {
        if (!address) return;

        try {
            // Sign a message to derive keys (domain-separated)
            const signature = await signMessageAsync({
                account: address,
                message: `NEXUS PayStream Key Derivation\n\nDomain: stealth-keys\nAddress: ${address}\n\nThis signature allows the app to derive your stealth viewing keys. These keys are only stored in memory and never leave your browser.`,
            });

            // In a real implementation, we'd derive actual keys from the signature
            // For now, we simulate key derivation
            console.log("Keys derived from signature:", signature.slice(0, 20) + "...");

            setKeysDerived(true);
            setShowWarning(false);
        } catch (error) {
            console.error("Key derivation failed:", error);
        }
    };

    const handleScan = async () => {
        if (!keysDeived) return;

        setIsScanning(true);

        // Simulate scanning (in real implementation, we'd scan Announcement events)
        // This would use the DEPLOYMENT.startBlock from constants
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock detected payments for demo
        setDetectedPayments([
            {
                stealthAddress: "0x" + "a".repeat(40),
                balance: BigInt(100000000), // 100 USDC
                timestamp: Date.now() - 3600000,
                ephemeralPubKey: "0x04" + "b".repeat(128),
            },
            {
                stealthAddress: "0x" + "c".repeat(40),
                balance: BigInt(50000000), // 50 USDC
                timestamp: Date.now() - 86400000,
                ephemeralPubKey: "0x04" + "d".repeat(128),
            },
        ]);

        setIsScanning(false);
    };

    const handleSweep = async (payment: DetectedPayment) => {
        // In real implementation:
        // 1. Derive stealth private key from ephemeral pub key + spending key
        // 2. Create transfer tx from stealth address to payout address
        // 3. Sign with derived private key
        // 4. Broadcast tx
        console.log("Sweeping from:", payment.stealthAddress);
    };

    const formatUSDC = (amount: bigint) => {
        return (Number(amount) / 1e6).toFixed(2);
    };

    if (!isConnected) {
        return (
            <Layout>
                <div className="px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <Card variant="glass" className="p-12 text-center">
                            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
                            <p className="text-muted-foreground">
                                Connect your wallet to access the stealth payment scanner.
                            </p>
                        </Card>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold mb-2">Stealth Payment Scanner</h1>
                        <p className="text-muted-foreground">
                            Scan for payments sent to your stealth addresses and sweep funds to your payout address.
                        </p>
                    </motion.div>

                    {/* Warning Dialog */}
                    {showWarning && (
                        <ScrollReveal>
                            <Card variant="gradient" className="p-6 mb-8 border-yellow-500/50">
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                                            Security Warning
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Deriving your stealth keys requires signing a message with your wallet.
                                            The derived keys will be held <strong>in-memory only</strong> and never
                                            leave your browser. Always verify you're on the correct website before
                                            signing.
                                        </p>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="neon">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    I Understand, Derive Keys
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirm Key Derivation</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        You are about to sign a message that will derive your stealth
                                                        viewing keys. This signature does not authorize any transactions.
                                                        <br /><br />
                                                        <strong>Never sign this message on untrusted websites.</strong>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDeriveKeys}>
                                                        Sign & Derive Keys
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </Card>
                        </ScrollReveal>
                    )}

                    {/* Keys Derived - Scanner UI */}
                    {keysDeived && (
                        <>
                            <ScrollReveal>
                                <Card variant="glass" className="p-6 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Keys Derived Successfully</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Your viewing keys are now active (in-memory only)
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="hero"
                                            onClick={handleScan}
                                            disabled={isScanning}
                                        >
                                            {isScanning ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Scanning...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Scan for Payments
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            </ScrollReveal>

                            {/* Detected Payments */}
                            {detectedPayments.length > 0 && (
                                <ScrollReveal delay={0.1}>
                                    <Card variant="glass" className="p-6">
                                        <CardHeader className="p-0 pb-4">
                                            <CardTitle className="text-lg">Detected Payments</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 space-y-4">
                                            {detectedPayments.map((payment, index) => (
                                                <div
                                                    key={payment.stealthAddress}
                                                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                                                >
                                                    <div>
                                                        <p className="font-mono text-sm truncate max-w-[200px]">
                                                            {payment.stealthAddress}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(payment.timestamp).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="font-mono font-semibold">
                                                                ${formatUSDC(payment.balance)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">USDC</p>
                                                        </div>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="neon" size="sm">
                                                                    <Send className="h-4 w-4 mr-2" />
                                                                    Sweep
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Confirm Sweep</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will transfer ${formatUSDC(payment.balance)} USDC
                                                                        from your stealth address to your registered payout address.
                                                                        <br /><br />
                                                                        A transaction will be signed using your derived stealth
                                                                        private key (in-memory only).
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleSweep(payment)}>
                                                                        Confirm Sweep
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </ScrollReveal>
                            )}

                            {/* No payments found */}
                            {!isScanning && detectedPayments.length === 0 && (
                                <ScrollReveal delay={0.1}>
                                    <Card variant="glass" className="p-12 text-center">
                                        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                                        <p className="text-muted-foreground">
                                            Click "Scan for Payments" to search for payments sent to your stealth addresses.
                                        </p>
                                    </Card>
                                </ScrollReveal>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
