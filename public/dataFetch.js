const userId = "65fbe32d-bf35-47de-a27f-e86724613a7b";
const itemId = "2bd8b583-d812-4a08-a54b-063fe6732bc5"; // Production
// const itemId = "f10de4d4-23fb-4649-8ff3-a6832dd3a7b0"; // Test
const apiKey = "c449f192-4472-4f53-9cde-aa542d5994a8";
const storageUrl = `https://api.jsonstorage.net/v1/json/${userId}/${itemId}?apiKey=${apiKey}`;

export default async function dataFetch(options = {}) {
  if (!navigator.onLine) {
    return null;
  }
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
