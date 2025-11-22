"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon, Car } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { format, differenceInDays } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  daily_rate: number
  monthly_rate: number
}

interface BookingPageProps {
  params: Promise<{ id: string }>
}

export default function BookingPage({ params }: BookingPageProps) {
  const router = useRouter()
  const [vehicleId, setVehicleId] = useState<string>("")
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [pickupLocation, setPickupLocation] = useState("")
  const [returnLocation, setReturnLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setVehicleId(resolvedParams.id)
    }
    getParams()
  }, [params])

  const fetchVehicle = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("vehicles").select("*").eq("id", vehicleId).single()

    if (error) {
      setError("車両情報の取得に失敗しました")
      return
    }

    setVehicle(data)
  }, [vehicleId])

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle()
    }
  }, [vehicleId, fetchVehicle])

  const calculateTotal = () => {
    if (!startDate || !endDate || !vehicle) return 0
    const days = differenceInDays(endDate, startDate) + 1
    return days * vehicle.daily_rate
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate || !vehicle) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // ユーザー情報を取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push("/auth/login")
        return
      }

      // 予約を作成
      const { data, error: reservationError } = await supabase
        .from("reservations")
        .insert({
          user_id: user.id,
          vehicle_id: vehicleId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_amount: calculateTotal(),
          pickup_location: pickupLocation,
          return_location: returnLocation,
          notes: notes,
          status: "pending",
        })
        .select()
        .single()

      if (reservationError) throw reservationError

      // 予約確認ページにリダイレクト
      router.push(`/reservations/${data.id}/confirmation`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "予約の作成に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">車両情報を読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* ナビゲーション */}
        <div className="flex items-center gap-4">
          <Link href={`/vehicles/${vehicleId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              車両詳細に戻る
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 予約フォーム */}
          <Card>
            <CardHeader>
              <CardTitle>予約情報入力</CardTitle>
              <CardDescription>
                {vehicle.make} {vehicle.model} ({vehicle.year}年)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 日程選択 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>利用開始日</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>利用終了日</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => date < (startDate || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* 場所情報 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupLocation">受取場所</Label>
                    <Input
                      id="pickupLocation"
                      placeholder="例: 店舗、駅前など"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="returnLocation">返却場所</Label>
                    <Input
                      id="returnLocation"
                      placeholder="例: 店舗、駅前など"
                      value={returnLocation}
                      onChange={(e) => setReturnLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 備考 */}
                <div className="space-y-2">
                  <Label htmlFor="notes">備考・要望（任意）</Label>
                  <Textarea
                    id="notes"
                    placeholder="特別な要望やご質問があればご記入ください"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading || !startDate || !endDate}>
                  {isLoading ? "予約作成中..." : "予約を確定する"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 予約サマリー */}
          <Card>
            <CardHeader>
              <CardTitle>予約内容確認</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 車両情報 */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">車両</h4>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.make} {vehicle.model} ({vehicle.year}年)
                  </p>
                </div>

                {/* 期間 */}
                {startDate && endDate && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">利用期間</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(startDate, "yyyy年MM月dd日", { locale: ja })} 〜{" "}
                      {format(endDate, "yyyy年MM月dd日", { locale: ja })}
                    </p>
                    <p className="text-sm text-muted-foreground">{differenceInDays(endDate, startDate) + 1}日間</p>
                  </div>
                )}

                {/* 料金 */}
                {startDate && endDate && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">料金</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>日額料金</span>
                        <span>¥{vehicle.daily_rate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>利用日数</span>
                        <span>{differenceInDays(endDate, startDate) + 1}日</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold">
                        <span>合計金額</span>
                        <span>¥{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
