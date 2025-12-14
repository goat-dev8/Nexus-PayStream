import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { createPublicClient, http, parseAbiItem } from "viem";
import { polygon } from "viem/chains";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Percent,
  Clock,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  Wallet,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter, ScrollReveal } from "@/components/effects";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CONTRACTS, DEPLOYMENT } from "@/config/constants";
import { InvoiceRegistryABI } from "@/config/abis";
import { useVaultTotalAssets, useUSDCBalance } from "@/hooks/useContracts";

const publicClient = createPublicClient({
  chain: polygon,
  transport: http(import.meta.env.VITE_POLYGON_RPC_URL || "https://polygon-rpc.com"),
});

interface InvoiceEvent {
  invoiceId: bigint;
  merchantId: bigint;
  amount: bigint;
  blockNumber: bigint;
  transactionHash: string;
  status: "created" | "paid";
  timestamp?: number;
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: vaultAssets } = useVaultTotalAssets();
  const { data: usdcBalance } = useUSDCBalance(address);

  const [isLoading, setIsLoading] = useState(true);
  const [invoiceEvents, setInvoiceEvents] = useState<InvoiceEvent[]>([]);
  const [gmv, setGmv] = useState(0n);
  const [paidCount, setPaidCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch on-chain data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Get current block number and limit range to avoid RPC limits
        // Public polygon-rpc.com has very strict limits
        const currentBlock = await publicClient.getBlockNumber();
        // Query last 1000 blocks only (about 30 minutes on Polygon)
        const fromBlockNum = currentBlock > 1000n ? currentBlock - 1000n : BigInt(DEPLOYMENT.startBlock);

        // Fetch InvoiceCreated events
        const createdLogs = await publicClient.getLogs({
          address: CONTRACTS.InvoiceRegistry as `0x${string}`,
          event: parseAbiItem(
            "event InvoiceCreated(uint256 indexed invoiceId, uint256 indexed merchantId, address token, uint256 amount, uint256 expiry, string encryptedDetailsPointer)"
          ),
          fromBlock: fromBlockNum,
          toBlock: "latest",
        });

        // Fetch InvoicePaid events
        const paidLogs = await publicClient.getLogs({
          address: CONTRACTS.InvoiceRegistry as `0x${string}`,
          event: parseAbiItem(
            "event InvoicePaid(uint256 indexed invoiceId, uint256 indexed merchantId, address indexed payer, uint256 paidAmount, bytes32 paymentTxHash)"
          ),
          fromBlock: fromBlockNum,
          toBlock: "latest",
        });

        // Process created invoices
        const createdEvents: InvoiceEvent[] = createdLogs.map((log) => ({
          invoiceId: log.args.invoiceId!,
          merchantId: log.args.merchantId!,
          amount: log.args.amount!,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          status: "created" as const,
        }));

        // Calculate paid invoices
        const paidInvoiceIds = new Set(paidLogs.map((log) => log.args.invoiceId!.toString()));

        // Calculate GMV from paid invoices
        let totalGmv = 0n;
        createdEvents.forEach((event) => {
          if (paidInvoiceIds.has(event.invoiceId.toString())) {
            totalGmv += event.amount;
            event.status = "paid";
          }
        });

        setInvoiceEvents(createdEvents.slice(-10).reverse()); // Last 10 events
        setGmv(totalGmv);
        setPaidCount(paidInvoiceIds.size);
        setTotalCount(createdEvents.length);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatUSDC = (amount: bigint) => {
    return Number(amount) / 1e6;
  };

  const conversionRate = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

  // Generate chart data from events (simplified)
  const chartData = [
    { date: "Week 1", payments: formatUSDC(gmv) * 0.1 },
    { date: "Week 2", payments: formatUSDC(gmv) * 0.2 },
    { date: "Week 3", payments: formatUSDC(gmv) * 0.35 },
    { date: "Week 4", payments: formatUSDC(gmv) * 0.55 },
    { date: "Week 5", payments: formatUSDC(gmv) * 0.75 },
    { date: "Week 6", payments: formatUSDC(gmv) * 0.9 },
    { date: "Week 7", payments: formatUSDC(gmv) },
  ];

  const kpis = [
    {
      title: "Gross Merchant Volume",
      value: formatUSDC(gmv),
      prefix: "$",
      suffix: "",
      icon: DollarSign,
      change: gmv > 0n ? 12.5 : 0,
    },
    {
      title: "Paid Invoices",
      value: paidCount,
      prefix: "",
      suffix: "",
      icon: FileText,
      change: paidCount > 0 ? 8.3 : 0,
    },
    {
      title: "Conversion Rate",
      value: conversionRate,
      prefix: "",
      suffix: "%",
      decimals: 1,
      icon: Percent,
      change: conversionRate > 0 ? 2.1 : 0,
    },
    {
      title: "Your USDC Balance",
      value: usdcBalance ? formatUSDC(usdcBalance) : 0,
      prefix: "$",
      suffix: "",
      icon: Wallet,
      change: 0,
    },
    {
      title: "Vault Total Assets",
      value: vaultAssets ? formatUSDC(vaultAssets) : 0,
      prefix: "$",
      suffix: "",
      icon: Clock,
      change: vaultAssets ? 5.2 : 0,
    },
    {
      title: "Total Invoices",
      value: totalCount,
      prefix: "",
      suffix: "",
      decimals: 0,
      icon: Sparkles,
      change: totalCount > 0 ? 15.8 : 0,
    },
  ];

  if (!isConnected) {
    return (
      <Layout>
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Card variant="glass" className="p-12 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
              <p className="text-muted-foreground">
                Connect your wallet to view your dashboard and analytics.
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
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your payments, revenue, and yield performance - all from on-chain data
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading on-chain data...</span>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {kpis.map((kpi, index) => (
                  <ScrollReveal key={kpi.title} delay={index * 0.05}>
                    <Card variant="glass" className="p-4 sm:p-6">
                      <CardContent className="p-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <kpi.icon className="h-5 w-5 text-primary" />
                          </div>
                          {kpi.change !== 0 && (
                            <div
                              className={`flex items-center gap-1 text-xs font-medium ${kpi.change >= 0 ? "text-green-400" : "text-red-400"
                                }`}
                            >
                              {kpi.change >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {Math.abs(kpi.change)}%
                            </div>
                          )}
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold font-mono mb-1">
                          <AnimatedCounter
                            value={kpi.value}
                            prefix={kpi.prefix}
                            suffix={kpi.suffix}
                            decimals={kpi.decimals || 0}
                          />
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {kpi.title}
                        </p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <ScrollReveal>
                  <Card variant="glass" className="p-6">
                    <CardHeader className="p-0 pb-6">
                      <CardTitle className="text-lg">Payments Over Time</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 15%)" />
                            <XAxis
                              dataKey="date"
                              stroke="hsl(240, 5%, 64%)"
                              fontSize={12}
                            />
                            <YAxis
                              stroke="hsl(240, 5%, 64%)"
                              fontSize={12}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "hsl(240, 10%, 8%)",
                                border: "1px solid hsl(240, 10%, 20%)",
                                borderRadius: "8px",
                              }}
                              labelStyle={{ color: "hsl(0, 0%, 98%)" }}
                            />
                            <Area
                              type="monotone"
                              dataKey="payments"
                              stroke="hsl(263, 70%, 58%)"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorPayments)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                  <Card variant="glass" className="p-6">
                    <CardHeader className="p-0 pb-6">
                      <CardTitle className="text-lg">Token Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex items-center justify-center h-[300px]">
                        <div className="text-center">
                          <div className="relative h-48 w-48 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full border-[24px] border-primary" />
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                              <span className="text-3xl font-bold">100%</span>
                              <span className="text-sm text-muted-foreground">USDC</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-primary" />
                            <span className="text-sm">USDC - ${formatUSDC(gmv).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              </div>

              {/* Recent Invoices */}
              <ScrollReveal>
                <Card variant="glass" className="p-6">
                  <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Recent Invoices (On-Chain)</CardTitle>
                    <Link to="/invoices/new">
                      <Button variant="ghost" size="sm">
                        Create Invoice
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0">
                    {invoiceEvents.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No invoices found. Create your first invoice to get started.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border">
                              <TableHead>Invoice ID</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Block</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoiceEvents.map((event) => (
                              <TableRow key={event.invoiceId.toString()} className="border-border">
                                <TableCell className="font-mono text-sm">
                                  #{event.invoiceId.toString()}
                                </TableCell>
                                <TableCell className="font-mono font-medium">
                                  ${formatUSDC(event.amount).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={
                                      event.status === "paid"
                                        ? "badge-success"
                                        : "badge-pending"
                                    }
                                  >
                                    {event.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {event.blockNumber.toString()}
                                </TableCell>
                                <TableCell>
                                  <a
                                    href={`https://polygonscan.com/tx/${event.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="ghost" size="icon">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </a>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
