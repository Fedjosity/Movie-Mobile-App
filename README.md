# Anime Discovery App

A modern mobile application built with Expo and React Native for discovering and tracking anime.
The app uses a self-hosted Consumet instance with the AnimePahe provider for both anime
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

## 🛠 Detailed Setup Guide

Follow these steps to get the project running locally.

### 1. Prerequisites

- **Node.js**: Install Node.js (LTS version recommended) from [nodejs.org](https://nodejs.org/).
- **Git**: Ensure Git is installed.

### 2. Backend Setup (Consumet API)

The app relies on a self-hosted Consumet API instance.

1.  Clone the Consumet API repository:
    ```bash
    git clone https://github.com/consumet/api.consumet.org.git
    cd api.consumet.org
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the server:
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3000` by default.

    > **Note:** To access this API from a physical device (your phone), ensure your computer and phone are on the same Wi-Fi network. You will need your computer's local IP address (e.g., `192.168.1.166`).

### 3. App Setup

1.  Clone this repository (Movie-App):
    ```bash
    git clone <your-repo-url>
    cd Movie-App
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root of the `Movie-App` directory. Add the following variables:

    ```env
    # REQUIRED: Base URL of your running Consumet instance.
    # Replace <YOUR_IP> with your computer's local IP address (e.g., 192.168.1.5).
    # If running on an emulator, you can use http://10.0.2.2:3000 (Android) or http://localhost:3000 (iOS).
    EXPO_PUBLIC_CONSUMET_API_BASE_URL=http://<YOUR_IP>:3000

    # OPTIONAL: Appwrite Configuration (for search analytics)
    EXPO_PUBLIC_PROJECT_ID=your_project_id
    EXPO_PUBLIC_DATABASE_ID=your_database_id
    EXPO_PUBLIC_COLLECTION_ID=your_collection_id
    ```

4.  Start the app:
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
