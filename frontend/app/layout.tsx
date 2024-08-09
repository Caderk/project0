import "./globals.css";
import { Links } from "./components/Links";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Links></Links>
        <main>{children}</main>
      </body>
    </html>
  );
}
