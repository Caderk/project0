import "./globals.css";
import NavBar from "@components/NavBar";
import LeftAside from "@components/LeftAside";
import { Roboto } from "next/font/google"

const roboto = Roboto({ weight: "400", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <div className="main">

          <div className="header">
            <NavBar></NavBar>
          </div>

          <div className="container">
            <div className="left-aside">
              <LeftAside></LeftAside>
            </div>

            <div className="center-content">
              {children}
            </div>

            <div className="right-aside">
              <span>Right Aside Placeholder</span>
            </div>
          </div>

          <div className="footer">
            <span>Footer Placeholder</span>
          </div>

        </div>
      </body>
    </html>
  )
}
