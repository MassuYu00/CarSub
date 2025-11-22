"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { CheckoutForm } from "@/components/checkout-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"

// Replace with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SubscriptionCheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get("planId")
  const [clientSecret, setClientSecret] = useState("")
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!planId) {
      router.push("/subscription")
      return
    }

    const fetchPlanAndCreateIntent = async () => {
      try {
        // Fetch plan details
        const { data: planData, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", planId)
          .single()

        if (error || !planData) {
          throw new Error("Plan not found")
        }

        setPlan(planData)

        // Create PaymentIntent via Subscription
        const response = await fetch("/api/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId: planData.stripe_price_id }),
        })

        if (!response.ok) {
          throw new Error("Failed to create subscription")
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (error) {
        console.error("Error:", error)
        alert("エラーが発生しました。もう一度お試しください。")
        router.push("/subscription")
      } finally {
        setLoading(false)
      }
    }

    fetchPlanAndCreateIntent()
  }, [planId, router, supabase])

  if (loading) {
    return <div className="container mx-auto p-6 text-center">読み込み中...</div>
  }

  if (!clientSecret || !plan) {
    return <div className="container mx-auto p-6 text-center">エラーが発生しました</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>お支払い</CardTitle>
          <CardDescription>
            {plan.name}プランのサブスクリプションを開始します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
            <span className="font-medium">月額料金</span>
            <span className="text-xl font-bold">¥{plan.monthly_price.toLocaleString()}</span>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}
