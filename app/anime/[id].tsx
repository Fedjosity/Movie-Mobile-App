import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getAnimeEpisodes } from "@/services/api";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

const AnimeDetails = () => {
  const params = useLocalSearchParams();
  const { id, name, poster_path, vote_average, first_air_date, original_language } = params;
  
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setLoading(true);
        // id is the session ID passed from AnimeCard
        if (id) {
            const episodesData = await getAnimeEpisodes(id as string);
            setEpisodes(episodesData || []);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [id]);

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
      <ScrollView className="flex-1">
        <View className="w-full h-[400px]">
             <Image
                source={{ uri: posterUri }}
                className="w-full h-full"
                resizeMode="cover"
            />
             <View className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-primary to-transparent" />
        </View>
       
        <View className="px-5 -mt-10">
            <Text className="text-3xl text-white font-bold shadow-sm">{name}</Text>
            
            <View className="flex-row items-center gap-4 mt-3">
                <View className="flex-row items-center gap-1 bg-white/20 px-2 py-1 rounded">
                     <Image source={icons.star} className="size-4" resizeMode="contain" />
                     <Text className="text-white font-bold">{vote_average}</Text>
                </View>
                <Text className="text-light-300 font-medium">{first_air_date}</Text>
                <Text className="text-light-300 font-medium uppercase">{original_language}</Text>
            </View>

            <Text className="text-xl text-white font-bold mt-8 mb-4">Episodes</Text>
            
            {loading ? (
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
                                <Image source={icons.play} className="w-8 h-8 opacity-80" resizeMode="contain" />
                                <View>
                                    <Text className="text-white font-bold text-lg">Episode {item.episode_number}</Text>
                                    {item.name ? <Text className="text-gray-400 text-sm">{item.name}</Text> : null}
                                </View>
                            </View>
                            <Text className="text-gray-500 text-xs">{item.air_date?.split(' ')[0]}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text className="text-gray-500 italic">No episodes available.</Text>}
                />
            )}
        </View>
        <View className="h-10" /> 
      </ScrollView>
    </View>
  );
};

export default AnimeDetails;