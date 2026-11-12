import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'わくわくヒーローランド！3つのちいくゲーム',
  description: '4歳児が夢中で遊べる！シルエットずかん・ひっさつわざすうじバトル・どかん＆コースパズルの3つの知育ミニゲーム＆7つのスターご褒美アプリ',
  openGraph: {
    title: 'わくわくヒーローランド！3つのちいくゲーム',
    description: '4歳児が夢中で遊べる！シルエットずかん・ひっさつわざすうじバトル・どかん＆コースパズルの3つの知育ミニゲーム＆7つのスターご褒美アプリ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'わくわくヒーローランド！3つのちいくゲーム',
    description: '4歳児が夢中で遊べる！シルエットずかん・ひっさつわざすうじバトル・どかん＆コースパズルの3つの知育ミニゲーム＆7つのスターご褒美アプリ',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ja">
      <body
        suppressHydrationWarning
        className="font-sans select-none touch-manipulation overflow-x-hidden bg-slate-950 text-white antialiased"
      >
        {children}
      </body>
    </html>
  );
}
