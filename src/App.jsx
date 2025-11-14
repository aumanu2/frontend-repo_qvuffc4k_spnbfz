import { useState } from 'react'

function App() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setResult(null)
    setError(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const onUpload = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', image)
      const res = await fetch(`${backend}/analyze`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Upload failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <header className="px-6 py-5 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="font-semibold tracking-tight text-xl">FaceMaxx</div>
          <a href="/test" className="text-sm text-slate-500 hover:text-slate-700">Backend Test</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <section className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Rate your face with gentle, practical tips</h1>
          <p className="text-slate-600">Upload a clear, front-facing photo. We analyze features using simple face metrics and return a 1–10 score, quick notes, and actionable improvements.</p>
        </section>

        <div className="grid gap-6">
          <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="inline-flex items-center justify-center px-4 py-2 rounded-lg border bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                <span className="text-sm font-medium">Choose a photo</span>
              </label>
              {image && (
                <button onClick={onUpload} disabled={loading} className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition">
                  {loading ? 'Analyzing…' : 'Analyze'}
                </button>
              )}
              {!image && (
                <p className="text-sm text-slate-500">PNG or JPG. Good lighting. Face centered.</p>
              )}
            </div>

            {preview && (
              <div className="mt-5">
                <img src={preview} alt="preview" className="w-full max-h-[420px] object-contain rounded-lg border" />
              </div>
            )}

            {error && (
              <div className="mt-4 text-sm text-red-600">{error}</div>
            )}
          </div>

          {result && (
            <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Your results</h2>
                <div className="text-2xl font-bold">{result.score}/10</div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Feature title="Jawline" text={result.review?.jawline} />
                <Feature title="Cheekbones" text={result.review?.cheekbones} />
                <Feature title="Eyes" text={result.review?.eyes} />
                <Feature title="Skin" text={result.review?.skin} />
                <Feature title="Symmetry" text={result.review?.symmetry} />
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Tips</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  {result.tips?.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>

              <p className="mt-6 text-xs text-slate-500">Disclaimer: This tool provides subjective estimates based on simple facial metrics. Photos are processed to compute metrics and are not stored. Scores are for fun and educational purposes only.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-10 text-center text-sm text-slate-500">
        Built for fun and self-improvement. Be kind to yourself.
      </footer>
    </div>
  )
}

const Feature = ({ title, text }) => (
  <div className="rounded-lg border bg-slate-50 p-4">
    <div className="text-sm font-medium text-slate-700 mb-1">{title}</div>
    <div className="text-sm text-slate-600">{text}</div>
  </div>
)

export default App
