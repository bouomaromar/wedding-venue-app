// Address of the API. Set EXPO_PUBLIC_API_URL in mobile/.env (see .env.example).
// On a real phone this must be your laptop's Wi-Fi IP, not "localhost",
// because "localhost" on the phone means the phone itself.
// Expo only inlines variables written exactly as process.env.EXPO_PUBLIC_*.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";
