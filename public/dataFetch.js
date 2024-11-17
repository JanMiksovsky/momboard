const storageUrl = `https://api.jsonstorage.net/v1/json/${userId}/${itemId}?apiKey=${apiKey}`;

import { apiKey, itemId, userId } from "./secrets.js";

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
