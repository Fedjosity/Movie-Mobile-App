import { icons } from "@/constants/icons";
import { Link } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type AnimeCardProps = Anime & {
  cardWidth?: number;
};

const AnimeCard = ({
  id,
  poster_path,
  name,
  vote_average,
  first_air_date,
  original_language,
  episodes,
  status,
  overview,
  cardWidth,
}: AnimeCardProps) => {
  const imageSource = poster_path
    ? {
        uri: poster_path.startsWith("http")
          ? poster_path
          : `https://image.tmdb.org/t/p/w500${poster_path}`,
      }
    : {
        uri: "https://via.placeholder.com/600x400/1a1a1a/ffffff.png?text=No+Cover",
      };

  return (
    <View style={cardWidth ? { width: cardWidth } : undefined}>
      <Link
        href={{
          pathname: "/anime/[id]",
          params: {
            id: String(id),
            name,
            poster_path,
            vote_average,
            first_air_date,
            original_language,
            overview,
            episodes,
            status,
          },
        }}
        asChild
      >
        <TouchableOpacity className="mb-5 relative">
          <Image
            source={imageSource}
            className="w-full h-52 rounded-lg bg-gray-800"
            resizeMode="cover"
          />

          {status && (
            <View className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-md">
              <Text className="text-white text-[8px] font-bold uppercase">
                {status}
              </Text>
            </View>
          )}

          <Text className="text-white text-sm font-bold mt-2" numberOfLines={1}>
            {name || "Unknown Title"}
          </Text>

          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row items-center justify-start gap-x-1">
              <Image
                source={icons.star}
                className="size-4"
                resizeMode="contain"
              />
              <Text className="text-white text-xs font-bold uppercase">
                {typeof vote_average === "number"
                  ? `${vote_average.toFixed(1)}/10`
                  : "N/A"}
              </Text>
            </View>

            {episodes ? (
              <Text className="text-light-300 text-xs font-medium">
                {episodes} Eps
              </Text>
            ) : null}
          </View>

          {overview ? (
            <Text className="text-light-300 text-[10px] mt-1" numberOfLines={2}>
              {overview}
            </Text>
          ) : null}

          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-light-300 text-xs font-medium">
              {first_air_date ? first_air_date.split("-")[0] : ""}
            </Text>
            <Text className="text-xs font-medium text-light-300 uppercase">
              {original_language}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default AnimeCard;
