"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

export function VehicleFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [type, setType] = useState(searchParams.get("type") || "")
  const [fuel, setFuel] = useState(searchParams.get("fuel") || "")
  const [transmission, setTransmission] = useState(searchParams.get("transmission") || "")
  const [seats, setSeats] = useState(searchParams.get("seats") || "")

  const initialDateRange: DateRange | undefined =
    searchParams.get("startDate") && searchParams.get("endDate")
      ? {
        from: new Date(searchParams.get("startDate")!),
        to: new Date(searchParams.get("endDate")!),
      }
      : undefined

  const [date, setDate] = useState<DateRange | undefined>(initialDateRange)

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (type) params.set("type", type)
    if (fuel) params.set("fuel", fuel)
    if (transmission) params.set("transmission", transmission)
    if (seats) params.set("seats", seats)
    if (date?.from) params.set("startDate", format(date.from, "yyyy-MM-dd"))
    if (date?.to) params.set("endDate", format(date.to, "yyyy-MM-dd"))

    router.push(`/vehicles?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    setType("")
    setFuel("")
    setTransmission("")
    setSeats("")
    setDate(undefined)
    router.push("/vehicles")
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="lg:col-span-2">
            <Input
              placeholder="車種で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>

          <div className="lg:col-span-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "yyyy/MM/dd", { locale: ja })} -{" "}
                        {format(date.to, "yyyy/MM/dd", { locale: ja })}
                      </>
                    ) : (
                      format(date.from, "yyyy/MM/dd", { locale: ja })
                    )
                  ) : (
                    <span>利用期間を選択</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="車種タイプ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">コンパクト</SelectItem>
              <SelectItem value="sedan">セダン</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="truck">トラック</SelectItem>
            </SelectContent>
          </Select>

          <Select value={fuel} onValueChange={setFuel}>
            <SelectTrigger>
              <SelectValue placeholder="燃料タイプ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasoline">ガソリン</SelectItem>
              <SelectItem value="hybrid">ハイブリッド</SelectItem>
              <SelectItem value="electric">電気</SelectItem>
            </SelectContent>
          </Select>

          {/* Hidden on smaller screens or moved to advanced filters if needed, keeping simple for now */}
          {/* <Select value={transmission} onValueChange={setTransmission}> ... </Select> */}

          <div className="flex gap-2 lg:col-span-2 xl:col-span-1">
            <Button onClick={applyFilters} className="flex-1">
              検索
            </Button>
            <Button onClick={clearFilters} variant="outline">
              クリア
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

