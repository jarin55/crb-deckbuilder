"use client"

import { useState, useMemo, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Props {
  mainDeck: Record<string, number>
  extraDeck: Record<string, number>
  setMainDeck: any
  setExtraDeck: any
  cards: any[]
  title: string
}

export default function DeckPanel({
  mainDeck,
  extraDeck,
  setMainDeck,
  setExtraDeck,
  cards,
  title
}: Props) {

  const MAIN_LIMIT = 60
  const EXTRA_LIMIT = 6
  const COPY_LIMIT = 4

  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState("")
  const [user, setUser] = useState<any>(null)
  const [showLoad, setShowLoad] = useState(false)
  const [savedDecks, setSavedDecks] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  // ================= COUNTERS =================

  const mainCount = useMemo(
    () => Object.values(mainDeck).reduce((a, b) => a + b, 0),
    [mainDeck]
  )

  const extraCount = useMemo(
    () => Object.values(extraDeck).reduce((a, b) => a + b, 0),
    [extraDeck]
  )

  const mainOver = mainCount > MAIN_LIMIT
  const extraOver = extraCount > EXTRA_LIMIT

  // ================= ADD / REMOVE =================

  function addOne(id: string, isExtra: boolean) {
    if (isExtra) {
      if (extraCount >= EXTRA_LIMIT) return
      if ((extraDeck[id] || 0) >= COPY_LIMIT) return

      setExtraDeck((prev: any) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1
      }))
    } else {
      if (mainCount >= MAIN_LIMIT) return
      if ((mainDeck[id] || 0) >= COPY_LIMIT) return

      setMainDeck((prev: any) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1
      }))
    }
  }

  function removeOne(id: string, isExtra: boolean) {
    if (isExtra) {
      setExtraDeck((prev: any) => {
        const copy = { ...prev }
        copy[id]--
        if (copy[id] <= 0) delete copy[id]
        return copy
      })
    } else {
      setMainDeck((prev: any) => {
        const copy = { ...prev }
        copy[id]--
        if (copy[id] <= 0) delete copy[id]
        return copy
      })
    }
  }

  function resetDeck() {
    if (confirm("Reset entire deck?")) {
      setMainDeck({})
      setExtraDeck({})
    }
  }

  // ================= EXPORT (HIGH RES) =================

  async function exportDeckImage() {

    const scale = 2
    const cardWidth = 220
    const cardHeight = 310
    const padding = 20
    const columns = 6
    const titleSpace = 120

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const grouped: Record<string, any[]> = {
      Cookie: [],
      Trap: [],
      Item: [],
      Stage: [],
      Flip: []
    }

    Object.entries(mainDeck).forEach(([id, qty]) => {
      const card = cards.find((c: any) => c.id === id)
      if (!card) return
      grouped[card.type]?.push({ ...card, qty })
    })

    grouped["Cookie"]?.sort((a, b) => b.level - a.level)

    const orderedTypes = ["Cookie", "Trap", "Item", "Stage", "Flip"]

    const orderedMain: any[] = []
    orderedTypes.forEach(type => {
      if (grouped[type]) orderedMain.push(...grouped[type])
    })

    const rows = Math.ceil(orderedMain.length / columns)

    const mainWidth = columns * (cardWidth + padding) + padding
    const mainHeight = rows * (cardHeight + padding) + padding
    const extraWidth = cardWidth + padding * 2

    const canvasWidth = mainWidth + extraWidth
    const canvasHeight = Math.max(
      titleSpace + mainHeight,
      titleSpace + Object.keys(extraDeck).length * (cardHeight + padding)
    )

    canvas.width = canvasWidth * scale
    canvas.height = canvasHeight * scale
    ctx.scale(scale, scale)

    ctx.fillStyle = "#d2d2d2"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    ctx.font = "bold 60px Arial"
    ctx.fillStyle = "black"
    ctx.fillText(title || "Untitled Deck", padding, 80)

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(img)
      })

    let row = 0
    let col = 0

    for (const card of orderedMain) {
      const img = await loadImage(`/cards/${card.id}.jpg`)
      const x = padding + col * (cardWidth + padding)
      const y = titleSpace + padding + row * (cardHeight + padding)

      ctx.drawImage(img, x, y, cardWidth, cardHeight)

      ctx.strokeStyle = "white"
      ctx.fillStyle = "black"
      ctx.lineWidth = 6
      ctx.font = "bold 60px Arial"

      ctx.strokeText(String(card.qty), x + 15, y + cardHeight - 15)
      ctx.fillText(String(card.qty), x + 15, y + cardHeight - 15)

      col++
      if (col >= columns) {
        col = 0
        row++
      }
    }

    const extraX = mainWidth + padding
    let extraRow = 0

    for (const [id, qty] of Object.entries(extraDeck)) {
      const img = await loadImage(`/cards/${id}.jpg`)
      const x = extraX
      const y = titleSpace + padding + extraRow * (cardHeight + padding)

      ctx.drawImage(img, x, y, cardWidth, cardHeight)

      ctx.strokeText(String(qty), x + 15, y + cardHeight - 15)
      ctx.fillText(String(qty), x + 15, y + cardHeight - 15)

      extraRow++
    }

    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/jpeg", 1.0)
    link.download = `${title || "deck"}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ================= GROUP PREVIEW =================

  const groupedPreview: Record<string, any[]> = {
    Cookie: [],
    Trap: [],
    Item: [],
    Stage: [],
    Flip: []
  }

  Object.entries(mainDeck).forEach(([id, qty]) => {
    const card = cards.find((c: any) => c.id === id)
    if (!card) return
    groupedPreview[card.type]?.push({ ...card, qty })
  })

  groupedPreview["Cookie"]?.sort((a, b) => b.level - a.level)

  const orderedTypes = ["Cookie", "Trap", "Item", "Stage", "Flip"]

  return (
    <div className="w-full h-full p-4 bg-gradient-to-b from-gray-900 to-black text-white overflow-y-auto">

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={exportDeckImage} className="bg-blue-600 px-3 py-2 rounded-md">Export</button>
        <button onClick={() => setShowImport(true)} className="bg-purple-600 px-3 py-2 rounded-md">Import</button>
        <button className="bg-green-600 px-3 py-2 rounded-md">Save</button>
        <button className="bg-yellow-600 px-3 py-2 rounded-md">Load</button>
        <button onClick={resetDeck} className="bg-red-600 px-3 py-2 rounded-md">Reset</button>
      </div>

      <div className="mb-4">
        <div>Main: {mainCount} / 60</div>
        <div>Extra: {extraCount} / 6</div>
      </div>

      {orderedTypes.map(type => {
        const cardsInType = groupedPreview[type]
        if (!cardsInType?.length) return null

        const typeTotal = cardsInType.reduce((sum, c) => sum + c.qty, 0)

        return (
          <div key={type} className="mb-6">
            <h3 className="text-lg font-bold mb-2">
              {type === "Cookie" ? "Cookies" : type} ({typeTotal})
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {cardsInType.map(card => (
                <div key={card.id} className="bg-gray-800 p-2 rounded-lg">
                  <img src={`/cards/${card.id}.jpg`} className="w-full rounded-md" />
                  <div className="text-sm font-bold mt-1">x{card.qty}</div>
                  <div className="flex justify-center gap-3 mt-2">
                    <button onClick={() => removeOne(card.id, false)} className="bg-gray-700 px-3 py-1 rounded-md">–</button>
                    <button onClick={() => addOne(card.id, false)} className="bg-blue-600 px-3 py-1 rounded-md">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

    </div>
  )
}