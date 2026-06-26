import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cerelyx.online"),
  title: {
    default: "Cerelyx — beautiful websites for weddings & events",
    template: "%s · Cerelyx",
  },
  description:
    "Create a stunning website for your wedding or any life event, share it on your own address, and collect RSVPs — in minutes.",
  applicationName: "Cerelyx",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fraunces.variable} ${hanken.variable}`}>
      <body className="min-h-dvh bg-canvas font-body text-ink antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
