import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleAuth() {
  const { loginWithGoogle } = useAuth();
  const EXPO_CLIENT_ID = process.env.GOOGLE_ID ?? "";

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: EXPO_CLIENT_ID,
    responseType: "id_token",
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = (response.params as any)?.id_token as string | undefined;
      if (idToken) {
        loginWithGoogle(idToken);
      }
    }
  }, [loginWithGoogle, response]);

  return { request, promptAsync };
}

