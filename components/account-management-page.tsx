"use client";

import { useEffect, useState } from "react";
import {
    Loader2,
    AlertCircle,
    Zap,
    Heart,
    BookMarked,
    Calendar,
    ShieldCheck,
    ShieldAlert,
    ArrowUpRight,
    CreditCard,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PaymentMethodDialog } from "@/components/payment-method-dialog";
import Link from "next/link";

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

const TIER_CONFIG = {
    suhu: {
        label: "Suhu",
        color: "#487b78",
        bg: "#eff4f4",
        text: "#3b6663",
        border: "rgba(72, 123, 120, 0.2)",
        gradient: "linear-gradient(135deg, #eff4f4 0%, #f5f8f8 100%)",
        iconBg: "rgba(72, 123, 120, 0.12)",
    },
    bandar: {
        label: "Bandar",
        color: "#d4af37",
        bg: "#fdf8ea",
        text: "#b08d24",
        border: "rgba(212, 175, 55, 0.2)",
        gradient: "linear-gradient(135deg, #fdf8ea 0%, #fefcf5 100%)",
        iconBg: "rgba(212, 175, 55, 0.12)",
    },
    ritel: {
        label: "Ritel",
        color: "#71717a",
        bg: "#f4f4f5",
        text: "#52525b",
        border: "rgba(113, 113, 122, 0.15)",
        gradient: "linear-gradient(135deg, #f4f4f5 0%, #fafafa 100%)",
        iconBg: "rgba(113, 113, 122, 0.10)",
    },
} as const;

type TierKey = keyof typeof TIER_CONFIG;

function UsageBar({ value, max, color }: { value: number; max: number; color: string }) {
    const isUnlimited = max === -1;
    const pct = isUnlimited ? 100 : Math.min((value / max) * 100, 100);
    const isAtLimit = !isUnlimited && value >= max;

    return (
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.06)" }}>
            <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                    width: `${pct}%`,
                    backgroundColor: isAtLimit ? "#ef4444" : color,
                    opacity: isUnlimited ? 0.5 : 1,
                }}
            />
        </div>
    );
}

