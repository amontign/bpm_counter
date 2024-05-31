import '@/styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
		<>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="description" content="BPM counter" />
				<meta name="theme-color" content="#424874" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="apple-touch-icon" href="" />
				<link rel="icon" href="/favicon.ico" />
				<meta name="robots" content="noindex" />
				<title>BPM Counter</title>
			</Head>
			<Component {...pageProps} />
		</>
	);
}

export default MyApp;