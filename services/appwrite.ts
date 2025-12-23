// track search made by user
import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_COLLECTION_ID!;

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_PROJECT_ID!);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.equal("searchTerm", query),
  ]);

  console.log(result);
  // check if a record of that search has already been stored
  if (result.documents.length > 0) {
    const existingMovie = result.documents[0];
    await database.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      existingMovie.$id,
      { count: existingMovie.count + 1 }
    );
  } else {
    await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
      searchTerm: query,
      movie_id: movie.id,
      count: 1,
      title: movie.title,
      poster_url: "https://image.tmdb.org/t/p/w500" + movie.poster_path,
    });
  }
  // if a document exists, increment the count
  // if a document does not exist, create a new one with the count set to 1
};
