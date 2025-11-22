"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret")
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    if (!paymentIntentClientSecret) {
      router.push("/dashboard")
      return
    }

    // In a real app, you might want to verify the payment status with Stripe here
    // or wait for a webhook to update the database.
    // For now, we'll assume success if we have the client secret and show the success message.
    setStatus("success")
  }, [paymentIntentClientSecret, router])

  if (status === "loading") {
    return <div className="container mx-auto p-6 text-center">処理中...</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">支払い完了</CardTitle>
          <CardDescription>
            サブスクリプションの登録が完了しました。
            <br />
            これからCarSubでのカーライフをお楽しみください！
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/dashboard">
            <Button>ダッシュボードへ</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
