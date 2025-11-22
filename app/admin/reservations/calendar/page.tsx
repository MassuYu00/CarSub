import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { checkAdminAccess } from "@/lib/admin-auth"
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO } from "date-fns"
import { ja } from "date-fns/locale"

export default async function AdminReservationCalendarPage({
    searchParams,
}: {
    searchParams: { date?: string }
}) {
    const { isAdmin, user } = await checkAdminAccess()

    if (!isAdmin || !user) {
        redirect("/dashboard")
    }

    const supabase = await createClient()

    // Date navigation
    const currentDate = searchParams.date ? parseISO(searchParams.date) : new Date()
    const startDate = startOfMonth(currentDate)
    const endDate = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    // Fetch data
    const [{ data: vehicles }, { data: reservations }] = await Promise.all([
        supabase.from("vehicles").select("*").order("make", { ascending: true }),
        supabase
            .from("reservations")
            .select("*, profiles(full_name)")
            .gte("end_date", startDate.toISOString())
            .lte("start_date", endDate.toISOString()),
    ])

    const getReservationForCell = (vehicleId: string, date: Date) => {
        return reservations?.find(r =>
            r.vehicle_id === vehicleId &&
            isWithinInterval(date, { start: parseISO(r.start_date), end: parseISO(r.end_date) })
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed": return "bg-blue-500"
            case "active": return "bg-green-500"
            case "completed": return "bg-gray-500"
            case "pending": return "bg-orange-500"
            case "cancelled": return "bg-red-500"
            default: return "bg-slate-500"
        }
    }

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-4rem)]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/reservations">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">予約カレンダー</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/admin/reservations/calendar?date=${format(addDays(currentDate, -30), "yyyy-MM-dd")}`}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <span className="text-lg font-medium w-32 text-center">
                        {format(currentDate, "yyyy年 MM月", { locale: ja })}
                    </span>
                    <Link href={`/admin/reservations/calendar?date=${format(addDays(currentDate, 30), "yyyy-MM-dd")}`}>
                        <Button variant="outline" size="icon">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/admin/reservations/new" className="ml-4">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            新規予約
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <div className="min-w-[1200px]">
                        {/* Header Row */}
                        <div className="flex border-b sticky top-0 bg-background z-10">
                            <div className="w-48 p-4 font-bold border-r shrink-0 bg-muted/50">車両</div>
                            <div className="flex flex-1">
                                {days.map((day) => (
                                    <div
                                        key={day.toISOString()}
                                        className={`flex-1 min-w-[40px] text-center p-2 border-r text-sm ${isSameDay(day, new Date()) ? "bg-blue-50 font-bold text-blue-600" : ""
                                            }`}
                                    >
                                        <div>{format(day, "d")}</div>
                                        <div className="text-xs text-muted-foreground">{format(day, "E", { locale: ja })}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Vehicle Rows */}
                        {vehicles?.map((vehicle) => (
                            <div key={vehicle.id} className="flex border-b hover:bg-muted/20 transition-colors">
                                <div className="w-48 p-4 border-r shrink-0 font-medium flex flex-col justify-center">
                                    <div>{vehicle.make} {vehicle.model}</div>
                                    <div className="text-xs text-muted-foreground">{vehicle.license_plate}</div>
                                </div>
                                <div className="flex flex-1 relative">
                                    {days.map((day) => {
                                        const reservation = getReservationForCell(vehicle.id, day)
                                        const isStart = reservation && isSameDay(parseISO(reservation.start_date), day)
                                        const isEnd = reservation && isSameDay(parseISO(reservation.end_date), day)

                                        return (
                                            <div
                                                key={day.toISOString()}
                                                className={`flex-1 min-w-[40px] border-r relative h-16 ${isSameDay(day, new Date()) ? "bg-blue-50/30" : ""
                                                    }`}
                                            >
                                                {reservation && (
                                                    <Link href={`/admin/reservations/${reservation.id}`}>
                                                        <div
                                                            className={`absolute top-2 bottom-2 left-0 right-0 mx-1 rounded-md ${getStatusColor(reservation.status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer z-0`}
                                                            title={`${reservation.profiles?.full_name ? decodeURIComponent(atob(reservation.profiles.full_name)) : "ユーザー"} (${format(parseISO(reservation.start_date), "MM/dd")} - ${format(parseISO(reservation.end_date), "MM/dd")})`}
                                                        >
                                                            {isStart && (
                                                                <div className="text-[10px] text-white px-1 truncate font-medium">
                                                                    {reservation.profiles?.full_name ? decodeURIComponent(atob(reservation.profiles.full_name)) : "ユーザー"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Link>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    )
}
