import * as FileSystem from "expo-file-system/legacy";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface DownloadItem {
  id: string;
  animeId: string;
  title: string;
  episode: string;
  files: string;
  size: string;
  watched: string;
  image: any;
  resolution?: string;
  progress: number;
}

interface DownloadContextType {
  downloads: DownloadItem[];
  addDownload: (item: DownloadItem) => void;
  removeDownload: (id: string) => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(
  undefined,
);

export const DownloadProvider = ({ children }: { children: ReactNode }) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const baseDir = ((FileSystem as any)["documentDirectory"] ||
    (FileSystem as any)["cacheDirectory"] ||
    "") as string;
  const downloadsFilePath = baseDir
    ? `${baseDir}downloads.json`
    : "downloads.json";

  useEffect(() => {
    const loadDownloads = async () => {
      try {
        const info = await FileSystem.getInfoAsync(downloadsFilePath);
        if (!info.exists) {
          return;
        }

        const content = await FileSystem.readAsStringAsync(downloadsFilePath);
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setDownloads(parsed);
        }
      } catch {
        setDownloads([]);
      }
    };

    loadDownloads();
  }, [downloadsFilePath]);

  useEffect(() => {
    const persist = async () => {
      try {
        await FileSystem.writeAsStringAsync(
          downloadsFilePath,
          JSON.stringify(downloads),
        );
      } catch {}
    };

    persist();
  }, [downloads, downloadsFilePath]);

  const addDownload = (item: DownloadItem) => {
    setDownloads((prev) => [item, ...prev]);
  };

  const removeDownload = (id: string) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <DownloadContext.Provider
      value={{ downloads, addDownload, removeDownload }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error("useDownloads must be used within a DownloadProvider");
  }
  return context;
};
