"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Plan {
    id: string
    name: string
    monthly_price: number
    max_hours_per_month: number
    max_concurrent_reservations: number
    stripe_product_id: string
    stripe_price_id: string
    description: string
}

export default function EditPlanPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const supabase = createBrowserClient()
    const [loading, setLoading] = useState(false)
    const [plan, setPlan] = useState<Plan | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        monthly_price: "",
        max_hours_per_month: "",
        max_concurrent_reservations: "",
        stripe_product_id: "",
        stripe_price_id: "",
        description: "",
    })

    const fetchPlan = useCallback(async () => {
        try {
            const { data, error } = await supabase.from("subscription_plans").select("*").eq("id", params.id).single()

            if (error) throw error

            setPlan(data)
            setFormData({
                name: data.name,
                monthly_price: data.monthly_price.toString(),
                max_hours_per_month: data.max_hours_per_month.toString(),
                max_concurrent_reservations: data.max_concurrent_reservations.toString(),
                stripe_product_id: data.stripe_product_id || "",
                stripe_price_id: data.stripe_price_id || "",
                description: data.description || "",
            })
        } catch (error) {
            console.error("プラン情報の取得に失敗しました:", error)
        }
    }, [params.id, supabase])

    useEffect(() => {
        fetchPlan()
    }, [fetchPlan])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from("subscription_plans")
                .update({
                    name: formData.name,
                    monthly_price: Number.parseInt(formData.monthly_price),
                    max_hours_per_month: Number.parseInt(formData.max_hours_per_month),
                    max_concurrent_reservations: Number.parseInt(formData.max_concurrent_reservations),
                    stripe_product_id: formData.stripe_product_id,
                    stripe_price_id: formData.stripe_price_id,
                    description: formData.description,
                })
                .eq("id", params.id)

            if (error) throw error

            router.push("/admin/plans")
        } catch (error) {
            console.error("プランの更新に失敗しました:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (!plan) {
        return <div className="container mx-auto py-8">読み込み中...</div>
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <Link
                    href="/admin/plans"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    プラン管理に戻る
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>プラン情報を編集</CardTitle>
                    <CardDescription>
                        {plan.name} の設定を変更します
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">プラン名</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="monthly_price">月額料金（円）</Label>
                                <Input
                                    id="monthly_price"
                                    type="number"
                                    value={formData.monthly_price}
                                    onChange={(e) => handleChange("monthly_price", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_hours_per_month">月間利用可能時間（時間）</Label>
                                <Input
                                    id="max_hours_per_month"
                                    type="number"
                                    value={formData.max_hours_per_month}
                                    onChange={(e) => handleChange("max_hours_per_month", e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_concurrent_reservations">同時予約可能数</Label>
                            <Input
                                id="max_concurrent_reservations"
                                type="number"
                                value={formData.max_concurrent_reservations}
                                onChange={(e) => handleChange("max_concurrent_reservations", e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-medium">Stripe連携設定</h3>
                            <div className="space-y-2">
                                <Label htmlFor="stripe_product_id">Stripe Product ID</Label>
                                <Input
                                    id="stripe_product_id"
                                    value={formData.stripe_product_id}
                                    onChange={(e) => handleChange("stripe_product_id", e.target.value)}
                                    placeholder="prod_..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
                                <Input
                                    id="stripe_price_id"
                                    value={formData.stripe_price_id}
                                    onChange={(e) => handleChange("stripe_price_id", e.target.value)}
                                    placeholder="price_..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? "更新中..." : "プランを更新"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                キャンセル
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
