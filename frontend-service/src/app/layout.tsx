import "./globals.css";
import { Roboto } from "next/font/google"
import NavBar from "@components/NavBar";
import Link from "next/link";

const roboto = Roboto({ weight: "400", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <div className="main">

          <div className="header">
            <NavBar></NavBar>
          </div>

          <div className="container">
            <div className="left-aside">
              <Link href={'/inventory'}>Inventory</Link>
              <span>Coming soon!</span>
              <span>Coming soon!</span>
            </div>

            <div className="main-content">
              {children}
            </div>

            <div className="right-aside">
            </div>
          </div>

          <div className="footer">
            <span>footer content</span>
          </div>

        </div>
      </body>
    </html>
  )
}
