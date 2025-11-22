import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Car, Calendar, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { checkAdminAccess } from "@/lib/admin-auth"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

export default async function AdminDashboardPage() {
  const { isAdmin, user } = await checkAdminAccess()

  if (!isAdmin || !user) {
    redirect("/dashboard")
  }

  const supabase = await createClient()

  // 統計データを取得
  const [
    { count: totalUsers },
    { count: totalVehicles },
    { count: totalReservations },
    { count: activeSubscriptions },
    { data: pendingKYCUsers },
    { data: todaysPickups },
    { data: todaysReturns },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("vehicles").select("*", { count: "exact", head: true }),
    supabase.from("reservations").select("*", { count: "exact", head: true }),
    supabase.from("user_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("id").eq("verification_status", "pending"),
    supabase
      .from("reservations")
      .select("*, vehicles(make, model), profiles(full_name)")
      .gte("start_date", new Date().toISOString().split("T")[0])
      .lt("start_date", new Date(Date.now() + 86400000).toISOString().split("T")[0]),
    supabase
      .from("reservations")
      .select("*, vehicles(make, model), profiles(full_name)")
      .gte("end_date", new Date().toISOString().split("T")[0])
      .lt("end_date", new Date(Date.now() + 86400000).toISOString().split("T")[0]),
  ])

  const pendingKYCCount = pendingKYCUsers?.length || 0

  return (
    <div>
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
            <p className="text-muted-foreground">CarSubsc システム管理</p>
          </div>
        </div>

        {/* KPIカード */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今月の売上見込</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{(activeSubscriptions || 0) * 29800}</div>
              <p className="text-xs text-muted-foreground">サブスクリプション収益</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総会員数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">登録済みユーザー</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">稼働率</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalVehicles ? Math.round(((activeSubscriptions || 0) / totalVehicles) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">契約数 / 車両数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">要対応タスク</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingKYCCount}</div>
              <p className="text-xs text-muted-foreground">件の免許証確認待ち</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 要対応タスク */}
          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-5 w-5" />
                要対応タスク
              </CardTitle>
              <CardDescription>優先的に対応が必要な項目</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingKYCCount > 0 ? (
                  <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {pendingKYCCount}
                      </div>
                      <div>
                        <p className="font-medium">免許証確認待ち</p>
                        <p className="text-sm text-muted-foreground">ユーザーの本人確認書類を確認してください</p>
                      </div>
                    </div>
                    <Link href="/admin/users?status=pending">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        確認する
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8 text-muted-foreground bg-white/50 rounded-lg border border-dashed">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    現在対応が必要なタスクはありません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 本日の予定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                本日の予定
              </CardTitle>
              <CardDescription>{format(new Date(), "yyyy年MM月dd日 (E)", { locale: ja })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-blue-600">
                    <Clock className="h-4 w-4" /> 貸出開始 (Pickup)
                  </h4>
                  {todaysPickups && todaysPickups.length > 0 ? (
                    <div className="space-y-2">
                      {todaysPickups.map((reservation) => (
                        <div key={reservation.id} className="flex items-center justify-between p-2 border rounded bg-slate-50">
                          <div className="text-sm">
                            <span className="font-medium">
                              {format(new Date(reservation.start_date), "HH:mm", { locale: ja })}
                            </span>{" "}
                            - {reservation.vehicles.make} {reservation.vehicles.model}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reservation.profiles?.full_name
                              ? decodeURIComponent(atob(reservation.profiles.full_name))
                              : "ユーザー"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground pl-6">予定なし</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" /> 返却予定 (Return)
                  </h4>
                  {todaysReturns && todaysReturns.length > 0 ? (
                    <div className="space-y-2">
                      {todaysReturns.map((reservation) => (
                        <div key={reservation.id} className="flex items-center justify-between p-2 border rounded bg-slate-50">
                          <div className="text-sm">
                            <span className="font-medium">
                              {format(new Date(reservation.end_date), "HH:mm", { locale: ja })}
                            </span>{" "}
                            - {reservation.vehicles.make} {reservation.vehicles.model}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reservation.profiles?.full_name
                              ? decodeURIComponent(atob(reservation.profiles.full_name))
                              : "ユーザー"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground pl-6">予定なし</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 管理メニュー */}
        <div>
          <h2 className="text-2xl font-bold mb-6">管理メニュー</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/vehicles">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    車両管理
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>車両の登録・編集・ステータス変更</CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/reservations">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    予約管理
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>予約カレンダー・代理予約</CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/users">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    会員管理
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>会員情報の確認・免許証承認</CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/plans">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    プラン管理
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>料金プラン・Stripe連携設定</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}