import "../styles/globals.css";
import "react-h5-audio-player/lib/styles.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
export default MyApp;
