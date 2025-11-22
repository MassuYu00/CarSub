import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/logout-button"
import { checkAdminAccess } from "@/lib/admin-auth"
import Link from "next/link"
import { Settings, ShieldCheck, ShieldAlert, Calendar, MapPin, Clock } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // 管理者権限をチェック
  const { isAdmin } = await checkAdminAccess()

  // 管理者の場合でもユーザー画面を表示できるようにする（リダイレクトしない）

  // ユーザープロファイルを取得
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // ユーザーの現在のサブスクリプションを取得
  const { data: currentSubscription } = await supabase
    .from("user_subscriptions")
    .select(
      `
      *,
      subscription_plans (
        name,
        monthly_price
      )
    `,
    )
    .eq("user_id", data.user.id)
    .eq("status", "active")
    .single()

  // 次回の予約を取得
  const { data: nextReservation } = await supabase
    .from("reservations")
    .select(`
      *,
      vehicles (
        make,
        model,
        image_url,
        images
      )
    `)
    .eq("user_id", data.user.id)
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(1)
    .single()

  const getKYCStatusInfo = (status: string) => {
    switch (status) {
      case "verified":
        return { label: "本人確認済み", color: "bg-green-50 text-green-700 border-green-200", icon: ShieldCheck }
      case "pending":
        return { label: "審査中", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock }
      case "rejected":
        return { label: "確認失敗", color: "bg-red-50 text-red-700 border-red-200", icon: ShieldAlert }
      default:
        return { label: "未提出", color: "bg-gray-50 text-gray-700 border-gray-200", icon: ShieldAlert }
    }
  }

  const kycInfo = getKYCStatusInfo(profile?.verification_status || "unsubmitted")
  const KycIcon = kycInfo.icon

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ダッシュボード</h1>
            <p className="text-muted-foreground">ようこそ、{profile?.full_name ? decodeURIComponent(atob(profile.full_name)) : data.user.email}さん</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  管理者画面
                </Button>
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* ステータスカード */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 本人確認ステータス */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">本人確認ステータス</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KycIcon className={`h-5 w-5 ${profile?.verification_status === 'verified' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className="font-bold text-lg">{kycInfo.label}</span>
                </div>
                {profile?.verification_status !== "verified" && profile?.verification_status !== "pending" && (
                  <Link href="/profile/verify">
                    <Button size="sm" variant="outline">
                      提出する
                    </Button>
                  </Link>
                )}
              </div>
              {profile?.verification_status === "rejected" && (
                <p className="text-xs text-red-600 mt-2">書類に不備がありました。再提出をお願いします。</p>
              )}
            </CardContent>
          </Card>

          {/* 会員ランク/プラン */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">現在のプラン</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSubscription ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">{currentSubscription.subscription_plans.name}</span>
                    <p className="text-xs text-muted-foreground">
                      次回更新: {format(new Date(currentSubscription.end_date), "yyyy/MM/dd", { locale: ja })}
                    </p>
                  </div>
                  <Badge>有効</Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">未加入</span>
                  <Link href="/subscription">
                    <Button size="sm">プラン選択</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 次回の予約 */}
        {nextReservation && (
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Calendar className="h-5 w-5" />
                次回の予約
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-4">
                  <div className="h-16 w-24 relative rounded-md overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={nextReservation.vehicles.images?.[0] || nextReservation.vehicles.image_url || "/placeholder.svg"}
                      alt="Vehicle"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{nextReservation.vehicles.make} {nextReservation.vehicles.model}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(nextReservation.start_date), "MM/dd HH:mm", { locale: ja })} 〜
                        {format(new Date(nextReservation.end_date), "MM/dd HH:mm", { locale: ja })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="outline" className="flex-1 md:flex-none" asChild>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=CarSubsc店舗`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      店舗へのアクセス
                    </a>
                  </Button>
                  <Link href={`/reservations/${nextReservation.id}`} className="flex-1 md:flex-none">
                    <Button className="w-full">詳細</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>車両を探す</CardTitle>
              <CardDescription>利用可能な車両を検索・予約</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vehicles">
                <Button className="w-full" disabled={!currentSubscription || profile?.verification_status !== 'verified'}>
                  {profile?.verification_status !== 'verified' ? '本人確認が必要です' : '車両一覧を見る'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>予約管理</CardTitle>
              <CardDescription>現在の予約状況を確認</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reservations">
                <Button className="w-full bg-transparent" variant="outline">
                  予約一覧
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>サブスクリプション</CardTitle>
              <CardDescription>プラン管理・変更</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/subscription">
                <Button className="w-full bg-transparent" variant="outline">
                  プラン管理
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
