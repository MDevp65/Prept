import { DM_Sans, Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Header from "@/components/custom/Header";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "sonner";

const lora = Lora({
  subsets: ['latin'],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans"
});

export const metadata = {
  title: "Prept",
  description: "Prept",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark
      }}
    >
      <html
        lang="en"
        suppressHydrationWarning
      >
        <body
          className={`${lora.variable} ${dmSans.variable} font-sans`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >

            {/* header */}
            <Header />
            <main className="min-h-screen">
              {children}
              <Toaster richColors position="top-right" />
            </main>

            {/* footer */}
            <footer className="relative z-10 border-t border-white/7 py-12  mx-auto px-6 flex flex-wrap items-center justify-center text-stone-400">
              Made with ❤️ by<Badge variant="gold" className={"ml-2"}>M_Developer</Badge>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
