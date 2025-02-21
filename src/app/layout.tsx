import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Codeforces viewer",
	description: "View codeforces results",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html className="h-full" lang="en">
			<body
				className={`h-full flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<h1 className="font-bold text-center mt-4 text-3xl">
					Competitive Programming Rankings
				</h1>
				{children}
			</body>
		</html>
	);
}
