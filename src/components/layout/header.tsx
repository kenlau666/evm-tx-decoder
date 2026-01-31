export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <h1 className="text-xl font-semibold text-gray-900">TX Decoder</h1>
        <p className="text-sm text-gray-500">
          Decode EVM transactions into human-readable descriptions
        </p>
      </div>
    </header>
  );
}
