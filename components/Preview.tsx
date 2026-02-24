export default function Preview({ cardId }: { cardId: string | null }) {
  if (!cardId) return null

  return (
    <div className="fixed right-10 top-40 border-4 border-black bg-white p-2 shadow-xl">
      <img
        src={`/cards/${cardId}.jpg`}
        alt="preview"
        className="w-64"
      />
    </div>
  )
}