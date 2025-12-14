import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Wallet,
  Users,
  Shield,
  Save,
  Copy,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/effects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const teamMembers = [
  { id: "1", email: "admin@company.com", role: "Admin", joined: "Jan 15, 2024" },
  { id: "2", email: "finance@company.com", role: "Member", joined: "Jan 20, 2024" },
  { id: "3", email: "viewer@company.com", role: "Viewer", joined: "Feb 1, 2024" },
];

export default function Settings() {
  const [displayName, setDisplayName] = useState("Acme Corp");
  const [username, setUsername] = useState("acmecorp");
  const [metaAddress, setMetaAddress] = useState("st:eth:0x742d35Cc6634C0532925a3b844Bc9e7595f...");
  const [payoutWallet, setPayoutWallet] = useState("0x742d35Cc6634C0532925a3b844Bc9e7595f3a4f");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopyMeta = async () => {
    await navigator.clipboard.writeText(metaAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your merchant profile and team access
            </p>
          </motion.div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <ScrollReveal>
                <Card variant="glass" className="p-6">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Merchant Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your business name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            @
                          </span>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            className="pl-8"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <Card variant="glass" className="p-6">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Stealth Address Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="metaAddress">Stealth Meta-Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="metaAddress"
                          value={metaAddress}
                          onChange={(e) => setMetaAddress(e.target.value)}
                          placeholder="st:eth:0x..."
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" onClick={handleCopyMeta}>
                          {copied ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Share this address publicly. Payers use it to generate stealth addresses.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm mb-1">How Stealth Addresses Work</p>
                          <p className="text-sm text-muted-foreground">
                            Your meta-address allows payers to create one-time addresses that only you
                            can access. This breaks the link between payments on-chain.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <Card variant="glass" className="p-6">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Payout Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="payoutWallet">Payout Wallet Address</Label>
                      <Input
                        id="payoutWallet"
                        value={payoutWallet}
                        onChange={(e) => setPayoutWallet(e.target.value)}
                        placeholder="0x..."
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Funds from stealth addresses can be withdrawn to this wallet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <Button variant="hero" size="lg" onClick={handleSave}>
                {saved ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <ScrollReveal>
                <Card variant="glass" className="p-6">
                  <CardHeader className="p-0 pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Team Members
                      </CardTitle>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-3">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{member.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Joined {member.joined}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select defaultValue={member.role.toLowerCase()}>
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <Card variant="glass" className="p-6">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-lg">Role Permissions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium">Admin</p>
                          <p className="text-muted-foreground text-xs">
                            Full access including settings and team management
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium">Member</p>
                          <p className="text-muted-foreground text-xs">
                            Create invoices, view payments, manage yield
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium">Viewer</p>
                          <p className="text-muted-foreground text-xs">
                            Read-only access to dashboard and reports
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
