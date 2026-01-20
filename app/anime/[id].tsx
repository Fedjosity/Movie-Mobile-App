import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useDownloads } from "@/context/DownloadContext";
import {
  ConsumetEpisodeSource,
  getAnimeInfo as getConsumetAnimeInfo,
  getEpisodeSources as getConsumetEpisodeSources,
} from "@/services/consumet";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AnimeDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    id,
    name,
    poster_path,
    vote_average,
    first_air_date,
    original_language,
    offline, // Add offline param
  } = params;

  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Download Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [availableStreams, setAvailableStreams] = useState<any[]>([]);
  const { addDownload } = useDownloads();

  const fetchEpisodes = useCallback(
    async (pageToLoad: number, replace = false) => {
      try {
        if (offline === "true") {
          setEpisodes([
            {
              id: 101,
              episode_number: 1,
              name: "Pilot",
              air_date: "2017-08-18",
            },
            {
              id: 102,
              episode_number: 2,
              name: "Mean Right Hook",
              air_date: "2017-08-18",
            },
            {
              id: 103,
              episode_number: 3,
              name: "Worst Behavior",
              air_date: "2017-08-18",
            },
            {
              id: 104,
              episode_number: 4,
              name: "Royal Dragon",
              air_date: "2017-08-18",
            },
            {
              id: 105,
              episode_number: 5,
              name: "Take Shelter",
              air_date: "2017-08-18",
            },
            {
              id: 106,
              episode_number: 6,
              name: "Ashes, Ashes",
              air_date: "2017-08-18",
            },
            {
              id: 107,
              episode_number: 7,
              name: "Fish in the Jailhouse",
              air_date: "2017-08-18",
            },
            {
              id: 108,
              episode_number: 8,
              name: "The Defenders",
              air_date: "2017-08-18",
            },
          ]);
          setLoading(false);
          setHasMore(false);
          return;
        }

        if (!id) {
          setEpisodes([]);
          setError("Missing anime identifier");
          setLoading(false);
          setHasMore(false);
          return;
        }

        setError(null);
        if (pageToLoad === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const infoResult = await getConsumetAnimeInfo(String(id), pageToLoad);
        if (infoResult.status === "error" || !infoResult.data) {
          setEpisodes([]);
          setError(infoResult.message || "Failed to load episodes");
          setLoading(false);
          setLoadingMore(false);
          setHasMore(false);
          return;
        }

        const mapped = (infoResult.data.episodes || []).map((ep, index) => ({
          id: ep.id,
          name: ep.title || `Episode ${ep.number ?? index + 1}`,
          episode_number: ep.number ?? index + 1,
          air_date: infoResult.data?.releaseDate || "Unknown",
          still_path: null,
          overview: ep.title || "",
        }));

        setEpisodes((prev) =>
          pageToLoad === 1 || replace ? mapped : [...prev, ...mapped],
        );

        const totalEpisodes = infoResult.data.totalEpisodes ?? 0;
        const pageSize = mapped.length;
        const assumedPageSize = 24;
        const episodesLoadedSoFar =
          (pageToLoad - 1) * assumedPageSize + pageSize;

        let more = false;
        if (totalEpisodes > 0) {
          more = episodesLoadedSoFar < totalEpisodes;
        } else if (
          typeof infoResult.data.episodePages === "number" &&
          infoResult.data.episodePages > 0
        ) {
          more = pageToLoad < infoResult.data.episodePages;
        } else {
          more = pageSize >= assumedPageSize;
        }

        setHasMore(more);
        setPage(pageToLoad);
      } catch (e: any) {
        setEpisodes([]);
        setError(e.message || "Failed to load episodes");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [id, offline],
  );

  useEffect(() => {
    fetchEpisodes(1, true);
  }, [fetchEpisodes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEpisodes(1, true);
    setRefreshing(false);
  };

  const handleLoadMoreEpisodes = () => {
    if (loading || loadingMore || !hasMore || offline === "true") {
      return;
    }
    fetchEpisodes(page + 1);
  };

  const handleDownloadPress = async (episode: any) => {
    setSelectedEpisode(episode);
    setModalVisible(true);
    setLoadingStreams(true);
    setStreamError(null);
    setAvailableStreams([]);

    try {
      const response = await getConsumetEpisodeSources(String(episode.id));
      if (
        response.status === "ok" &&
        response.data &&
        response.data.length > 0
      ) {
        const formatted = response.data.map(
          (source: ConsumetEpisodeSource) => ({
            resolution: source.quality || "Unknown",
            size: "Unknown size",
            url: source.url,
            headers: source.headers,
            isDownload:
              (source.isM3U8 === false || source.isM3U8 === undefined) &&
              source.url.toLowerCase().includes(".mp4"),
          }),
        );
        setAvailableStreams(formatted);
      } else {
        setStreamError(response.message || "No sources available");
      }
    } catch (err: any) {
      setStreamError(err.message || "Failed to fetch sources");
    } finally {
      setLoadingStreams(false);
    }
  };

  const handleResolutionSelect = (stream: any) => {
    if (!selectedEpisode) {
      return;
    }

    if (stream.isDownload) {
      addDownload({
        id: Date.now().toString(),
        animeId: String(id),
        title: (name as string) || "Unknown Anime",
        episode: `Episode ${selectedEpisode.episode_number}`,
        files: "1 file",
        size: stream.size || "Unknown size",
        watched: "0% watched",
        image: images.bg,
        resolution: stream.resolution,
        progress: 0,
      });

      setModalVisible(false);
      setSelectedEpisode(null);
      setAvailableStreams([]);
      router.push("/saved");
      return;
    }

    router.push({
      pathname: "/saved",
      params: {
        streamUrl: stream.url,
        streamHeaders: stream.headers
          ? JSON.stringify(stream.headers)
          : undefined,
        title: name as string,
        episode: `Episode ${selectedEpisode.episode_number}`,
        resolution: stream.resolution,
      },
    });

    setModalVisible(false);
    setSelectedEpisode(null);
    setAvailableStreams([]);
  };

  const posterUri = (poster_path as string)?.startsWith("http")
    ? (poster_path as string)
    : `https://image.tmdb.org/t/p/w500${poster_path}`;

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      {/* Back Button */}
      <View className="absolute top-12 left-5 z-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-black/30 p-2 rounded-full"
        >
          <Image
            source={icons.arrow}
            className="w-5 h-5"
            tintColor="white"
            style={{ transform: [{ rotate: "180deg" }] }}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-white/10 p-4 rounded-xl mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Image
                source={icons.play}
                className="w-8 h-8 opacity-80"
                resizeMode="contain"
              />
              <View>
                <Text className="text-white font-bold text-lg">
                  Episode {item.episode_number}
                </Text>
                {item.name ? (
                  <Text className="text-gray-400 text-sm">{item.name}</Text>
                ) : null}
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-xs mr-2">
                {item.air_date?.split(" ")[0]}
              </Text>
              <TouchableOpacity
                className="bg-white/20 p-2 rounded-full"
                onPress={() => handleDownloadPress(item)}
              >
                <Image
                  source={icons.save}
                  className="w-4 h-4"
                  tintColor="white"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        ListHeaderComponent={
          <View>
            <View className="w-full h-[400px]">
              <Image
                source={{ uri: posterUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-primary to-transparent" />
            </View>
            <View className="px-5 mt-2">
              <Text className="text-3xl text-white font-bold shadow-sm">
                {name}
              </Text>
              <View className="flex-row items-center gap-4 mt-3">
                <View className="flex-row items-center gap-1 bg-white/20 px-2 py-1 rounded">
                  <Image
                    source={icons.star}
                    className="size-4"
                    resizeMode="contain"
                  />
                  <Text className="text-white font-bold">{vote_average}</Text>
                </View>
                <Text className="text-light-300 font-medium">
                  {first_air_date}
                </Text>
                <Text className="text-light-300 font-medium uppercase">
                  {original_language}
                </Text>
              </View>
              <Text className="text-xl text-white font-bold mt-8 mb-4">
                Episodes
              </Text>
              {loading && !refreshing && episodes.length === 0 ? (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  className="mt-5"
                />
              ) : error && episodes.length === 0 ? (
                <Text className="text-red-500">Error: {error}</Text>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <Text className="text-gray-500 italic px-5 mt-4">
              No episodes available.
            </Text>
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#0000ff" className="my-4" />
          ) : null
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        onEndReached={handleLoadMoreEpisodes}
        onEndReachedThreshold={0.3}
      />

      {/* Resolution Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-[#1a1a2e] rounded-t-3xl p-6 border-t border-gray-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">
                Select Resolution
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-gray-400">Close</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-gray-400 mb-4 text-sm">
              Downloading:{" "}
              {selectedEpisode
                ? `Episode ${selectedEpisode.episode_number}`
                : ""}
            </Text>

            {loadingStreams ? (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-5"
              />
            ) : streamError ? (
              <View className="items-center my-5">
                <Text className="text-red-500 mb-2">{streamError}</Text>
                <TouchableOpacity
                  className="bg-white/10 px-4 py-2 rounded-lg"
                  onPress={() => handleDownloadPress(selectedEpisode)}
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : availableStreams.length === 0 ? (
              <Text className="text-gray-400 text-center my-5">
                No download links found.
              </Text>
            ) : (
              availableStreams.map((stream, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-white/10 p-4 rounded-xl mb-3 flex-row justify-between items-center"
                  onPress={() => handleResolutionSelect(stream)}
                >
                  <View className="flex-row items-center">
                    <Text
                      className={`font-bold mr-2 ${
                        stream.resolution.includes("1080")
                          ? "text-green-500"
                          : stream.resolution.includes("720")
                            ? "text-blue-500"
                            : "text-yellow-500"
                      }`}
                    >
                      {stream.resolution.includes("1080")
                        ? "FHD"
                        : stream.resolution.includes("720")
                          ? "HD"
                          : "SD"}
                    </Text>
                    <Text className="text-white font-bold">
                      {stream.resolution}
                    </Text>
                    <Text
                      className={`text-xs font-bold ml-2 ${
                        stream.isDownload ? "text-green-400" : "text-blue-400"
                      }`}
                    >
                      {stream.isDownload ? "Download" : "Stream"}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-xs">{stream.size}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AnimeDetails;
