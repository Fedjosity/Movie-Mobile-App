import { icons } from "@/constants/icons";
import React from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 items-center justify-center px-4">
        <View className="items-center">
          <Image
            source={icons.person}
            className="w-24 h-24 mb-6"
            tintColor="#FF9C01"
            resizeMode="contain"
          />
          <Text className="text-white text-2xl font-bold mb-2 text-center">
            Profile Under Construction
          </Text>
          <Text className="text-gray-100 text-base text-center mb-8">
            We&apos;re working hard to bring you an amazing profile experience.
            Stay tuned for updates!
          </Text>
        </View>

        <View className="w-full bg-black-100 p-6 rounded-2xl border border-black-200">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-secondary-100 items-center justify-center mr-4">
              <Image
                source={icons.logo}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </View>
            <View>
              <Text className="text-white font-semibold text-lg">
                Coming Soon
              </Text>
              <Text className="text-gray-100 text-sm">
                User preferences & settings
              </Text>
            </View>
          </View>
          <View className="h-[1px] bg-gray-800 w-full my-2" />
          <Text className="text-gray-100 text-sm mt-2">
            Features in development:
          </Text>
          <View className="mt-2 space-y-1">
            <Text className="text-secondary font-medium">
              • Watch History Sync
            </Text>
            <Text className="text-secondary font-medium">
              • Custom Playlists
            </Text>
            <Text className="text-secondary font-medium">
              • Account Management
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
