"use client"

import { useState, useEffect } from "react"
import { CreditCard, Smartphone, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

// Declare Midtrans Snap type
declare global {
    interface Window {
        snap?: {
            pay: (token: string, options: {
                onSuccess?: (result: unknown) => void
                onPending?: (result: unknown) => void
                onError?: (result: unknown) => void
                onClose?: () => void
            }) => void
        }
    }
}

interface PaymentMethodDialogProps {
    isOpen: boolean
    onClose: () => void
    planType: 'suhu' | 'bandar'
    planName: string
    billingInterval: 'monthly' | 'yearly'
    amount: number
    onPaymentSuccess?: () => void
}

type PaymentStep = 'select' | 'gopay-phone' | 'gopay-linking' | 'processing'

export function PaymentMethodDialog({
    isOpen,
    onClose,
    planType,
    planName,
    billingInterval,
    amount,
    onPaymentSuccess,
}: PaymentMethodDialogProps) {
    const [step, setStep] = useState<PaymentStep>('select')
    const [isLoading, setIsLoading] = useState(false)

    // Reset state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setStep('select')
            setIsLoading(false)
        }
    }, [isOpen])

    // Format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    // Handle Credit Card payment
    const handleCreditCardPayment = async () => {
        setIsLoading(true)
        setStep('processing')

        try {
            const response = await fetch("/api/subscriptions/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planType,
                    billingInterval,
                    paymentMethod: 'credit_card',
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Gagal membuat langganan")
            }

            // Check if Snap is loaded
            if (!window.snap) {
                window.location.href = data.data.redirectUrl
                return
            }

            // Close the dialog before opening Midtrans Snap to prevent double overlay
            onClose()

            // Open Midtrans Snap payment popup
            window.snap.pay(data.data.token, {
                onSuccess: () => {
                    toast.success("Pembayaran berhasil! Selamat menikmati paket " + planName)
                    onPaymentSuccess?.()
                },
                onPending: () => {
                    toast.info("Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda.")
                },
                onError: () => {
                    toast.error("Pembayaran gagal. Silakan coba lagi.")
                },
                onClose: () => {
                    toast.info("Pembayaran dibatalkan")
                },
            })
        } catch (error) {
            console.error("Payment error:", error)
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
            setStep('select')
        } finally {
            setIsLoading(false)
        }
    }

    // Handle GoPay payment
    const handleGopayPayment = async () => {
        setIsLoading(true)
        setStep('processing')

        try {
            const response = await fetch("/api/subscriptions/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planType,
                    billingInterval,
                    paymentMethod: 'gopay',
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Gagal membuat langganan")
            }

            // Check if Snap is loaded
            if (!window.snap) {
                window.location.href = data.data.redirectUrl
                return
            }

            // Close the dialog before opening Midtrans Snap to prevent double overlay
            onClose()

            // Open Midtrans Snap payment popup
            window.snap.pay(data.data.token, {
                onSuccess: () => {
                    toast.success("Pembayaran berhasil! Selamat menikmati paket " + planName)
                    onPaymentSuccess?.()
                },
                onPending: () => {
                    toast.info("Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda.")
                },
                onError: () => {
                    toast.error("Pembayaran gagal. Silakan coba lagi.")
                },
                onClose: () => {
                    toast.info("Pembayaran dibatalkan")
                },
            })
        } catch (error) {
            console.error("Payment error:", error)
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
            setStep('select')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {step === 'select' && 'Pilih Metode Pembayaran'}
                        {step === 'gopay-phone' && 'Hubungkan GoPay'}
                        {step === 'gopay-linking' && 'Konfirmasi di GoPay'}
                        {step === 'processing' && 'Memproses Pembayaran'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'select' && (
                            <>
                                <span className="font-semibold text-foreground">{planName}</span> - {formatPrice(amount)}
                                <span className="text-muted-foreground">/{billingInterval === 'monthly' ? 'bulan' : 'tahun'}</span>
                            </>
                        )}
                        {step === 'gopay-phone' && 'Masukkan nomor telepon yang terdaftar di GoPay'}
                        {step === 'gopay-linking' && 'Selesaikan proses di aplikasi GoPay, lalu klik Konfirmasi'}
                        {step === 'processing' && 'Mohon tunggu sebentar...'}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    {/* Step: Select Payment Method */}
                    {step === 'select' && (
                        <div className="space-y-3">
                            {/* Virtual Account */}
                            <button
                                onClick={handleCreditCardPayment}
                                disabled={isLoading}
                                className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                            >
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold">Virtual Account</div>
                                    <div className="text-sm text-muted-foreground">Mandiri, BNI, BRI, Permata, CIMB Niaga</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>

                            {/* GoPay */}
                            <button
                                onClick={handleGopayPayment}
                                disabled={isLoading}
                                className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-green-500 hover:bg-green-50 transition-all group cursor-pointer"
                            >
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:bg-green-200">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-green-700">GoPay</div>
                                    <div className="text-sm text-muted-foreground">Pembayaran QR / Deeplink</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                            </button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                🔒 Pembayaran diproses dengan aman oleh Midtrans
                            </p>
                        </div>
                    )}

                    {/* Step: Processing */}
                    {step === 'processing' && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-muted-foreground">Memproses pembayaran Anda...</p>
                        </div>
                    )}
                </div>


            </DialogContent>
        </Dialog>
    )
}
