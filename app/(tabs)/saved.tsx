import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useDownloads } from "@/context/DownloadContext";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type WatchHistoryItem = {
  id: string;
  title: string;
  episode: string;
  progress: string;
  duration: string;
  image: any;
  streamUrl?: string;
  headers?: Record<string, string>;
};

const baseDir = ((FileSystem as any)["documentDirectory"] ||
  (FileSystem as any)["cacheDirectory"] ||
  "") as string;
const WATCH_HISTORY_FILE = baseDir
  ? `${baseDir}watchHistory.json`
  : "watchHistory.json";

const Saved = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);
  const [positionLabel, setPositionLabel] = useState("0:00");
  const [durationLabel, setDurationLabel] = useState("0:00");
  const { downloads } = useDownloads();
  const videoRef = useRef<Video | null>(null);

  // Track the latest history in a ref to avoid closure staleness in async operations
  const watchHistoryRef = useRef<WatchHistoryItem[]>([]);
  useEffect(() => {
    watchHistoryRef.current = watchHistory;
  }, [watchHistory]);

  const streamParams = useMemo(() => {
    const streamUrlParam = params.streamUrl;
    const titleParam = params.title;
    const episodeParam = params.episode;
    const resolutionParam = params.resolution;
    const headersParam = params.streamHeaders;

    const streamUrl = typeof streamUrlParam === "string" ? streamUrlParam : "";
    const title = typeof titleParam === "string" ? titleParam : "";
    const episode = typeof episodeParam === "string" ? episodeParam : "";
    const resolution =
      typeof resolutionParam === "string" ? resolutionParam : "";
    let headers: Record<string, string> | undefined;
    if (typeof headersParam === "string" && headersParam.length > 0) {
      try {
        headers = JSON.parse(headersParam);
      } catch {
        headers = undefined;
      }
    }

    return { streamUrl, title, episode, resolution, headers };
  }, [
    params.streamUrl,
    params.title,
    params.episode,
    params.resolution,
    params.streamHeaders,
  ]);

  const loadWatchHistory = useCallback(async () => {
    try {
      const info = await FileSystem.getInfoAsync(WATCH_HISTORY_FILE);
      if (!info.exists) {
        setWatchHistory([]);
        return;
      }

      const content = await FileSystem.readAsStringAsync(WATCH_HISTORY_FILE);
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        setWatchHistory(parsed);
      } else {
        setWatchHistory([]);
      }
    } catch {
      setWatchHistory([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWatchHistory();

    // Cleanup/Save on unmount
    return () => {
      if (watchHistoryRef.current.length > 0) {
        FileSystem.writeAsStringAsync(
          WATCH_HISTORY_FILE,
          JSON.stringify(watchHistoryRef.current),
        ).catch(() => {});
      }
    };
  }, [loadWatchHistory]);

  // Persist history when it changes (debounced or controlled)
  const saveHistory = useCallback(async (history: WatchHistoryItem[]) => {
    try {
      await FileSystem.writeAsStringAsync(
        WATCH_HISTORY_FILE,
        JSON.stringify(history),
      );
    } catch {}
  }, []);

  // Add/Update current video in history when streamParams change
  useEffect(() => {
    if (!streamParams.streamUrl) {
      return;
    }

    setWatchHistory((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.streamUrl === streamParams.streamUrl,
      );

      const nextTitle = streamParams.title || "Unknown Title";
      const nextEpisode = streamParams.episode || "";
      const nextHeaders = streamParams.headers;

      if (existingIndex !== -1) {
        const existing = prev[existingIndex];

        // Deep check to avoid unnecessary updates
        const headersChanged =
          JSON.stringify(existing.headers) !== JSON.stringify(nextHeaders);

        if (
          existing.title === nextTitle &&
          existing.episode === nextEpisode &&
          !headersChanged
        ) {
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          title: nextTitle,
          episode: nextEpisode,
          headers: nextHeaders || existing.headers,
        };
        // Trigger save immediately for metadata updates
        saveHistory(updated);
        return updated;
      }

      const item: WatchHistoryItem = {
        id: Date.now().toString(),
        title: nextTitle,
        episode: nextEpisode,
        progress: "0%",
        duration: "0:00",
        image: images.bg,
        streamUrl: streamParams.streamUrl,
        headers: nextHeaders,
      };

      const newHistory = [item, ...prev];
      saveHistory(newHistory);
      return newHistory;
    });
  }, [
    streamParams.streamUrl,
    streamParams.title,
    streamParams.episode,
    // Use JSON stringified headers for dependency stability
    JSON.stringify(streamParams.headers),
    saveHistory,
  ]);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const paddedSecs = secs < 10 ? `0${secs}` : String(secs);
    return `${mins}:${paddedSecs}`;
  };

  // Debounced update for watch history progress
  const lastUpdateRef = useRef<number>(0);
  const updateHistoryProgress = useCallback(
    (percent: number, durationStr: string) => {
      const now = Date.now();
      // Throttle updates to every 5 seconds to avoid excessive writes/renders
      if (now - lastUpdateRef.current < 5000 && percent < 99) {
        return;
      }
      lastUpdateRef.current = now;

      setWatchHistory((prev) => {
        const updated = prev.map((item) =>
          item.streamUrl === streamParams.streamUrl
            ? {
                ...item,
                progress: `${Math.round(percent)}%`,
                duration: durationStr,
              }
            : item,
        );
        saveHistory(updated);
        return updated;
      });
    },
    [streamParams.streamUrl, saveHistory],
  );

  const handlePlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (!status || !status.isLoaded || !status.durationMillis) {
        return;
      }

      const positionSeconds = status.positionMillis / 1000;
      const durationSeconds = status.durationMillis / 1000;
      const percent = Math.min(
        100,
        Math.max(0, (positionSeconds / durationSeconds) * 100),
      );

      setIsPlaying(status.isPlaying);
      setProgressPercent(percent);
      setPositionLabel(formatTime(positionSeconds));
      const durationStr = formatTime(durationSeconds);
      setDurationLabel(durationStr);

      if (!streamParams.streamUrl) {
        return;
      }

      updateHistoryProgress(percent, durationStr);
    },
    [streamParams.streamUrl, updateHistoryProgress],
  );

  const handleFullscreenUpdate = async (event: any) => {
    if (!event) {
      return;
    }

    if (event.fullscreenUpdate === 1) {
      try {
        await ScreenOrientation.unlockAsync();
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.ALL,
        );
      } catch {}
      return;
    }

    if (event.fullscreenUpdate === 3) {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        );
      } catch {}
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) {
      return;
    }

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch {}
  };

  const seekBySeconds = async (amount: number) => {
    if (!videoRef.current) {
      return;
    }

    try {
      const status: any = await videoRef.current.getStatusAsync();
      if (!status || !status.isLoaded) {
        return;
      }
      const position = status.positionMillis || 0;
      const duration = status.durationMillis || 0;
      let next = position + amount * 1000;
      if (next < 0) {
        next = 0;
      }
      if (duration > 0 && next > duration) {
        next = duration;
      }
      await videoRef.current.setPositionAsync(next);
    } catch {}
  };

  const toggleControls = () => {
    setControlsVisible((prev) => !prev);
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) {
      return;
    }

    try {
      await videoRef.current.presentFullscreenPlayer();
    } catch {}
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWatchHistory().finally(() => setRefreshing(false));
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      {/* Header */}
      <View className="flex-row items-center justify-center mt-12 mb-4 px-5 relative">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-5 bg-black/30 p-2 rounded-full z-10"
        >
          <Image
            source={icons.arrow}
            className="w-5 h-5"
            tintColor="white"
            style={{ transform: [{ rotate: "180deg" }] }}
          />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Downloads</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        {streamParams.streamUrl ? (
          <View className="px-5 mb-6">
            <Text className="text-white text-lg font-bold mb-2">
              Now Streaming
            </Text>
            <View className="w-full aspect-video rounded-xl overflow-hidden bg-black">
              <TouchableOpacity
                activeOpacity={1}
                className="w-full h-full"
                onPress={toggleControls}
              >
                <Video
                  ref={videoRef}
                  source={{
                    uri: streamParams.streamUrl,
                    headers: streamParams.headers,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode={"contain" as any}
                  shouldPlay
                  onError={(e) => console.log("Video error", e)}
                  onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                  useNativeControls={false}
                  onFullscreenUpdate={handleFullscreenUpdate}
                />
                {controlsVisible && (
                  <View className="absolute inset-0 justify-between">
                    <View className="flex-row items-center justify-between px-3 pt-2">
                      <Text
                        className="text-white text-xs font-semibold flex-1"
                        numberOfLines={1}
                      >
                        {streamParams.title || "Now Playing"}
                      </Text>
                      <TouchableOpacity
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={toggleFullscreen}
                      >
                        <Text className="text-white text-xs">⛶</Text>
                      </TouchableOpacity>
                    </View>

                    <View className="px-3 pb-3">
                      <View className="h-1 bg-white/30 rounded-full overflow-hidden mb-2">
                        <View
                          className="h-full bg-red-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </View>

                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-x-4">
                          <TouchableOpacity
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            onPress={() => seekBySeconds(-10)}
                          >
                            <Text className="text-white text-xs">-10s</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            onPress={togglePlayPause}
                          >
                            <View className="w-9 h-9 rounded-full bg-white/20 justify-center items-center">
                              <Text className="text-white text-sm">
                                {isPlaying ? "II" : "▶"}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            onPress={() => seekBySeconds(10)}
                          >
                            <Text className="text-white text-xs">+10s</Text>
                          </TouchableOpacity>
                        </View>
                        <Text className="text-white text-[10px]">
                          {positionLabel} / {durationLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <Text className="text-white font-semibold mt-2">
              {streamParams.title}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">
              {streamParams.episode}
              {streamParams.resolution ? ` • ${streamParams.resolution}` : ""}
            </Text>
          </View>
        ) : null}
        {/* Watch History */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="text-white text-lg font-bold">Watch History</Text>
            <TouchableOpacity>
              <Text className="text-gray-400 text-sm">All {">"}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}
          >
            {watchHistory.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="w-40 mr-2"
                onPress={() => {
                  if (!item.streamUrl) {
                    return;
                  }
                  router.push({
                    pathname: "/saved",
                    params: {
                      streamUrl: item.streamUrl,
                      streamHeaders: item.headers
                        ? JSON.stringify(item.headers)
                        : undefined,
                      title: item.title,
                      episode: item.episode,
                    },
                  });
                }}
              >
                <View className="w-40 h-24 rounded-lg overflow-hidden relative">
                  <Image
                    source={item.image}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-1 right-1 bg-black/60 px-1 rounded">
                    <Text className="text-white text-xs">{item.duration}</Text>
                  </View>
                  <View className="absolute bottom-0 w-full h-1 bg-gray-600">
                    <View
                      className="h-full bg-green-500"
                      style={{ width: item.progress as any }}
                    />
                  </View>
                </View>
                <Text
                  className="text-white font-semibold mt-2"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-gray-400 text-xs">{item.episode}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tabs: Downloads / Local videos */}
        <View className="flex-row px-5 border-b border-gray-700 mb-4">
          <View className="border-b-2 border-green-500 pb-2 mr-6">
            <Text className="text-white font-bold">Downloads</Text>
          </View>
          <View className="pb-2">
            <Text className="text-gray-400">Local videos</Text>
          </View>
        </View>

        {/* Downloaded List */}
        <View className="px-5 mb-10">
          <Text className="text-gray-400 mb-4">
            Downloaded ({downloads.length})
          </Text>
          {downloads.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center mb-4 bg-white/5 p-3 rounded-xl"
              onPress={() =>
                router.push({
                  pathname: "/anime/[id]",
                  params: {
                    id: item.animeId || item.id,
                    name: item.title,
                    poster_path: "mock_path",
                    vote_average: "8.5",
                    first_air_date: "2023",
                    original_language: "en",
                  },
                })
              }
            >
              <View className="w-24 h-16 rounded-lg overflow-hidden mr-4 relative">
                <Image
                  source={item.image}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute bottom-0 w-full h-1 bg-gray-600">
                  <View
                    className="h-full bg-green-500"
                    style={{
                      width: `${item.watched.split("%")[0]}%` as any,
                    }}
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">
                  {item.title}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {icons.save && (
                    <Image
                      source={icons.save}
                      className="w-3 h-3 mr-1 inline"
                      tintColor="gray"
                    />
                  )}
                  {item.files} · {item.size}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {item.watched}
                </Text>
              </View>
              <TouchableOpacity className="bg-white/10 px-3 py-1 rounded-full">
                <Text className="text-green-500 text-xs font-bold">
                  Save to...
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Saved;
