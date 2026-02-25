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

  async function exportDeckImage() {
    const cardWidth = 220
    const cardHeight = 310
    const padding = 20
    const columns = 7

    const mainEntries = Object.entries(mainDeck)
    const extraEntries = Object.entries(extraDeck)

    const rows = Math.ceil(mainEntries.length / columns)

    const mainWidth = columns * (cardWidth + padding) + padding
    const mainHeight = rows * (cardHeight + padding) + padding

    const extraWidth = cardWidth + padding * 2
    const canvasWidth = mainWidth + extraWidth
    const canvasHeight =
      150 + Math.max(mainHeight, extraEntries.length * (cardHeight + padding))

    const canvas = document.createElement("canvas")
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#d2d2d2"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = "60px Arial"
    ctx.fillStyle = "black"
    ctx.fillText(title || "Untitled Deck", 40, 90)

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(img)
      })

    let row = 0
    let col = 0

    for (const [id, qty] of mainEntries) {
      const img = await loadImage(`/cards/${id}.jpg`)

      const x = padding + col * (cardWidth + padding)
      const y = 120 + padding + row * (cardHeight + padding)

      ctx.drawImage(img, x, y, cardWidth, cardHeight)

      ctx.font = "60px Arial"
      ctx.lineWidth = 6
      ctx.strokeStyle = "white"
      ctx.fillStyle = "black"

      ctx.strokeText(String(qty), x + 15, y + cardHeight - 15)
      ctx.fillText(String(qty), x + 15, y + cardHeight - 15)

      col++
      if (col >= columns) {
        col = 0
        row++
      }
    }

    const extraX = mainWidth + padding

    for (let i = 0; i < extraEntries.length; i++) {
      const [id, qty] = extraEntries[i]
      const img = await loadImage(`/cards/${id}.jpg`)

      const x = extraX
      const y = 120 + padding + i * (cardHeight + padding)

      ctx.drawImage(img, x, y, cardWidth, cardHeight)

      ctx.strokeText(String(qty), x + 15, y + cardHeight - 15)
      ctx.fillText(String(qty), x + 15, y + cardHeight - 15)
    }

    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/jpeg")
    link.download = `${title || "deck"}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
    <div className="w-full lg:w-96 p-4 pb-24 bg-gradient-to-b from-gray-900 to-black text-white rounded-lg">

      <div className="mb-4">
        <div className={`font-bold ${totalMain > MAIN_LIMIT ? "text-red-500" : ""}`}>
          Main: {totalMain} / {MAIN_LIMIT}
        </div>
        <div className={`font-bold ${totalExtra > EXTRA_LIMIT ? "text-red-500" : ""}`}>
          Extra: {totalExtra} / {EXTRA_LIMIT}
        </div>
      </div>

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
                <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded-md text-sm font-bold">
                  x{card.qty}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Always visible buttons */}
      {/* Desktop Buttons */}
      <div className="hidden lg:block mt-6 space-y-3">
        <button
          className="bg-blue-600 text-white p-3 w-full rounded-md"
          onClick={exportDeckImage}
        >
          Export Deck Image
        </button>

        <button
          className="bg-red-600 text-white p-3 w-full rounded-md"
          onClick={resetDeck}
        >
          Reset Deck
        </button>
      </div>

      {/* Mobile Fixed Export Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black p-3 shadow-2xl z-50">
        <button
          className="bg-blue-600 text-white p-3 w-full rounded-md"
          onClick={exportDeckImage}
        >
          Export Deck Image
        </button>
      </div>

    </div>
  )
}