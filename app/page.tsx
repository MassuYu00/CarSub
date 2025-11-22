import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Check, ChevronRight, Shield, Clock, Car, MapPin, Phone, Mail } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              CarSubsc
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              特徴
            </Link>
            <Link href="#vehicles" className="text-sm font-medium hover:text-primary transition-colors">
              車両一覧
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              よくある質問
            </Link>
          </nav>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                ログイン
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                新規登録
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-image.png"
              alt="Luxury Car on Coastal Road"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl text-white space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Badge className="bg-primary/20 text-primary-foreground hover:bg-primary/30 border-primary/50 backdrop-blur-sm">
                次世代のカーライフ
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                自由な移動を、
                <br />
                <span className="text-red-600">定額</span>で手に入れる
              </h1>
              <p className="text-xl text-gray-200 max-w-lg leading-relaxed">
                所有から利用へ。CarSubscは、あなたのライフスタイルに合わせた
                柔軟なカーサブスクリプションサービスです。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8">
                    今すぐ始める
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/vehicles">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-lg h-12 px-8 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                  >
                    車両を見る
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-8 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>初期費用0円</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>保険料込み</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>最短1ヶ月から</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">選ばれる理由</h2>
              <p className="text-muted-foreground text-lg">
                CarSubscが提供する、新しいカーライフの形。
                面倒な手続きや維持費から解放され、純粋にドライブを楽しめます。
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">安心の定額制</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    車両代金、保険料、税金、メンテナンス費用がすべて月額料金に含まれています。
                    急な出費の心配がなく、家計管理も簡単です。
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 text-green-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">地域密着サポート</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    地元の信頼できる整備工場と提携。
                    万が一のトラブル時も、迅速かつ親身なサポートを提供します。
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 text-purple-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">柔軟なプラン</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    最短1ヶ月から利用可能。ライフスタイルの変化に合わせて、
                    車種の変更や解約もスムーズに行えます。
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Vehicle Showcase Preview */}
        <section id="vehicles" className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">人気の車種</h2>
                <p className="text-muted-foreground">あなたにぴったりの一台が見つかります</p>
              </div>
              <Link href="/vehicles" className="hidden md:block">
                <Button variant="outline">
                  すべての車両を見る
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Demo Car 1 */}
              <Card className="overflow-hidden group">
                <div className="aspect-video relative bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Car className="h-12 w-12" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white/90 text-black hover:bg-white">人気</Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Compact City</CardTitle>
                      <CardDescription>街乗りに最適</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">¥39,800</p>
                      <p className="text-xs text-muted-foreground">/月</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      5人乗り
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      ハイブリッド
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      AT
                    </Badge>
                  </div>
                  <Link href="/vehicles">
                    <Button className="w-full group-hover:bg-primary/90">詳細を見る</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Demo Car 2 */}
              <Card className="overflow-hidden group">
                <div className="aspect-video relative bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Car className="h-12 w-12" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white/90 text-black hover:bg-white">新着</Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Premium SUV</CardTitle>
                      <CardDescription>アウトドアにも</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">¥59,800</p>
                      <p className="text-xs text-muted-foreground">/月</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      7人乗り
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      ディーゼル
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      4WD
                    </Badge>
                  </div>
                  <Link href="/vehicles">
                    <Button className="w-full group-hover:bg-primary/90">詳細を見る</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Demo Car 3 */}
              <Card className="overflow-hidden group">
                <div className="aspect-video relative bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Car className="h-12 w-12" />
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Luxury Sedan</CardTitle>
                      <CardDescription>上質な移動空間</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">¥79,800</p>
                      <p className="text-xs text-muted-foreground">/月</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      5人乗り
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      ガソリン
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      本革シート
                    </Badge>
                  </div>
                  <Link href="/vehicles">
                    <Button className="w-full group-hover:bg-primary/90">詳細を見る</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/vehicles">
                <Button variant="outline" className="w-full">
                  すべての車両を見る
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              新しいカーライフを、
              <br />
              ここから始めましょう
            </h2>
            <p className="text-primary-foreground/80 text-xl mb-10 max-w-2xl mx-auto">
              登録は無料。まずは会員登録して、
              あなたにぴったりの一台を探してみませんか？
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg h-14 px-8">
                  無料で会員登録
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-lg h-14 px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  お問い合わせ
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">よくある質問</h2>
            <div className="space-y-4">
              {[
                {
                  q: "契約期間の縛りはありますか？",
                  a: "最短1ヶ月からご利用いただけます。解約金も発生しませんので、必要な期間だけ気軽にご利用いただけます。",
                },
                {
                  q: "保険は含まれていますか？",
                  a: "はい、すべてのプランに自賠責保険と任意保険が含まれています。万が一の事故の際も安心です。",
                },
                {
                  q: "審査はありますか？",
                  a: "はい、ご利用開始前に所定の審査がございます。運転免許証とクレジットカードがあれば、オンラインで簡単にお申し込みいただけます。",
                },
              ].map((item, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-6 w-6 text-white" />
                <span className="text-xl font-bold text-white">CarSubsc</span>
              </div>
              <p className="text-sm text-gray-400">
                地域密着型のカーサブスクリプションサービス。
                安心・安全・快適なカーライフをサポートします。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">サービス</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/vehicles" className="hover:text-white transition-colors">
                    車両一覧
                  </Link>
                </li>
                <li>
                  <Link href="/subscription" className="hover:text-white transition-colors">
                    料金プラン
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    CarSubscについて
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">サポート</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    よくある質問
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    利用規約
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">お問い合わせ</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  03-1234-5678
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@carsubsc.com
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  東京都渋谷区...
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © 2025 CarSubsc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
