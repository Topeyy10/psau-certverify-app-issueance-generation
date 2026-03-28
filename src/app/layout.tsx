import Script from "next/script";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <html lang="en">
      <body className="antialiased select-none">
        {isDevelopment && (
          <Script
            src="http://unpkg.com/react-scan/dist/auto.global.js"
            crossOrigin="anonymous"
          />
        )}
        {children}
      </body>
    </html>
  );
}
