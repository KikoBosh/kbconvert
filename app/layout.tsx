import type { Metadata } from "next";
import { GeistSans } from "geist/font";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { Sidebar } from "./components/Sidebar";
import { NuqsAdapter } from 'nuqs/adapters/react';


export const metadata: Metadata = {
  title: "Kiko Converter",
  description: "Convert files between different formats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <div className="min-h-screen flex flex-col">
              <div className="border-b">
                <div className="flex h-16 items-center px-4">
                  <h1 className="text-xl font-bold">Kiko Converter</h1>
                </div>
              </div>
              <div className="flex flex-1">
                <div className="hidden border-r bg-muted/40 md:block md:w-[240px] shrink-0">
                  <Sidebar />
                </div>
                <div className="flex-1">{children}</div>
              </div>
            </div>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
