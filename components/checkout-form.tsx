"use client"

import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function CheckoutForm() {
    const stripe = useStripe()
    const elements = useElements()

    const [message, setMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsLoading(true)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/subscription/success`,
            },
        })

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "エラーが発生しました")
        } else {
            setMessage("予期せぬエラーが発生しました")
        }

        setIsLoading(false)
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" />

            {message && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>エラー</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            <Button disabled={isLoading || !stripe || !elements} className="w-full" size="lg">
                {isLoading ? "処理中..." : "支払いを確定する"}
            </Button>
        </form>
    )
}
