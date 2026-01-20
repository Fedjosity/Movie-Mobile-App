import { DownloadProvider } from "@/context/DownloadContext";
import { Stack } from "expo-router";
import "./globals.css";

export default function RootLayout() {
  return (
    <DownloadProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="anime/[id]" options={{ headerShown: false }} />
      </Stack>
    </DownloadProvider>
  );
}
