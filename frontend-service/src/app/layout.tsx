import Link from "next/link";
import "./globals.css";
import { Roboto } from "next/font/google"
import NavBar from "@components/NavBar";


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

          <div className="header">
          <NavBar></NavBar>
          </div>

          <div className="left-aside"></div>

          <div className="main-content">
            {children}
          </div>

          <div className="right-aside"></div>

          <div className="footer"></div>
        </div>
      </body>
    </html>
  )
}
