import React, { createContext, ReactNode, useContext, useState } from "react";

export interface DownloadItem {
  id: string;
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
