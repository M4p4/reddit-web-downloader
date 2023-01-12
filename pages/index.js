import Head from 'next/head';
import RedditDownloader from '../components/RedditDownloader';

export default function Home() {
  return (
    <>
      <Head>
        <title>Reddit Web Downloader</title>
        <meta
          name="description"
          content="Reddit web downloader is a tool that allows users to easily download images, videos, and GIFs from a specified subreddit or user by utilizing the Pushshift API."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-slate-900 text-gray-100 min-h-screen">
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="text-3xl text-center font-bold">
            Reddit Web Downloader
          </h1>
          <RedditDownloader />
        </div>
      </main>
    </>
  );
}
