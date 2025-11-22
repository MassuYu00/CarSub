"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Car } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AnalyticsData {
  monthlyRevenue: Array<{ month: string; revenue: number; reservations: number }>
  vehicleUtilization: Array<{ vehicle: string; utilization: number; revenue: number }>
  subscriptionStats: Array<{ plan: string; count: number; revenue: number }>
  dailyStats: {
    totalRevenue: number
    monthlyGrowth: number
    activeUsers: number
    utilizationRate: number
  }
}

interface AnalyticsChartsProps {
  data: AnalyticsData
}

const COLORS = ["#2563eb", "#7c3aed", "#dc2626", "#ea580c", "#16a34a", "#0891b2"]

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* KPI カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月間売上</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.dailyStats.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.dailyStats.monthlyGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={data.dailyStats.monthlyGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {formatPercent(Math.abs(data.dailyStats.monthlyGrowth))}
              </span>
              <span className="ml-1">前月比</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.dailyStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">今月の利用者数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">車両稼働率</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(data.dailyStats.utilizationRate)}</div>
            <p className="text-xs text-muted-foreground">平均稼働率</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月間予約数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.monthlyRevenue[data.monthlyRevenue.length - 1]?.reservations || 0}
            </div>
            <p className="text-xs text-muted-foreground">今月の予約件数</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 月間売上推移 */}
        <Card>
          <CardHeader>
            <CardTitle>月間売上推移</CardTitle>
            <CardDescription>過去6ヶ月の売上とレンタル件数</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? formatCurrency(Number(value)) : value,
                    name === "revenue" ? "売上" : "予約数",
                  ]}
                />
                <Bar yAxisId="right" dataKey="reservations" fill="#e5e7eb" name="reservations" />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  name="revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 車両稼働率 */}
        <Card>
          <CardHeader>
            <CardTitle>車両別稼働率</CardTitle>
            <CardDescription>各車両の利用率と売上</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.vehicleUtilization} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="vehicle" type="category" width={80} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? formatCurrency(Number(value)) : formatPercent(Number(value)),
                    name === "revenue" ? "売上" : "稼働率",
                  ]}
                />
                <Bar dataKey="utilization" fill="#2563eb" name="utilization" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* サブスクリプション分析 */}
        <Card>
          <CardHeader>
            <CardTitle>サブスクリプション分析</CardTitle>
            <CardDescription>プラン別の契約数と売上</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.subscriptionStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ plan, count }) => `${plan}: ${count}件`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.subscriptionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}件`, "契約数"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 詳細統計 */}
        <Card>
          <CardHeader>
            <CardTitle>詳細統計</CardTitle>
            <CardDescription>車両とサブスクリプションの詳細データ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">人気車両 TOP3</h4>
                <div className="space-y-2">
                  {data.vehicleUtilization
                    .sort((a, b) => b.utilization - a.utilization)
                    .slice(0, 3)
                    .map((vehicle, index) => (
                      <div key={vehicle.vehicle} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-sm">{vehicle.vehicle}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatPercent(vehicle.utilization)}</div>
                          <div className="text-xs text-muted-foreground">{formatCurrency(vehicle.revenue)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">サブスクリプション収益</h4>
                <div className="space-y-2">
                  {data.subscriptionStats.map((sub) => (
                    <div key={sub.plan} className="flex items-center justify-between">
                      <span className="text-sm">{sub.plan}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(sub.revenue)}</div>
                        <div className="text-xs text-muted-foreground">{sub.count}件</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
