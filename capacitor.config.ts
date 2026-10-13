import type { CapacitorConfig } from "@capacitor/cli"

const serverUrl = process.env.CAP_SERVER_URL

const config: CapacitorConfig = {
  appId: "com.pulsefit.app",
  appName: "燃律",
  webDir: "www",
  backgroundColor: "#09090b",
  server: serverUrl
    ? { url: serverUrl, cleartext: serverUrl.startsWith("http://"), androidScheme: "https" }
    : { androidScheme: "https" },
  ios: {
    backgroundColor: "#09090b",
    contentInset: "automatic",
  },
  android: {
    backgroundColor: "#09090b",
    allowMixedContent: Boolean(serverUrl?.startsWith("http://")),
  },
}

export default config
