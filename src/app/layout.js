import "./globals.css";

export const metadata = {
  title: "AI Text Lab",
  description: "A local AI developer mentor powered by Ollama.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
