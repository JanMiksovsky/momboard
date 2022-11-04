const userId = "65fbe32d-bf35-47de-a27f-e86724613a7b";
const itemId = "2bd8b583-d812-4a08-a54b-063fe6732bc5";
const apiKey = "c449f192-4472-4f53-9cde-aa542d5994a8";
const storageUrl = `https://api.jsonstorage.net/v1/json/${userId}/${itemId}?apiKey=${apiKey}`;

export default async function dataFetch(options = {}) {
  try {
    const response = await fetch(storageUrl, options);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}
