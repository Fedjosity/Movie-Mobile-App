import { images } from "@/constants/images";
import React from "react";
import { FlatList, Image, StyleSheet, TextInput, View } from "react-native";

const search = () => {
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />
      <FlatList>
        <TextInput
          placeholder="Search for movies"
          className="bg-white rounded-lg p-3 mx-5 mt-5"
        />
      </FlatList>
    </View>
  );
};

export default search;

const styles = StyleSheet.create({});
