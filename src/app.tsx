function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">TX Decoder</h1>
          <p className="text-sm text-gray-500">
            Decode EVM transactions into human-readable descriptions
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-gray-600">
            Paste a raw transaction hex to decode it.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
