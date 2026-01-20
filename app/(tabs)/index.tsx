import SearchBar from "@/app/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchAnimes } from "@/services/api";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import AnimeCard from "../components/AnimeCard";

export default function Index() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();

  // Fix: Use useCallback to prevent infinite loop in useFetch
  const fetchAnimesCallback = useCallback(() => fetchAnimes({ query: "" }), []);

  const {
    data: fetchResult,
    loading: animesLoading,
    error: animesError,
    refetch,
  } = useFetch(fetchAnimesCallback);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const animes = fetchResult?.data || [];
  const status = fetchResult?.status;
  const message = fetchResult?.message;

  const horizontalPadding = 20;
  const columnGap = 15;
  const cardWidth = (width - horizontalPadding * 2 - columnGap * 2) / 3;

  // Determine if we have a critical error (no data AND error state)
  const hasCriticalError =
    animesError || (status && status !== "ok" && animes.length === 0);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        {animesLoading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center "
          />
        ) : hasCriticalError ? (
          <View className="mt-10 px-4">
            <Text className="text-red-500 text-center text-lg font-bold mb-2">
              {status === "error"
                ? "Unable to load anime list"
                : "Something went wrong"}
            </Text>
            <Text className="text-gray-400 text-center">
              {message || animesError?.message || "Unknown error"}
            </Text>
          </View>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => router.push("/search")}
              placeholder="Search Animes..."
              value=""
              onChangeText={() => {}}
            />

            {/* Warning Banner for Offline/Mock Mode */}
            {status && status !== "ok" && (
              <View className="bg-orange-600 p-3 rounded-lg mb-4 mt-2">
                <Text className="text-white text-center font-semibold">
                  {status === "error"
                    ? "⚠️ Connection issue. Showing fallback data."
                    : "⚠️ Showing fallback data."}
                </Text>
                <Text className="text-white text-center text-xs mt-1 opacity-80">
                  {message}
                </Text>
              </View>
            )}

            <>
              <Text className="text-lg text-white font-bold mt-5 mb-3">
                Latest Animes
              </Text>

              <FlatList
                data={animes}
                renderItem={({ item }) => (
                  <AnimeCard {...item} cardWidth={cardWidth} />
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
                className="mt-2 gap-2 pb-32"
                scrollEnabled={false}
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
