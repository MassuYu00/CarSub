import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, CreditCard } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { checkAdminAccess } from "@/lib/admin-auth"

export default async function AdminPlansPage() {
    const { isAdmin, user } = await checkAdminAccess()

    if (!isAdmin || !user) {
        redirect("/dashboard")
    }

    const supabase = await createClient()
    const { data: plans } = await supabase.from("subscription_plans").select("*").order("monthly_price", { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">プラン管理</h1>
                    <p className="text-muted-foreground">サブスクリプションプランの設定と管理</p>
                </div>
                <Link href="/admin/plans/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        新規プラン作成
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>プラン一覧</CardTitle>
                    <CardDescription>現在提供中の料金プラン</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>プラン名</TableHead>
                                <TableHead>月額料金</TableHead>
                                <TableHead>利用可能時間</TableHead>
                                <TableHead>同時予約数</TableHead>
                                <TableHead>Stripe連携</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans && plans.length > 0 ? (
                                plans.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell className="font-medium">{plan.name}</TableCell>
                                        <TableCell>¥{plan.monthly_price.toLocaleString()}</TableCell>
                                        <TableCell>{plan.max_hours_per_month}時間/月</TableCell>
                                        <TableCell>{plan.max_concurrent_reservations}台</TableCell>
                                        <TableCell>
                                            {plan.stripe_price_id ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    <CreditCard className="mr-1 h-3 w-3" />
                                                    連携済み
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    未連携
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/plans/${plan.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        プランが登録されていません
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
