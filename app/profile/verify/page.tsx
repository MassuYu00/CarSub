"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { ArrowLeft, CheckCircle2, CreditCard } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

export default function VerifyIdentityPage() {
    const router = useRouter()
    const supabase = createBrowserClient()
    const [loading, setLoading] = useState(false)
    const [frontImageUrl, setFrontImageUrl] = useState("")
    const [backImageUrl, setBackImageUrl] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!frontImageUrl || !backImageUrl) return

        setLoading(true)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) throw new Error("User not found")

            const { error } = await supabase
                .from("profiles")
                .update({
                    driver_license_image_url: frontImageUrl,
                    driver_license_back_image_url: backImageUrl,
                    verification_status: "pending",
                })
                .eq("id", user.id)

            if (error) throw error

            setSubmitted(true)
        } catch (error) {
            console.error("提出に失敗しました:", error)
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="container mx-auto p-6 max-w-2xl">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">提出完了</CardTitle>
                        <CardDescription>
                            本人確認書類の提出ありがとうございます。
                            <br />
                            管理者が確認するまでしばらくお待ちください。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Link href="/dashboard">
                            <Button>ダッシュボードに戻る</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <div className="mb-6">
                <Link href="/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    プロフィールに戻る
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>本人確認書類の提出</CardTitle>
                    <CardDescription>
                        サービスを利用するには、運転免許証の画像をアップロードして本人確認を行う必要があります。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                        <AlertTitle className="text-blue-800 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            提出時の注意点
                        </AlertTitle>
                        <AlertDescription className="text-blue-700">
                            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                                <li>運転免許証の<strong>表面</strong>と<strong>裏面</strong>の両方が必要です。</li>
                                <li>文字が鮮明に読めるように撮影してください。</li>
                                <li>有効期限内のものに限ります。</li>
                                <li>光の反射で文字が隠れないようにご注意ください。</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">
                                    運転免許証（表面）
                                </Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    顔写真、氏名、住所、有効期限が記載されている面
                                </p>
                                <ImageUpload
                                    value={frontImageUrl}
                                    onChange={(url) => setFrontImageUrl(url)}
                                    onRemove={() => setFrontImageUrl("")}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label className="text-base font-semibold">
                                    運転免許証（裏面）
                                </Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    備考欄などが記載されている面（記載がない場合も必要です）
                                </p>
                                <ImageUpload
                                    value={backImageUrl}
                                    onChange={(url) => setBackImageUrl(url)}
                                    onRemove={() => setBackImageUrl("")}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={!frontImageUrl || !backImageUrl || loading}>
                            {loading ? "送信中..." : "提出する"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
