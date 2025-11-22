import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CancelSubscriptionButton } from "@/components/cancel-subscription-button"
import { Check, Crown, Star, Zap } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function SubscriptionPage() {
  const supabase = await createClient()

  // ユーザー認証確認
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // サブスクリプションプランを取得
  const { data: plans, error: plansError } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("monthly_price", { ascending: true })

  // ユーザーの現在のサブスクリプションを取得
  const { data: currentSubscription, error: subscriptionError } = await supabase
    .from("user_subscriptions")
    .select(
      `
      *,
      subscription_plans (
        name,
        description,
        monthly_price,
        max_rentals_per_month,
        max_rental_days,
        features
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (plansError) {
    console.error("Error fetching plans:", plansError)
  }

  if (subscriptionError && subscriptionError.code !== "PGRST116") {
    console.error("Error fetching subscription:", subscriptionError)
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "ベーシック":
        return <Zap className="h-6 w-6" />
      case "スタンダード":
        return <Star className="h-6 w-6" />
      case "プレミアム":
        return <Crown className="h-6 w-6" />
      default:
        return <Check className="h-6 w-6" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "ベーシック":
        return "border-blue-200 bg-blue-50"
      case "スタンダード":
        return "border-green-200 bg-green-50"
      case "プレミアム":
        return "border-purple-200 bg-purple-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">サブスクリプション</h1>
            <p className="text-muted-foreground">あなたに最適なプランを選択してください</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">ダッシュボードに戻る</Button>
          </Link>
        </div>

        {/* 現在のサブスクリプション */}
        {currentSubscription && (
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPlanIcon(currentSubscription.subscription_plans.name)}
                  <CardTitle>現在のプラン: {currentSubscription.subscription_plans.name}</CardTitle>
                </div>
                <Badge variant="default">アクティブ</Badge>
              </div>
              <CardDescription>{currentSubscription.subscription_plans.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">月額料金</p>
                  <p className="text-2xl font-bold">
                    ¥{currentSubscription.subscription_plans.monthly_price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">月間利用回数</p>
                  <p className="text-lg font-semibold">
                    {currentSubscription.subscription_plans.max_rentals_per_month}回まで
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">プラン特典</p>
                <div className="flex flex-wrap gap-2">
                  {currentSubscription.subscription_plans.features?.map((feature: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Link href={`/subscription/checkout?plan=${currentSubscription.plan_id}`}>
                  <Button variant="outline" size="sm">
                    プラン変更
                  </Button>
                </Link>
                <CancelSubscriptionButton />
              </div>
            </CardContent>
          </Card>
        )}

        {/* プラン一覧 */}
        <div>
          <h2 className="text-2xl font-bold mb-6">利用可能なプラン</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {plans?.map((plan) => {
              const isCurrentPlan = currentSubscription?.plan_id === plan.id
              const isRecommended = plan.name === "スタンダード"

              return (
                <Card
                  key={plan.id}
                  className={`relative ${getPlanColor(plan.name)} ${isRecommended ? "border-primary shadow-lg" : ""}`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">おすすめ</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">{getPlanIcon(plan.name)}</div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">¥{plan.monthly_price.toLocaleString()}</span>
                      <span className="text-muted-foreground">/月</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* プラン詳細 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm">月{plan.max_rentals_per_month}回まで利用</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm">最大{plan.max_rental_days}日間レンタル</span>
                        </div>
                      </div>

                      {/* 特徴 */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-2">
                          {plan.features.map((feature: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* アクションボタン */}
                      <div className="pt-4">
                        {isCurrentPlan ? (
                          <Button className="w-full" disabled>
                            現在のプラン
                          </Button>
                        ) : (
                          <Link href={`/subscription/checkout?plan=${plan.id}`}>
                            <Button className="w-full" variant={isRecommended ? "default" : "outline"}>
                              {currentSubscription ? "プラン変更" : "このプランを選択"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* サブスクリプションがない場合のメッセージ */}
        {!currentSubscription && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">サブスクリプションプランを選択してください</h3>
                <p className="text-muted-foreground">
                  CarSubscを利用するには、サブスクリプションプランへの加入が必要です。上記からお好みのプランをお選びください。
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
