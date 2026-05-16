import "./globals.css";

export const metadata = {
  title: "탑 매치업 백과사전",
  description: "상대 탑 선택 기반 추천픽 및 상세 상대법 앱"
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body>{children}</body></html>;
}
