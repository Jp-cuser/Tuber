import Head from 'next/head';
import { Studio } from '@/components/studio/Studio';

export default function Home() {
  return (
    <>
      <Head>
        <title>LocalAITuber</title>
        <meta name="description" content="Local AI character application" />
      </Head>
      <Studio />
    </>
  );
}
