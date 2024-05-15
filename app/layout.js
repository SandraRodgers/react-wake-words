"use client";
import "./globals.css";
import { AudioProvider } from "./context/AudioContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
