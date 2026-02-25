"use client"

export default function DeckPanel({
  mainDeck,
  extraDeck,
  setMainDeck,
  setExtraDeck,
  totalMain,
  totalExtra,
  title,
  cards
}: any) {

  const MAIN_LIMIT = 60
  const EXTRA_LIMIT = 6

  function resetDeck() {
    if (confirm("Reset entire deck?")) {
      setMainDeck({})
      setExtraDeck({})
    }
  }

  function saveDeck() {
    const data = { title, mainDeck, extraDeck }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${title || "deck"}.json`
    link.click()
  }

  // Convert deck into grouped display format
  function buildGroupedDeck() {
    const grouped: Record<string, any[]> = {}

    Object.entries(mainDeck).forEach(([id, qty]) => {
      const card = cards.find((c: any) => c.id === id)
      if (!card) return

      const type = card.type || "Other"

      if (!grouped[type]) grouped[type] = []
      grouped[type].push({ id, qty })
    })

    return grouped
  }

  const groupedDeck = buildGroupedDeck()

  return (
    <div className="w-full lg:w-96 p-4 bg-gradient-to-b from-gray-900 to-black text-white rounded-lg">

      {/* COUNTER */}
      <div className="mb-4">
        <div className={`font-bold ${totalMain > MAIN_LIMIT ? "text-red-500" : ""}`}>
          Main: {totalMain} / {MAIN_LIMIT}
        </div>
        <div className={`font-bold ${totalExtra > EXTRA_LIMIT ? "text-red-500" : ""}`}>
          Extra: {totalExtra} / {EXTRA_LIMIT}
        </div>
      </div>

      {/* VISUAL DECK PREVIEW */}
      {Object.entries(groupedDeck).map(([type, cardsList]) => (
        <div key={type} className="mb-6">

          <h3 className="text-lg font-bold mb-2">
            {type} - {cardsList.reduce((sum: number, c: any) => sum + c.qty, 0)}
          </h3>

          <div className="flex flex-wrap gap-3">
            {cardsList.map((card: any) => (
              <div key={card.id} className="relative">
                <img
                  src={`/cards/${card.id}.jpg`}
                  className="w-28 rounded-lg shadow-lg"
                />

                {/* Quantity badge */}
                <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded-md text-sm font-bold">
                  x{card.qty}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* BUTTONS */}
      <button
        className="mt-4 bg-red-600 text-white p-2 w-full rounded-md"
        onClick={resetDeck}
      >
        Reset Deck
      </button>

      <button
        className="mt-2 bg-green-600 text-white p-2 w-full rounded-md"
        onClick={saveDeck}
      >
        Save Deck
      </button>

    </div>
  )
}