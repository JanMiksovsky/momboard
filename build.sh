# This "build" script writes some environment variables to `public/secrets.js`
# so the JavaScript files can read them.

source .env

echo "/* App secrets */" > public/secrets.js
echo "export const apiKey = \"$JSON_STORAGE_API_KEY\";" >> public/secrets.js
echo "export const itemId = \"$JSON_STORAGE_ITEM_ID\";" >> public/secrets.js
echo "export const userId = \"$JSON_STORAGE_USER_ID\";" >> public/secrets.js
