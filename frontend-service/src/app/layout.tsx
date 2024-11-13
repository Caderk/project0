import "./globals.css";
import { Roboto } from "next/font/google"

const roboto = Roboto({ weight: "400", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <div className="container">
          <div className="item-1"></div>
          <div className="item-2"></div>
          <div className="item-3">
            {children}
          </div>
          <div className="item-4"></div>
          <div className="item-5"></div>
        </div>
      </body>
    </html>
  )
}
