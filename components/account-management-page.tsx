"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Zap, Heart, BookMarked, Wallet, Calendar, ShieldCheck, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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

    // Upgrade state
    const [isYearly, setIsYearly] = useState(false);
    const [upgradePlan, setUpgradePlan] = useState<{
        type: 'suhu' | 'bandar',
        name: string,
        amount: number,
        interval: 'monthly' | 'yearly'
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
            } catch (err) {
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
        } catch (err) {
            alert("Terjadi kesalahan.");
        } finally {
            setIsCanceling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full gap-4 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <div className="text-lg font-medium">{error || "Data tidak ditemukan."}</div>
            </div>
        );
    }

    const { tier, subscriptionStatus, nextDue, lastPaymentDate, paymentMethod, limits, usage } = data;
    const isFree = tier === "ritel";
    const isActive = subscriptionStatus === "active";

    const getTierColor = () => {
        if (tier === "suhu") return "#487b78";
        if (tier === "bandar") return "#d4af37";
        return "#71717a"; // ritel
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return format(new Date(dateStr), "dd MMMM yyyy", { locale: id });
    };

    const getProgressColor = () => getTierColor();

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8 h-full overflow-y-auto">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold font-ibm-plex-mono text-foreground">Subscriptions</h1>
                <p className="text-sm text-muted-foreground">Kelola detail paket, pembayaran, dan lihat kuota penggunaan Anda.</p>
            </div>

            {/* Plan Details */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Detail Paket</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-card/50 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <ShieldCheck className="w-4 h-4" /> Paket Saat Ini
                        </div>
                        <div className="flex items-center gap-3">
                            <div
                                className="px-3 py-1 text-sm font-semibold text-white rounded-[3px] font-ibm-plex-mono uppercase"
                                style={{ backgroundColor: getTierColor() }}
                            >
                                {tier}
                            </div>
                            {!isFree && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {isActive ? 'Aktif' : 'Dibatalkan'}
                                </span>
                            )}
                        </div>
                    </div>

                    {!isFree && (
                        <div className="p-4 rounded-xl border bg-card/50 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Calendar className="w-4 h-4" /> Berlaku Sampai
                            </div>
                            <div className="text-sm font-medium">
                                {formatDate(nextDue)}
                            </div>
                        </div>
                    )}

                    {!isFree && (
                        <div className="p-4 rounded-xl border bg-card/50 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Wallet className="w-4 h-4" /> Pembayaran Terakhir
                            </div>
                            <div className="text-sm font-medium flex justify-between items-center">
                                <span>{formatDate(lastPaymentDate)}</span>
                                <span className="text-[10px] px-2 py-1 bg-muted rounded-md uppercase font-semibold text-muted-foreground">{paymentMethod?.replace(/_/g, " ") || "-"}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t mt-6 space-y-4">
                    {(tier === "ritel" || tier === "suhu") && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">Opsi Tagihan:</span>
                            <div className="inline-flex items-center gap-1 p-1 rounded-full border bg-slate-50 border-slate-200">
                                <button
                                    onClick={() => setIsYearly(false)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!isYearly ? "bg-slate-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
                                >
                                    Bulanan
                                </button>
                                <button
                                    onClick={() => setIsYearly(true)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${isYearly ? "bg-[#d07225] text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
                                >
                                    Tahunan <span className={`text-[10px] px-1.5 rounded-full ${isYearly ? "bg-white/20 text-white" : "bg-[#d07225]/10 text-[#d07225]"}`}>-50%</span>
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                        {tier === "ritel" && (
                            <Button
                                onClick={() => setUpgradePlan({ type: 'suhu', name: 'Suhu', amount: isYearly ? 44750 * 12 : 89500, interval: isYearly ? 'yearly' : 'monthly' })}
                                style={{ backgroundColor: "#487b78" }}
                                className="hover:opacity-90 text-white font-medium"
                            >
                                Upgrade ke Suhu
                            </Button>
                        )}
                        {(tier === "ritel" || tier === "suhu") && (
                            <Button
                                onClick={() => setUpgradePlan({ type: 'bandar', name: 'Bandar', amount: isYearly ? 94500 * 12 : 189000, interval: isYearly ? 'yearly' : 'monthly' })}
                                style={{ backgroundColor: "#d4af37", color: "white" }}
                                className="hover:opacity-90 font-medium"
                            >
                                Upgrade ke Bandar
                            </Button>
                        )}

                        {!isFree && isActive && (
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors ml-auto"
                                onClick={() => setShowCancelDialog(true)}
                            >
                                Batalkan Langganan
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quota Usage */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Penggunaan Kuota</h2>

                <div className="space-y-5 p-5 rounded-xl border bg-card/50">
                    {/* Backtest */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Jumlah Backtest Harian</span>
                            </div>
                            <span className="text-sm font-semibold font-mono">
                                {limits.backtest === -1 ? '∞' : `${usage.backtest} / ${limits.backtest}`}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: limits.backtest === -1 ? '100%' : `${Math.min((usage.backtest / limits.backtest) * 100, 100)}%`,
                                    backgroundColor: getProgressColor(),
                                }}
                            />
                        </div>
                    </div>

                    {/* Subscriptions */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Jumlah Langganan Strategi</span>
                            </div>
                            <span className="text-sm font-semibold font-mono">
                                {limits.subscriptions === -1 ? '∞' : `${usage.subscriptions} / ${limits.subscriptions}`}
                            </span>
                        </div>
                        {limits.subscriptions !== -1 && (
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${Math.min((usage.subscriptions / limits.subscriptions) * 100, 100)}%`,
                                        backgroundColor: getProgressColor(),
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Saved Strategies */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <BookMarked className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Jumlah Strategi Disimpan</span>
                            </div>
                            <span className="text-sm font-semibold font-mono">
                                {limits.savedStrategies === -1 ? '∞' : `${usage.savedStrategies} / ${limits.savedStrategies}`}
                            </span>
                        </div>
                        {limits.savedStrategies !== -1 && (
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${Math.min((usage.savedStrategies / limits.savedStrategies) * 100, 100)}%`,
                                        backgroundColor: getProgressColor(),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* In-page Cancel Confirmation Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 relative">
                        <div className="flex items-center gap-3 text-destructive">
                            <ShieldAlert className="w-6 h-6" />
                            <h3 className="text-xl font-semibold">Batalkan Langganan?</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Apakah Anda yakin ingin membatalkan langganan ini? Anda akan tetap dapat menikmati fitur paket <span className="font-semibold uppercase">{tier}</span> hingga tanggal <strong className="font-medium text-foreground">{formatDate(nextDue)}</strong>, setelah itu akun Anda akan kembali ke paket RITEL.
                        </p>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isCanceling}>
                                Kembali
                            </Button>
                            <Button variant="destructive" onClick={handleCancel} disabled={isCanceling}>
                                {isCanceling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Ya, Batalkan
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Method Dialog for Upgrade */}
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
