import type { Metadata } from "next";
import "./globals.css";

// Metadata defines the default browser title and description for the app.
export const metadata: Metadata = {
  title: "APP Thompson",
  description: "Register, login, dashboard",
};

/**
 * RootLayout wraps every route in the application.
 * It loads global styles, exposes the Material Symbols font used by the UI,
 * and renders each page through the children slot provided by Next.js.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Material Symbols power the icon-only controls used across dashboards. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Route content is injected here by the App Router. */}
        {children}
      </body>
    </html>
  );
}
