"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Zap, Heart, BookMarked, Wallet, Calendar, ShieldAlert, TrendingUp, Crown, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PaymentMethodDialog } from "@/components/payment-method-dialog";

interface SubscriptionManagementData {
    success: boolean;
    tier: string;
    subscriptionStatus: string;
    nextDue: string | null;
    lastPaymentDate: string | null;
    paymentMethod: string | null;
    limits: {
        backtest: number;
        subscriptions: number;
        savedStrategies: number;
    };
    usage: {
        backtest: number;
        subscriptions: number;
        savedStrategies: number;
    };
}

export function AccountManagementPage() {
    const [data, setData] = useState<SubscriptionManagementData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCanceling, setIsCanceling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const [isYearly, setIsYearly] = useState(false);
    const [upgradePlan, setUpgradePlan] = useState<{
        type: 'suhu' | 'bandar';
        name: string;
        amount: number;
        interval: 'monthly' | 'yearly';
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/subscriptions/management");
                const json = await res.json();
                if (json.success) {
                    setData(json);
                } else {
                    setError("Gagal memuat data langganan.");
                }
            } catch {
                setError("Terjadi kesalahan.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCancel = async () => {
        setIsCanceling(true);
        try {
            const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
            const json = await res.json();
            if (json.success) {
                setData(prev => prev ? { ...prev, subscriptionStatus: 'canceled' } : prev);
                setShowCancelDialog(false);
            } else {
                alert("Gagal membatalkan langganan.");
            }
        } catch {
            alert("Terjadi kesalahan.");
        } finally {
            setIsCanceling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 h-full">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full gap-3 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">{error || "Data tidak ditemukan."}</p>
            </div>
        );
    }

    const { tier, subscriptionStatus, nextDue, lastPaymentDate, paymentMethod, limits, usage } = data;
    const isFree = tier === "ritel";
    const isActive = subscriptionStatus === "active";

    const tierColor = tier === "suhu" ? "#487b78" : tier === "bandar" ? "#d4af37" : "#71717a";
    const tierBg = tier === "suhu" ? "rgba(72,123,120,0.07)" : tier === "bandar" ? "rgba(212,175,55,0.07)" : "rgba(113,113,122,0.06)";
    const tierBorder = tier === "suhu" ? "rgba(72,123,120,0.18)" : tier === "bandar" ? "rgba(212,175,55,0.22)" : "rgba(113,113,122,0.14)";

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return format(new Date(dateStr), "d MMM yyyy", { locale: id });
    };

    const getUsagePercent = (used: number, limit: number) =>
        limit === -1 ? 100 : Math.min((used / limit) * 100, 100);

    const quotaItems = [
        { icon: Zap, label: "Backtest Harian", used: usage.backtest, limit: limits.backtest, note: "reset tiap hari" },
        { icon: Heart, label: "Langganan Strategi", used: usage.subscriptions, limit: limits.subscriptions, note: null },
        { icon: BookMarked, label: "Strategi Disimpan", used: usage.savedStrategies, limit: limits.savedStrategies, note: null },
    ];

    return (
        <div className="relative flex flex-col h-full">
            {/* Tinted header — reflects current tier */}
            <div
                className="px-5 py-4 border-b flex-shrink-0"
                style={{ background: tierBg, borderColor: tierBorder }}
            >
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-sm font-semibold font-ibm-plex-mono text-foreground tracking-tight">
                            Langganan
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Kelola paket, pembayaran, dan kuota Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                            className="px-2.5 py-0.5 text-[11px] font-bold text-white rounded-[3px] font-ibm-plex-mono uppercase tracking-widest"
                            style={{ backgroundColor: tierColor }}
                        >
                            {tier}
                        </div>
                        {!isFree && (
                            <span
                                className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                                    isActive
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                        : "bg-red-50 text-red-500 border-red-200"
                                }`}
                            >
                                {isActive ? "Aktif" : "Dibatalkan"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-4">
                {/* Billing dates — only for paid plans */}
                {!isFree && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-lg border bg-card space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                <Calendar className="w-3 h-3" />
                                Berlaku Sampai
                            </div>
                            <div className="text-sm font-medium text-foreground tabular-nums">
                                {formatDate(nextDue)}
                            </div>
                        </div>

                        <div className="p-3.5 rounded-lg border bg-card space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                <Wallet className="w-3 h-3" />
                                Pembayaran Terakhir
                            </div>
                            <div className="flex items-center justify-between gap-1">
                                <div className="text-sm font-medium text-foreground tabular-nums">
                                    {formatDate(lastPaymentDate)}
                                </div>
                                {paymentMethod && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono text-muted-foreground uppercase flex-shrink-0">
                                        {paymentMethod.replace(/_/g, " ")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quota usage */}
                <div className="rounded-lg border bg-card overflow-hidden">
                    <div className="px-4 py-2.5 border-b bg-muted/30">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Kuota Penggunaan
                        </span>
                    </div>

                    <div className="divide-y">
                        {quotaItems.map(({ icon: Icon, label, used, limit, note }) => (
                            <div key={label} className="px-4 py-3.5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm text-foreground truncate">{label}</span>
                                        {note && (
                                            <span className="text-[10px] text-muted-foreground/60 font-mono hidden sm:block flex-shrink-0">
                                                · {note}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm font-semibold font-mono text-foreground tabular-nums flex-shrink-0 ml-3">
                                        {limit === -1 ? "∞" : `${used} / ${limit}`}
                                    </span>
                                </div>

                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: `${getUsagePercent(used, limit)}%`,
                                            backgroundColor: limit === -1 ? tierColor : "#d07225",
                                            opacity: limit === -1 ? 0.35 : 1,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upgrade options */}
                {(tier === "ritel" || tier === "suhu") && (
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Tingkatkan Paket
                            </span>

                            {/* Billing period toggle */}
                            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full border bg-card">
                                <button
                                    onClick={() => setIsYearly(false)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                                        !isYearly
                                            ? "bg-muted text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Bulanan
                                </button>
                                <button
                                    onClick={() => setIsYearly(true)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                                        isYearly
                                            ? "bg-[#d07225] text-white shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Tahunan
                                    <span
                                        className={`text-[10px] font-semibold ${
                                            isYearly ? "text-white/80" : "text-[#d07225]"
                                        }`}
                                    >
                                        -50%
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="p-3 space-y-2">
                            {/* Suhu plan — only show if currently on ritel */}
                            {tier === "ritel" && (
                                <button
                                    onClick={() =>
                                        setUpgradePlan({
                                            type: "suhu",
                                            name: "Suhu",
                                            amount: isYearly ? 44750 * 12 : 89500,
                                            interval: isYearly ? "yearly" : "monthly",
                                        })
                                    }
                                    className="w-full flex items-center justify-between p-3.5 rounded-lg border transition-all duration-150 hover:shadow-sm group text-left"
                                    style={{
                                        borderColor: "rgba(72,123,120,0.25)",
                                        background: "rgba(72,123,120,0.04)",
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: "rgba(72,123,120,0.14)" }}
                                        >
                                            <TrendingUp className="w-4 h-4" style={{ color: "#487b78" }} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold" style={{ color: "#3b6663" }}>
                                                Suhu
                                            </div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                {isYearly
                                                    ? `Rp 44.750/bln · ditagih Rp ${(44750 * 12).toLocaleString("id-ID")}/thn`
                                                    : "Rp 89.500 / bulan"}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="flex items-center gap-1 text-[11px] font-medium transition-all group-hover:gap-1.5"
                                        style={{ color: "#487b78" }}
                                    >
                                        Upgrade
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </div>
                                </button>
                            )}

                            {/* Bandar plan */}
                            <button
                                onClick={() =>
                                    setUpgradePlan({
                                        type: "bandar",
                                        name: "Bandar",
                                        amount: isYearly ? 94500 * 12 : 189000,
                                        interval: isYearly ? "yearly" : "monthly",
                                    })
                                }
                                className="w-full flex items-center justify-between p-3.5 rounded-lg border transition-all duration-150 hover:shadow-sm group text-left"
                                style={{
                                    borderColor: "rgba(212,175,55,0.3)",
                                    background: "rgba(212,175,55,0.04)",
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: "rgba(212,175,55,0.15)" }}
                                    >
                                        <Crown className="w-4 h-4" style={{ color: "#c9a227" }} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold" style={{ color: "#a08020" }}>
                                            Bandar
                                        </div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5">
                                            {isYearly
                                                ? `Rp 94.500/bln · ditagih Rp ${(94500 * 12).toLocaleString("id-ID")}/thn`
                                                : "Rp 189.000 / bulan"}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-1 text-[11px] font-medium transition-all group-hover:gap-1.5"
                                    style={{ color: "#c9a227" }}
                                >
                                    Upgrade
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Cancel — subtle, at the bottom */}
                {!isFree && isActive && (
                    <div className="flex justify-center pt-1 pb-2">
                        <button
                            onClick={() => setShowCancelDialog(true)}
                            className="text-xs text-muted-foreground/70 hover:text-destructive transition-colors hover:underline underline-offset-2"
                        >
                            Batalkan langganan
                        </button>
                    </div>
                )}
            </div>

            {/* Cancel confirmation overlay */}
            {showCancelDialog && (
                <div className="absolute inset-0 z-[200] bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-5">
                    <div className="bg-card border rounded-xl shadow-2xl max-w-sm w-full p-5 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                                <ShieldAlert className="w-4 h-4 text-destructive" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Batalkan Langganan?</h3>
                                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                    Anda tetap dapat menikmati paket{" "}
                                    <span className="font-semibold uppercase text-foreground">{tier}</span>{" "}
                                    hingga{" "}
                                    <span className="font-medium text-foreground">{formatDate(nextDue)}</span>.
                                    Setelah itu akun akan kembali ke paket RITEL.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs h-8"
                                onClick={() => setShowCancelDialog(false)}
                                disabled={isCanceling}
                            >
                                Kembali
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1 text-xs h-8"
                                onClick={handleCancel}
                                disabled={isCanceling}
                            >
                                {isCanceling && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
                                Ya, Batalkan
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment method dialog for upgrade */}
            {upgradePlan && (
                <PaymentMethodDialog
                    isOpen={!!upgradePlan}
                    onClose={() => setUpgradePlan(null)}
                    planType={upgradePlan.type}
                    planName={upgradePlan.name}
                    billingInterval={upgradePlan.interval}
                    amount={upgradePlan.amount}
                    onPaymentSuccess={() => window.location.reload()}
                />
            )}
        </div>
    );
}
