import { createCanvas, loadImage } from "canvas"
import path from "path"

export async function POST(req: Request) {
  const { mainDeck, extraDeck, title } = await req.json()

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

  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext("2d")

  // Background
  ctx.fillStyle = "#d2d2d2"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Title
  ctx.font = "60px Arial"
  ctx.fillStyle = "black"
  ctx.fillText(title || "Untitled Deck", 40, 90)

  // ===== MAIN DECK =====
  let row = 0
  let col = 0

  for (const [id, qty] of mainEntries) {
    const imgPath = path.join(process.cwd(), "public/cards", `${id}.jpg`)
    const img = await loadImage(imgPath)

    const x = padding + col * (cardWidth + padding)
    const y = 120 + padding + row * (cardHeight + padding)

    ctx.drawImage(img, x, y, cardWidth, cardHeight)

    // Quantity bottom-left
    ctx.font = "60px Arial"
    ctx.lineWidth = 6
    ctx.strokeStyle = "white"
    ctx.fillStyle = "black"

    const textX = x + 15
    const textY = y + cardHeight - 15

    ctx.strokeText(String(qty), textX, textY)
    ctx.fillText(String(qty), textX, textY)

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

    const imgPath = path.join(process.cwd(), "public/cards", `${id}.jpg`)
    const img = await loadImage(imgPath)

    const x = extraX
    const y = 120 + padding + i * (cardHeight + padding)

    ctx.drawImage(img, x, y, cardWidth, cardHeight)

    // Quantity bottom-left
    ctx.font = "60px Arial"
    ctx.lineWidth = 6
    ctx.strokeStyle = "white"
    ctx.fillStyle = "black"

    const textX = x + 15
    const textY = y + cardHeight - 15

    ctx.strokeText(String(qty), textX, textY)
    ctx.fillText(String(qty), textX, textY)
  }

  const buffer = canvas.toBuffer("image/jpeg")

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": "attachment; filename=deck.jpg"
    }
  })
}