import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  TrendingUp,
  Shield,
  Zap,
  Info,
  Loader2,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollReveal, AnimatedCounter } from "@/components/effects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTRACTS, EXTERNAL_CONTRACTS } from "@/config/constants";
import { TreasuryVaultABI, ERC20ABI } from "@/config/abis";
import { useVaultTotalAssets, useVaultShareBalance, useUSDCBalance } from "@/hooks/useContracts";
import { useToast } from "@/hooks/use-toast";

export default function Yield() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositStep, setDepositStep] = useState<"idle" | "approving" | "depositing">("idle");
  const [pendingDepositAmount, setPendingDepositAmount] = useState<bigint>(0n);

  // On-chain data
  const { data: vaultAssets, refetch: refetchVaultAssets } = useVaultTotalAssets();
  const { data: shareBalance, refetch: refetchShareBalance } = useVaultShareBalance(address);
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useUSDCBalance(address);

  const { writeContract: approveUSDC, isPending: isApproving, data: approveHash } = useWriteContract();
  const { writeContract: depositToVault, isPending: isDepositing, data: depositHash } = useWriteContract();
  const { writeContract: withdrawFromVault, isPending: isWithdrawing, data: withdrawHash } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

  // Watch for approval success and trigger deposit
  useEffect(() => {
    if (isApproveSuccess && depositStep === "approving" && pendingDepositAmount > 0n && address) {
      setDepositStep("depositing");
      toast({ title: "Approval confirmed!", description: "Now depositing to vault..." });

      depositToVault({
        address: CONTRACTS.TreasuryVaultUSDC as `0x${string}`,
        abi: TreasuryVaultABI,
        functionName: "deposit",
        args: [pendingDepositAmount, address],
      });
    }
  }, [isApproveSuccess, depositStep, pendingDepositAmount, address, depositToVault, toast]);

  // Watch for deposit success
  useEffect(() => {
    if (isDepositSuccess && depositStep === "depositing") {
      setDepositStep("idle");
      setPendingDepositAmount(0n);
      setDepositAmount("");
      toast({ title: "Deposit successful! 🎉", description: "Your USDC is now earning yield in the vault." });
      refetchVaultAssets();
      refetchShareBalance();
      refetchUsdcBalance();
    }
  }, [isDepositSuccess, depositStep, toast, refetchVaultAssets, refetchShareBalance, refetchUsdcBalance]);

  // Watch for withdraw success
  useEffect(() => {
    if (isWithdrawSuccess) {
      setWithdrawAmount("");
      toast({ title: "Withdrawal successful!", description: "USDC has been sent to your wallet." });
      refetchVaultAssets();
      refetchShareBalance();
      refetchUsdcBalance();
    }
  }, [isWithdrawSuccess, toast, refetchVaultAssets, refetchShareBalance, refetchUsdcBalance]);

  // Format values
  const formatUSDC = (amount: bigint | undefined) => {
    if (!amount) return 0;
    return Number(amount) / 1e6;
  };

  const vaultBalance = formatUSDC(shareBalance);
  const totalVaultAssets = formatUSDC(vaultAssets);
  const availableUSDC = formatUSDC(usdcBalance);
  const currentApy = 4.21; // Aave V3 USDC APY (would fetch from Aave in production)
  const earned30d = vaultBalance * (currentApy / 100) / 12;

  const handleDeposit = async () => {
    if (!depositAmount || !address) return;

    try {
      const amount = parseUnits(depositAmount, 6);

      // Set state for the two-step flow
      setDepositStep("approving");
      setPendingDepositAmount(amount);

      // First approve USDC
      toast({ title: "Step 1/2: Approving USDC...", description: "Please confirm the approval in your wallet" });

      approveUSDC({
        address: EXTERNAL_CONTRACTS.USDC as `0x${string}`,
        abi: ERC20ABI,
        functionName: "approve",
        args: [CONTRACTS.TreasuryVaultUSDC as `0x${string}`, amount],
      });
    } catch (error) {
      console.error("Deposit error:", error);
      setDepositStep("idle");
      setPendingDepositAmount(0n);
      toast({ title: "Error", description: "Transaction failed", variant: "destructive" });
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !address) return;

    try {
      const amount = parseUnits(withdrawAmount, 6);

      withdrawFromVault({
        address: CONTRACTS.TreasuryVaultUSDC as `0x${string}`,
        abi: TreasuryVaultABI,
        functionName: "withdraw",
        args: [amount, address, address],
      });

      toast({ title: "Withdrawal submitted", description: "Please confirm in your wallet" });
    } catch (error) {
      console.error("Withdraw error:", error);
      toast({ title: "Error", description: "Transaction failed", variant: "destructive" });
    }
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
                Connect your wallet to access yield features.
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
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Yield</h1>
            <p className="text-muted-foreground">
              Put your idle funds to work with ERC-4626 yield vaults - powered by Aave V3
            </p>
          </motion.div>

          {/* Overview Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <ScrollReveal>
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Your Shares</span>
                </div>
                <p className="text-2xl font-bold font-mono">
                  <AnimatedCounter value={vaultBalance} prefix="$" decimals={2} />
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Available USDC</span>
                </div>
                <p className="text-2xl font-bold font-mono">
                  <AnimatedCounter value={availableUSDC} prefix="$" decimals={2} />
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Current APY</span>
                </div>
                <p className="text-2xl font-bold font-mono text-green-400">
                  <AnimatedCounter value={currentApy} suffix="%" decimals={2} />
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Vault TVL</span>
                </div>
                <p className="text-2xl font-bold font-mono">
                  <AnimatedCounter value={totalVaultAssets} prefix="$" decimals={2} />
                </p>
              </Card>
            </ScrollReveal>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Treasury Vault Card */}
            <ScrollReveal>
              <Card variant="gradient" className="p-6">
                <CardHeader className="p-0 pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Treasury Vault (ERC-4626)
                    </CardTitle>
                    <span className="badge-success">
                      <RefreshCw className="h-3 w-3" />
                      Auto-compound
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Tabs defaultValue="deposit" className="w-full">
                    <TabsList className="w-full mb-6 bg-secondary/50">
                      <TabsTrigger value="deposit" className="flex-1">
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        Deposit
                      </TabsTrigger>
                      <TabsTrigger value="withdraw" className="flex-1">
                        <ArrowUpFromLine className="h-4 w-4 mr-2" />
                        Withdraw
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="deposit" className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Amount</Label>
                          <span className="text-xs text-muted-foreground">
                            Available: ${availableUSDC.toFixed(2)} USDC
                          </span>
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="text-xl font-mono h-14 pr-20"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                            onClick={() => setDepositAmount(availableUSDC.toFixed(2))}
                          >
                            MAX
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-secondary/50 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">You will receive</span>
                          <span className="font-mono">
                            {depositAmount ? parseFloat(depositAmount).toFixed(2) : "0.00"} shares
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Est. monthly yield</span>
                          <span className="font-mono text-green-400">
                            +${depositAmount ? (parseFloat(depositAmount) * 0.0035).toFixed(2) : "0.00"}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="hero"
                        className="w-full"
                        size="lg"
                        onClick={handleDeposit}
                        disabled={isApproving || isDepositing || isApproveConfirming || isDepositConfirming}
                      >
                        {(isApproving || isApproveConfirming) ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Approving...
                          </>
                        ) : (isDepositing || isDepositConfirming) ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Depositing...
                          </>
                        ) : (
                          <>
                            <ArrowDownToLine className="h-5 w-5" />
                            Deposit to Vault
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="withdraw" className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Amount</Label>
                          <span className="text-xs text-muted-foreground">
                            Vault balance: ${vaultBalance.toFixed(2)}
                          </span>
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="text-xl font-mono h-14 pr-20"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                            onClick={() => setWithdrawAmount(vaultBalance.toString())}
                          >
                            MAX
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-secondary/50 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">You will receive</span>
                          <span className="font-mono">
                            ${withdrawAmount ? parseFloat(withdrawAmount).toFixed(2) : "0.00"} USDC
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="neon"
                        className="w-full"
                        size="lg"
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || isWithdrawConfirming}
                      >
                        {(isWithdrawing || isWithdrawConfirming) ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Withdrawing...
                          </>
                        ) : (
                          <>
                            <ArrowUpFromLine className="h-5 w-5" />
                            Withdraw from Vault
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Vault Info Card */}
            <ScrollReveal delay={0.1}>
              <Card variant="glass" className="p-6">
                <CardHeader className="p-0 pb-6">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Vault Information
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0 space-y-4">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-1">Treasury Vault</p>
                        <p className="text-xs text-muted-foreground font-mono break-all">
                          {CONTRACTS.TreasuryVaultUSDC}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="text-sm text-muted-foreground">Protocol</span>
                      <span className="font-medium">Aave V3</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="text-sm text-muted-foreground">Asset</span>
                      <span className="font-medium">USDC</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="text-sm text-muted-foreground">Network</span>
                      <span className="font-medium">Polygon</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="text-sm text-muted-foreground">Standard</span>
                      <span className="font-medium">ERC-4626</span>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Funds are deposited into Aave V3 USDC pool on Polygon mainnet
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </Layout>
  );
}
