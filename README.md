# Anime Discovery App

A modern mobile application built with Expo and React Native for discovering and tracking anime.
The app now uses a self-hosted Consumet instance with the AnimePahe provider for both anime
metadata (titles, posters, descriptions) and streaming/MP4 download sources. Appwrite is used for
tracking search trends.

## 🚀 Tech Stack

- **Framework**: [Expo](https://expo.dev) & [React Native](https://reactnative.dev)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Backend Services**:
  - [Consumet](https://github.com/consumet/api.consumet.org) with AnimePahe provider
    (Anime metadata, episodes, and streaming/download sources)
  - [Appwrite](https://appwrite.io) (Search analytics)

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
│       ├── api.ts          # AnimePahe-backed home/search API adapter (via Consumet)
│       ├── anilist.ts      # (Unused) AniList GraphQL client and models
│       ├── consumet.ts     # Consumet client (AnimePahe provider)
│       ├── resolver.ts     # (Unused) AniList → streaming provider resolution
│       ├── appwrite.ts     # Appwrite configuration & functions
│       └── useFetch.ts     # Custom hook for data fetching
├── assets/                 # Images, fonts, and icons
├── constants/              # App constants (theme, icons, images)
├── interfaces/             # TypeScript definitions
└── ...config files         # Tailwind, Babel, Expo configs
```

## ✨ Features

- **Home Feed**: Browse a curated list of popular anime from AnimePahe (via Consumet).
- **Search**: Search for specific anime titles with debounced, real-time results from AnimePahe.
- **Details**: View basic information about each anime and its episodes.
- **Episodes & Downloads**: Fetch episodes and download MP4 sources from AnimePahe when available.
- **Saved**: Keep track of your downloaded episodes in the Saved tab.

## 🛠 Get Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   Ensure you have a `.env` file (or equivalent environment configuration) with the following keys:

   **Consumet (self-hosted, AnimePahe)**
   - `EXPO_PUBLIC_CONSUMET_API_BASE_URL` – base URL of your Consumet instance  
     (for example: `http://192.168.1.166:3000`). The code automatically trims trailing slashes and
     calls the AnimePahe REST routes under `/anime/animepahe/...`.

   **Appwrite (optional analytics)**
   - `EXPO_PUBLIC_PROJECT_ID` (Appwrite project ID)
   - `EXPO_PUBLIC_DATABASE_ID` (Appwrite database ID)
   - `EXPO_PUBLIC_COLLECTION_ID` (Appwrite collection ID)

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
