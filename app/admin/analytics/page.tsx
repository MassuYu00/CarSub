import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { checkAdminAccess } from "@/lib/admin-auth"
import { AnalyticsCharts } from "@/components/analytics-charts"

export default async function AnalyticsPage() {
  const { isAdmin, user } = await checkAdminAccess()

  if (!isAdmin || !user) {
    redirect("/dashboard")
  }

  const supabase = await createClient()

  // 分析データを取得
  const [{ data: reservations }, { data: vehicles }, { data: subscriptions }, { data: profiles }] = await Promise.all([
    supabase
      .from("reservations")
      .select("*, vehicles(make, model)")
      .gte("created_at", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("vehicles").select("*"),
    supabase.from("user_subscriptions").select("*"),
    supabase.from("profiles").select("*"),
  ])

  // データを分析用に変換
  const generateAnalyticsData = () => {
    const now = new Date()
    const monthlyData = []

    // 過去6ヶ月のデータを生成
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("ja-JP", { month: "short" })

      const monthReservations =
        reservations?.filter((r) => {
          const reservationDate = new Date(r.created_at)
          return reservationDate.getMonth() === date.getMonth() && reservationDate.getFullYear() === date.getFullYear()
        }) || []

      const monthRevenue = monthReservations.reduce((sum, r) => sum + r.total_amount, 0)

      monthlyData.push({
        month: monthName,
        revenue: monthRevenue,
        reservations: monthReservations.length,
      })
    }

    // 車両稼働率データ
    const vehicleUtilization =
      vehicles?.map((vehicle) => {
        const vehicleReservations = reservations?.filter((r) => r.vehicle_id === vehicle.id) || []
        const totalRevenue = vehicleReservations.reduce((sum, r) => sum + r.total_amount, 0)
        const utilizationRate = Math.min((vehicleReservations.length / 30) * 100, 100) // 月30日として計算

        return {
          vehicle: `${vehicle.make} ${vehicle.model}`,
          utilization: utilizationRate,
          revenue: totalRevenue,
        }
      }) || []

    // サブスクリプション統計
    const subscriptionStats = [
      { plan: "ベーシック", count: subscriptions?.filter((s) => s.plan_type === "basic").length || 0, revenue: 0 },
      { plan: "スタンダード", count: subscriptions?.filter((s) => s.plan_type === "standard").length || 0, revenue: 0 },
      { plan: "プレミアム", count: subscriptions?.filter((s) => s.plan_type === "premium").length || 0, revenue: 0 },
    ]

    // 収益を計算
    subscriptionStats.forEach((stat) => {
      const planRevenue = {
        ベーシック: 29800,
        スタンダード: 49800,
        プレミアム: 79800,
      }
      stat.revenue = stat.count * (planRevenue[stat.plan as keyof typeof planRevenue] || 0)
    })

    // 日次統計
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const currentMonthReservations =
      reservations?.filter((r) => {
        const date = new Date(r.created_at)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      }) || []

    const lastMonthReservations =
      reservations?.filter((r) => {
        const date = new Date(r.created_at)
        return date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear
      }) || []

    const currentMonthRevenue = currentMonthReservations.reduce((sum, r) => sum + r.total_amount, 0)
    const lastMonthRevenue = lastMonthReservations.reduce((sum, r) => sum + r.total_amount, 0)
    const monthlyGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    const dailyStats = {
      totalRevenue: currentMonthRevenue,
      monthlyGrowth,
      activeUsers: profiles?.length || 0,
      utilizationRate: vehicleUtilization.reduce((sum, v) => sum + v.utilization, 0) / (vehicleUtilization.length || 1),
    }

    return {
      monthlyRevenue: monthlyData,
      vehicleUtilization,
      subscriptionStats,
      dailyStats,
    }
  }

  const analyticsData = generateAnalyticsData()

  return (
    <div>
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">分析・レポート</h1>
            <p className="text-muted-foreground">売上と利用状況の詳細分析</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              レポート出力
            </Button>
          </div>
        </div>

        {/* 分析チャート */}
        <AnalyticsCharts data={analyticsData} />

        {/* 追加情報 */}
        <Card>
          <CardHeader>
            <CardTitle>データ概要</CardTitle>
            <CardDescription>分析期間と対象データの詳細</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-medium">分析期間</h4>
                <p className="text-sm text-muted-foreground">過去6ヶ月間のデータ</p>
              </div>
              <div>
                <h4 className="font-medium">対象予約</h4>
                <p className="text-sm text-muted-foreground">{reservations?.length || 0}件の予約データ</p>
              </div>
              <div>
                <h4 className="font-medium">登録車両</h4>
                <p className="text-sm text-muted-foreground">{vehicles?.length || 0}台の車両データ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
