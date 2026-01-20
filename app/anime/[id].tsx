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
  ScrollView,
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

  // Download Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [availableStreams, setAvailableStreams] = useState<any[]>([]);
  const { addDownload } = useDownloads();

  const fetchEpisodes = useCallback(async () => {
    try {
      if (offline === "true") {
        setEpisodes([
          { id: 101, episode_number: 1, name: "Pilot", air_date: "2017-08-18" },
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
        return;
      }

      if (!id) {
        setEpisodes([]);
        setError("Missing anime identifier");
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);

      const infoResult = await getConsumetAnimeInfo(String(id));
      if (infoResult.status === "error" || !infoResult.data) {
        setEpisodes([]);
        setError(infoResult.message || "Failed to load episodes");
        setLoading(false);
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

      setEpisodes(mapped);
    } catch (e: any) {
      setEpisodes([]);
      setError(e.message || "Failed to load episodes");
    } finally {
      setLoading(false);
    }
  }, [id, offline]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEpisodes();
    setRefreshing(false);
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
            isDownload: source.url.toLowerCase().includes(".mp4"),
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
        <View className="w-full h-[400px]">
          <Image
            source={{ uri: posterUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-primary to-transparent" />
        </View>

        <View className="px-5 -mt-10">
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
            <Text className="text-light-300 font-medium">{first_air_date}</Text>
            <Text className="text-light-300 font-medium uppercase">
              {original_language}
            </Text>
          </View>

          <Text className="text-xl text-white font-bold mt-8 mb-4">
            Episodes
          </Text>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#0000ff" className="mt-5" />
          ) : error ? (
            <Text className="text-red-500">Error: {error}</Text>
          ) : (
            <FlatList
              data={episodes}
              scrollEnabled={false}
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
                        <Text className="text-gray-400 text-sm">
                          {item.name}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-xs mr-2">
                      {item.air_date?.split(" ")[0]}
                    </Text>

                    {/* Download Button */}
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
              ListEmptyComponent={
                <Text className="text-gray-500 italic">
                  No episodes available.
                </Text>
              }
            />
          )}
        </View>
        <View className="h-10" />
      </ScrollView>

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
