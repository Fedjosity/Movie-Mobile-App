import { Stack } from "expo-router";
import "./globals.css";
import { DownloadProvider } from "@/context/DownloadContext";

export default function RootLayout() {
  return (
    <DownloadProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="anime/[id]" options={{ headerShown: false }} />
      </Stack>
    </DownloadProvider>
  );
}
