# Anime Discovery App

A modern mobile application built with Expo and React Native for discovering and tracking Anime. This app utilizes the TMDB API for fetching anime data and Appwrite for tracking search trends.

## 🚀 Tech Stack

- **Framework**: [Expo](https://expo.dev) & [React Native](https://reactnative.dev)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Backend Services**:
  - [Appwrite](https://appwrite.io) (Search analytics)
  - [TMDB API](https://www.themoviedb.org/documentation/api) (Anime data)

## 📂 Project Structure

The project follows a standard Expo Router structure:

```
Movie-App/
├── app/                    # Main application source code
│   ├── (tabs)/             # Tab navigation layout
│   │   ├── index.tsx       # Home screen (Latest Animes)
│   │   ├── search.tsx      # Search screen
│   │   ├── saved.tsx       # Saved animes screen
│   │   └── profile.tsx     # User profile
│   ├── anime/              # Anime details routes
│   │   └── [id].tsx        # Dynamic route for anime details
│   ├── components/         # Reusable UI components
│   │   ├── AnimeCard.tsx   # Card component for anime display
│   │   └── SearchBar.tsx   # Search input component
│   └── services/           # API and backend logic
│       ├── api.ts          # TMDB API integration
│       ├── appwrite.ts     # Appwrite configuration & functions
│       └── useFetch.ts     # Custom hook for data fetching
├── assets/                 # Images, fonts, and icons
├── constants/              # App constants (theme, icons, images)
├── interfaces/             # TypeScript definitions
└── ...config files         # Tailwind, Babel, Expo configs
```

## ✨ Features

- **Home Feed**: Browse the latest popular anime.
- **Search**: Search for specific anime titles with real-time results.
- **Details**: View detailed information about each anime (rating, release date, etc.).
- **Saved**: Keep track of your favorite anime (in progress).

## 🛠 Get Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   Ensure you have a `.env` file with the following keys:
   - `EXPO_PUBLIC_TMDB_ACCESS_TOKEN`
   - `EXPO_PUBLIC_PROJECT_ID` (Appwrite)
   - `EXPO_PUBLIC_DATABASE_ID` (Appwrite)
   - `EXPO_PUBLIC_COLLECTION_ID` (Appwrite)

3. **Start the app**

   ```bash
   npx expo start
   ```

   In the output, you'll find options to open the app in a:
   - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## 📚 Learn more

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [NativeWind](https://www.nativewind.dev/): A utility-first styling library for React Native.