function UsageRow({
    icon: Icon,
    label,
    value,
    max,
    color,
    sublabel,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    max: number;
    color: string;
    sublabel?: string;
}) {
    const isUnlimited = max === -1;
    const displayValue = isUnlimited ? "∞" : `${value} / ${max}`;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}18` }}
                    >
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        {sublabel && (
                            <span className="text-[10px] text-muted-foreground ml-2">{sublabel}</span>
                        )}
                    </div>
                </div>
                <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                    {displayValue}
                </span>
            </div>
            {!isUnlimited && <UsageBar value={value} max={max} color={color} />}
        </div>
    );
}

export function AccountManagementPage() {
    const [data, setData] = useState<SubscriptionManagementData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCanceling, setIsCanceling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const [isYearly, setIsYearly] = useState(false);
    const [upgradePlan, setUpgradePlan] = useState<{
        type: "suhu" | "bandar";
        name: string;
        amount: number;
        interval: "monthly" | "yearly";
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
                setData((prev) => (prev ? { ...prev, subscriptionStatus: "canceled" } : prev));
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
            <div className="flex items-center justify-center p-12 h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-full gap-3 text-center">
                <AlertCircle className="h-8 w-8 text-destructive/70" />
                <p className="text-sm text-muted-foreground">{error || "Data tidak ditemukan."}</p>
            </div>
        );
    }

    const { tier, subscriptionStatus, nextDue, lastPaymentDate, paymentMethod, limits, usage } = data;
    const tierKey = (tier in TIER_CONFIG ? tier : "ritel") as TierKey;
    const tc = TIER_CONFIG[tierKey];
    const isFree = tierKey === "ritel";
    const isActive = subscriptionStatus === "active";

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return format(new Date(dateStr), "dd MMMM yyyy", { locale: id });
    };

    const progressColor = "#d07225";

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-7">

                {/* ── Header ── */}
                <div>
                    <h1
                        className="text-xl font-bold text-foreground"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                        Subscriptions
                    </h1>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                        Kelola paket, pembayaran, dan kuota penggunaan Anda.
                    </p>
                </div>

                {/* ── Active Plan Card ── */}
                <div
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: tc.border }}
                >
                    {/* gradient header */}
                    <div
                        className="px-5 py-4 flex items-center justify-between"
                        style={{ background: tc.gradient, borderBottom: `1px solid ${tc.border}` }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: tc.iconBg }}
                            >
                                <ShieldCheck className="w-4 h-4" style={{ color: tc.color }} />
                            </div>
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: tc.text }}>
                                    Paket Aktif
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span
                                        className="text-base font-bold uppercase tracking-wide"
                                        style={{ fontFamily: "'IBM Plex Mono', monospace", color: tc.color }}
                                    >
                                        {tier}
                                    </span>
                                    {!isFree && (
                                        <span
                                            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)",
                                                color: isActive ? "#16a34a" : "#dc2626",
                                            }}
                                        >
                                            {isActive ? (
                                                <CheckCircle2 className="w-3 h-3" />
                                            ) : (
                                                <XCircle className="w-3 h-3" />
                                            )}
                                            {isActive ? "Aktif" : "Dibatalkan"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isFree && (
                            <Link href="/harga">
                                <Button
                                    size="sm"
                                    className="text-white hover:opacity-90 transition-all text-xs font-medium group"
                                    style={{ backgroundColor: "#d07225" }}
                                >
                                    Upgrade
                                    <ArrowUpRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* subscription details */}
                    {!isFree && (
                        <div className="px-5 py-4 grid grid-cols-2 gap-4 bg-card/30">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Berlaku sampai
                                </div>
                                <p className="text-sm font-medium text-foreground">{formatDate(nextDue)}</p>
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Pembayaran terakhir
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-foreground">{formatDate(lastPaymentDate)}</p>
                                    {paymentMethod && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded uppercase font-semibold text-muted-foreground tracking-wider">
                                            {paymentMethod.replace(/_/g, " ")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Quota Usage ── */}
                <div>
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                        Penggunaan Kuota
                    </h2>
                    <div className="rounded-xl border border-border bg-card/40 divide-y divide-border">
                        <div className="px-5 py-4">
                            <UsageRow
                                icon={Zap}
                                label="Backtest Harian"
                                value={usage.backtest}
                                max={limits.backtest}
                                color={progressColor}
                                sublabel="reset setiap hari"
                            />
                        </div>
                        <div className="px-5 py-4">
                            <UsageRow
                                icon={Heart}
                                label="Langganan Strategi"
                                value={usage.subscriptions}
                                max={limits.subscriptions}
                                color={progressColor}
                            />
                        </div>
                        <div className="px-5 py-4">
                            <UsageRow
                                icon={BookMarked}
                                label="Strategi Disimpan"
                                value={usage.savedStrategies}
                                max={limits.savedStrategies}
                                color={progressColor}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Upgrade / Actions ── */}
                {(tier === "ritel" || tier === "suhu") && (
                    <div>
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                            Upgrade Paket
                        </h2>
                        <div className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
                            {/* Billing toggle */}
                            <div className="flex items-center gap-3">
                                <span className="text-[13px] text-muted-foreground">Opsi tagihan:</span>
                                <div className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-muted-foreground border border-slate-200/60">
                                    <button
                                        onClick={() => setIsYearly(false)}
                                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-xs font-mono font-semibold transition-all ${!isYearly
                                            ? "bg-slate-600 text-white shadow-sm"
                                            : "hover:text-foreground"
                                            }`}
                                    >
                                        Bulanan
                                    </button>
                                    <button
                                        onClick={() => setIsYearly(true)}
                                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${isYearly
                                            ? "bg-slate-600 text-white shadow-sm"
                                            : "hover:text-foreground"
                                            }`}
                                    >
                                        Tahunan
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm transition-colors ${isYearly ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                                            }`}>
                                            −50%
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Plan buttons */}
                            <div className="flex flex-col sm:flex-row gap-2.5">
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
                                        className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg border transition-all group"
                                        style={{
                                            borderColor: "rgba(72,123,120,0.3)",
                                            backgroundColor: "rgba(72,123,120,0.04)",
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-5 h-5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: TIER_CONFIG.suhu.color }}
                                            />
                                            <div className="text-left">
                                                <span
                                                    className="text-sm font-semibold block"
                                                    style={{ color: TIER_CONFIG.suhu.color }}
                                                >
                                                    Upgrade ke Suhu
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Rp {(isYearly ? 44750 : 89500).toLocaleString("id-ID")}/bln
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowUpRight
                                            className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                            style={{ color: TIER_CONFIG.suhu.color }}
                                        />
                                    </button>
                                )}
                                <button
                                    onClick={() =>
                                        setUpgradePlan({
                                            type: "bandar",
                                            name: "Bandar",
                                            amount: isYearly ? 94500 * 12 : 189000,
                                            interval: isYearly ? "yearly" : "monthly",
                                        })
                                    }
                                    className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg border transition-all group"
                                    style={{
                                        borderColor: "rgba(212,175,55,0.3)",
                                        backgroundColor: "rgba(212,175,55,0.04)",
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-5 h-5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: TIER_CONFIG.bandar.color }}
                                        />
                                        <div className="text-left">
                                            <span
                                                className="text-sm font-semibold block"
                                                style={{ color: TIER_CONFIG.bandar.color }}
                                            >
                                                Upgrade ke Bandar
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                Rp {(isYearly ? 94500 : 189000).toLocaleString("id-ID")}/bln
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowUpRight
                                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        style={{ color: TIER_CONFIG.bandar.color }}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Danger Zone ── */}
                {!isFree && isActive && (
                    <div>
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                            Kelola Langganan
                        </h2>
                        <div className="rounded-xl border border-border bg-card/40 px-5 py-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-foreground">Batalkan Langganan</p>
                                <p className="text-[12px] text-muted-foreground mt-0.5">
                                    Akses tetap aktif hingga {formatDate(nextDue)}.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCancelDialog(true)}
                                className="flex-shrink-0 text-[13px] font-medium text-red-500 hover:text-red-600 hover:underline underline-offset-2 transition-colors"
                            >
                                Batalkan
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Spacer ── */}
                <div className="h-2" />
            </div>

            {/* ── Cancel Confirmation Dialog ── */}
            {showCancelDialog && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
                    >
                        <div className="p-6 space-y-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-foreground">Batalkan Langganan?</h3>
                                <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
                                    Anda masih dapat menikmati fitur paket{" "}
                                    <span className="font-semibold text-foreground uppercase">{tier}</span> hingga{" "}
                                    <span className="font-semibold text-foreground">{formatDate(nextDue)}</span>, setelah itu akun Anda akan kembali ke paket{" "}
                                    <span className="font-medium uppercase">Ritel</span>.
                                </p>
                            </div>
                        </div>
                        <div className="px-6 pb-5 flex gap-2.5">
                            <Button
                                variant="outline"
                                className="flex-1 font-medium"
                                onClick={() => setShowCancelDialog(false)}
                                disabled={isCanceling}
                            >
                                Kembali
                            </Button>
                            <Button
                                className="flex-1 font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                                onClick={handleCancel}
                                disabled={isCanceling}
                            >
                                {isCanceling && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Ya, Batalkan
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Upgrade Payment Dialog ── */}
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
