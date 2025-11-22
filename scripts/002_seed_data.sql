-- CarSubsc サンプルデータ投入

-- サブスクリプションプランのサンプルデータ
INSERT INTO public.subscription_plans (name, description, monthly_price, max_rentals_per_month, max_rental_days, features) VALUES
('ベーシック', '月2回まで利用可能な基本プラン', 8000.00, 2, 3, ARRAY['月2回まで利用', '最大3日間レンタル', '基本サポート']),
('スタンダード', '月4回まで利用可能な標準プラン', 15000.00, 4, 5, ARRAY['月4回まで利用', '最大5日間レンタル', '優先サポート', '車種選択可能']),
('プレミアム', '月8回まで利用可能なプレミアムプラン', 25000.00, 8, 7, ARRAY['月8回まで利用', '最大7日間レンタル', '24時間サポート', '全車種利用可能', '無料配車サービス']);

-- 車両のサンプルデータ
INSERT INTO public.vehicles (make, model, year, color, license_plate, vehicle_type, fuel_type, transmission, seats, daily_rate, monthly_rate, image_url, description, features) VALUES
('トヨタ', 'プリウス', 2022, 'ホワイト', '品川500あ1234', 'sedan', 'hybrid', 'automatic', 5, 6000.00, 150000.00, '/placeholder.svg?height=300&width=400', '燃費の良いハイブリッドセダン', ARRAY['ハイブリッド', 'ナビゲーション', 'バックカメラ', 'ETC']),
('ホンダ', 'フィット', 2023, 'ブルー', '品川500あ5678', 'compact', 'gasoline', 'automatic', 5, 5000.00, 120000.00, '/placeholder.svg?height=300&width=400', 'コンパクトで運転しやすい車', ARRAY['コンパクト', 'ナビゲーション', 'ETC', '低燃費']),
('日産', 'セレナ', 2022, 'ブラック', '品川500あ9012', 'suv', 'gasoline', 'automatic', 8, 8000.00, 200000.00, '/placeholder.svg?height=300&width=400', 'ファミリー向けの大型車', ARRAY['8人乗り', 'スライドドア', 'ナビゲーション', 'バックカメラ', 'ETC']),
('マツダ', 'CX-5', 2023, 'レッド', '品川500あ3456', 'suv', 'gasoline', 'automatic', 5, 7000.00, 180000.00, '/placeholder.svg?height=300&width=400', 'スタイリッシュなSUV', ARRAY['SUV', 'AWD', 'ナビゲーション', 'バックカメラ', 'ETC', 'レザーシート']),
('スバル', 'インプレッサ', 2022, 'シルバー', '品川500あ7890', 'sedan', 'gasoline', 'automatic', 5, 5500.00, 140000.00, '/placeholder.svg?height=300&width=400', '安全性能の高いセダン', ARRAY['AWD', 'アイサイト', 'ナビゲーション', 'ETC']);
