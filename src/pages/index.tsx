import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>LocalAITuber</title>
        <meta name="description" content="Local AI character application" />
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <section className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900/80 p-10 shadow-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Phase 0
          </p>
          <h1 className="text-4xl font-bold tracking-tight">LocalAITuber</h1>
          <p className="mt-5 leading-7 text-slate-300">
            基盤の準備が完了しました。キャラクターと会話するための機能は、フェーズごとに追加されます。
          </p>
          <div
            className="mt-8 flex items-center gap-3 rounded-xl bg-emerald-950/60 px-4 py-3 text-sm text-emerald-200"
            role="status"
          >
            <span
              className="h-2.5 w-2.5 rounded-full bg-emerald-400"
              aria-hidden="true"
            />
            ローカルサーバーは正常に動作しています
          </div>
        </section>
      </main>
    </>
  );
}
