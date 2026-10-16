import type { CapacitorConfig } from "@capacitor/cli"

const serverUrl = process.env.CAP_SERVER_URL

const config: CapacitorConfig = {
  appId: "com.pulsefit.app",
  appName: "燃律",
  webDir: "www",
  backgroundColor: "#f7f6fb",
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith("http://"),
        androidScheme: "https",
        errorPath: "offline.html",
      }
    : { androidScheme: "https", errorPath: "offline.html" },
  ios: {
    backgroundColor: "#f7f6fb",
    contentInset: "never",
    allowsLinkPreview: false,
    preferredContentMode: "mobile",
  },
  android: {
    backgroundColor: "#f7f6fb",
    allowMixedContent: Boolean(serverUrl?.startsWith("http://")),
  },
}

export default config
