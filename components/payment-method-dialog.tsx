"use client"

import { useState, useEffect } from "react"
import { CreditCard, Smartphone, X, Loader2, ExternalLink, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    const [phoneNumber, setPhoneNumber] = useState('')
    const [gopayAccountId, setGopayAccountId] = useState<string | null>(null)
    const [gopayActivationUrl, setGopayActivationUrl] = useState<string | null>(null)

    // Reset state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setStep('select')
            setPhoneNumber('')
            setGopayAccountId(null)
            setGopayActivationUrl(null)
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

            // Open Midtrans Snap payment popup
            window.snap.pay(data.data.token, {
                onSuccess: () => {
                    toast.success("Pembayaran berhasil! Selamat menikmati paket " + planName)
                    onClose()
                    onPaymentSuccess?.()
                },
                onPending: () => {
                    toast.info("Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda.")
                    onClose()
                },
                onError: () => {
                    toast.error("Pembayaran gagal. Silakan coba lagi.")
                    setStep('select')
                },
                onClose: () => {
                    toast.info("Pembayaran dibatalkan")
                    setStep('select')
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

    // Handle GoPay - Step 1: Enter phone number
    const handleGopayStart = () => {
        setStep('gopay-phone')
    }

    // Handle GoPay - Step 2: Link account
    const handleGopayLink = async () => {
        if (!phoneNumber) {
            toast.error("Silakan masukkan nomor telepon GoPay Anda")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/subscriptions/gopay/link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Gagal menghubungkan GoPay")
            }

            setGopayAccountId(data.data.accountId)
            setGopayActivationUrl(data.data.activationUrl)
            setStep('gopay-linking')

            // Open GoPay app/website in new tab
            window.open(data.data.activationUrl, '_blank')

        } catch (error) {
            console.error("GoPay linking error:", error)
            toast.error(error instanceof Error ? error.message : "Gagal menghubungkan GoPay")
        } finally {
            setIsLoading(false)
        }
    }

    // Handle GoPay - Step 3: Check linking status and create subscription
    const handleGopayComplete = async () => {
        if (!gopayAccountId) {
            toast.error("Data akun GoPay tidak ditemukan")
            return
        }

        setIsLoading(true)
        setStep('processing')

        try {
            // Check if GoPay account is linked
            const statusResponse = await fetch(`/api/subscriptions/gopay/status?accountId=${gopayAccountId}`)
            const statusData = await statusResponse.json()

            if (!statusResponse.ok || statusData.data.status !== 'ENABLED') {
                toast.error("Akun GoPay belum terhubung. Silakan selesaikan proses di aplikasi GoPay.")
                setStep('gopay-linking')
                return
            }

            // Get the payment token
            const gopayToken = statusData.data.paymentOptions?.[0]?.token
            if (!gopayToken) {
                throw new Error("Token pembayaran tidak ditemukan")
            }

            // Create subscription with GoPay
            const response = await fetch("/api/subscriptions/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planType,
                    billingInterval,
                    paymentMethod: 'gopay',
                    gopayAccountId,
                    gopayToken,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Gagal membuat langganan")
            }

            toast.success(`Berhasil! Langganan ${planName} berhasil dibuat dengan GoPay.`)
            onClose()
            onPaymentSuccess?.()

        } catch (error) {
            console.error("GoPay subscription error:", error)
            toast.error(error instanceof Error ? error.message : "Gagal membuat langganan")
            setStep('gopay-linking')
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
                            {/* Credit Card */}
                            <button
                                onClick={handleCreditCardPayment}
                                disabled={isLoading}
                                className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                            >
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold">Kartu Kredit/Debit</div>
                                    <div className="text-sm text-muted-foreground">Visa, Mastercard, JCB</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>

                            {/* GoPay */}
                            <button
                                onClick={handleGopayStart}
                                disabled={isLoading}
                                className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-green-500 hover:bg-green-50 transition-all group"
                            >
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:bg-green-200">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-green-700">GoPay</div>
                                    <div className="text-sm text-muted-foreground">Pembayaran otomatis bulanan</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                            </button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                🔒 Pembayaran diproses dengan aman oleh Midtrans
                            </p>
                        </div>
                    )}

                    {/* Step: Enter GoPay Phone */}
                    {step === 'gopay-phone' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon GoPay</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="08xxxxxxxxxx"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="text-lg"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Nomor ini akan digunakan untuk menghubungkan akun GoPay Anda
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep('select')}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Kembali
                                </Button>
                                <Button
                                    onClick={handleGopayLink}
                                    disabled={isLoading || !phoneNumber}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        'Lanjutkan'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step: GoPay Linking */}
                    {step === 'gopay-linking' && (
                        <div className="space-y-4">
                            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                                <Smartphone className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                <p className="text-sm text-green-800 mb-2">
                                    Buka aplikasi GoPay dan selesaikan proses verifikasi
                                </p>
                                <p className="text-xs text-green-600">
                                    Setelah selesai, klik tombol &quot;Saya Sudah Konfirmasi&quot; di bawah
                                </p>
                            </div>

                            {gopayActivationUrl && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(gopayActivationUrl, '_blank')}
                                    className="w-full"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Buka Link Aktivasi Lagi
                                </Button>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep('select')}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleGopayComplete}
                                    disabled={isLoading}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memeriksa...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Saya Sudah Konfirmasi
                                        </>
                                    )}
                                </Button>
                            </div>
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
