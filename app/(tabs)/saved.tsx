import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useDownloads } from "@/context/DownloadContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Video from "react-native-video";

const Saved = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const { downloads } = useDownloads();

  const streamParams = useMemo(() => {
    const streamUrlParam = params.streamUrl;
    const titleParam = params.title;
    const episodeParam = params.episode;
    const resolutionParam = params.resolution;

    const streamUrl = typeof streamUrlParam === "string" ? streamUrlParam : "";
    const title = typeof titleParam === "string" ? titleParam : "";
    const episode = typeof episodeParam === "string" ? episodeParam : "";
    const resolution =
      typeof resolutionParam === "string" ? resolutionParam : "";

    return { streamUrl, title, episode, resolution };
  }, [params]);

  // Mock Data for Watch History UI
  const watchHistory = [
    {
      id: "1",
      title: "The Defenders",
      episode: "S01 EP01",
      progress: "95%",
      duration: "51:43",
      image: images.bg,
    },
    {
      id: "2",
      title: "The Defenders",
      episode: "S01 EP06",
      progress: "80%",
      duration: "51:27",
      image: images.bg,
    },
    {
      id: "3",
      title: "The Defenders",
      episode: "S01 EP05",
      progress: "50%",
      duration: "50:57",
      image: images.bg,
    },
    {
      id: "4",
      title: "The Defenders",
      episode: "S01 EP04",
      progress: "10%",
      duration: "45:03",
      image: images.bg,
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh since we are using Context
    setTimeout(() => setRefreshing(false), 500);
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
              <Video
                source={{ uri: streamParams.streamUrl }}
                style={{ width: "100%", height: "100%" }}
                controls
                resizeMode="contain"
              />
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
              <TouchableOpacity key={item.id} className="w-40 mr-2">
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
                      style={{ width: item.progress }}
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
                    id: item.id,
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
                    style={{ width: item.watched.split("%")[0] + "%" }}
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
