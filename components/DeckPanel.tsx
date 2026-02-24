"use client"

export default function DeckPanel({
  mainDeck,
  extraDeck,
  setMainDeck,
  setExtraDeck,
  title
}: any) {

  function removeOne(id: string, isExtra: boolean) {
    if (isExtra) {
      setExtraDeck((prev: any) => {
        if (!prev[id]) return prev
        const copy = { ...prev }
        copy[id]--
        if (copy[id] <= 0) delete copy[id]
        return copy
      })
    } else {
      setMainDeck((prev: any) => {
        if (!prev[id]) return prev
        const copy = { ...prev }
        copy[id]--
        if (copy[id] <= 0) delete copy[id]
        return copy
      })
    }
  }

  async function exportDeck() {
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

    // Background
    ctx.fillStyle = "#d2d2d2"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Title
    ctx.font = "60px Arial"
    ctx.fillStyle = "black"
    ctx.fillText(title || "Untitled Deck", 40, 90)

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(img)
      })

    // ===== MAIN DECK =====
    let row = 0
    let col = 0

    for (const [id, qty] of mainEntries) {
      const img = await loadImage(`/cards/${id}.jpg`)

      const x = padding + col * (cardWidth + padding)
      const y = 120 + padding + row * (cardHeight + padding)

      ctx.drawImage(img, x, y, cardWidth, cardHeight)

      // Quantity (bottom-left, black with white outline)
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

    // ===== EXTRA DECK =====
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

    // Download
    const link = document.createElement("a")
    link.download = `${title || "deck"}.jpg`
    link.href = canvas.toDataURL("image/jpeg")
    link.click()
  }

  return (
    <div className="w-80 border p-4">
      <h2 className="font-bold">Main Deck</h2>
      {Object.entries(mainDeck).map(([id, qty]) => (
        <div
          key={id}
          className="flex justify-between cursor-pointer hover:text-red-500"
          onClick={() => removeOne(id, false)}
        >
          <span>{id}</span>
          <span>x{qty as number}</span>
        </div>
      ))}

      <h2 className="font-bold mt-4">Extra Deck</h2>
      {Object.entries(extraDeck).map(([id, qty]) => (
        <div
          key={id}
          className="flex justify-between cursor-pointer hover:text-red-500"
          onClick={() => removeOne(id, true)}
        >
          <span>{id}</span>
          <span>x{qty as number}</span>
        </div>
      ))}

      <button
        className="mt-4 bg-blue-500 text-white p-2 w-full"
        onClick={exportDeck}
      >
        Export Deck Image
      </button>
    </div>
  )
}