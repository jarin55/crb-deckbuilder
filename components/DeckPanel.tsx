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
  const [showExportText, setShowExportText] = useState(false)
  const [exportText, setExportText] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  // ================= SAVE =================

  async function saveDeck() {
    if (!user) {
      alert("Please login to save deck.")
      return
    }

    if (!title.trim()) {
      alert("Please enter deck title.")
      return
    }

    const baseTitle = title.trim()

    const { data: existingDecks } = await supabase
      .from("decks")
      .select("title")
      .eq("user_id", user.id)
      .ilike("title", `${baseTitle}%`)

    let finalTitle = baseTitle

    if (existingDecks && existingDecks.length > 0) {
      const titles = existingDecks.map(d => d.title)

      if (titles.includes(baseTitle)) {
        let counter = 1
        while (titles.includes(`${baseTitle} (${counter})`)) {
          counter++
        }
        finalTitle = `${baseTitle} (${counter})`
      }
    }

    const { error } = await supabase.from("decks").insert({
      user_id: user.id,
      title: finalTitle,
      main_deck: mainDeck,
      extra_deck: extraDeck
    })

    if (error) {
      console.error(error)
      alert("Error saving deck.")
    } else {
      alert(`Deck saved as "${finalTitle}"`)
    }
  }

  async function fetchDecks() {
    if (!user) {
      alert("Please login first.")
      return
    }

    const { data, error } = await supabase
      .from("decks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error) {
      setSavedDecks(data || [])
      setShowLoad(true)
    }
  }

  function loadDeck(deck: any) {
    setMainDeck(deck.main_deck || {})
    setExtraDeck(deck.extra_deck || {})
    setShowLoad(false)
  }

  async function deleteDeck(id: string) {
    await supabase.from("decks").delete().eq("id", id)
    fetchDecks()
  }

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

  // ================= IMPORT =================

  function parseImport(replace: boolean) {
    const lines = importText.split("\n")

    const newMain: Record<string, number> = replace ? {} : { ...mainDeck }
    const newExtra: Record<string, number> = replace ? {} : { ...extraDeck }

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed) return

      const parts = trimmed.split(" ")
      const qty = parseInt(parts[0])
      const rest = parts.slice(1).join(" ")

      const idParts = rest.split("-")
      if (idParts.length < 2) return

      const id = idParts[0] + "-" + idParts[1]
      const card = cards.find((c: any) => c.id === id)

      if (!card || isNaN(qty)) return

      if (card.type === "Extra") {
        newExtra[id] = (newExtra[id] || 0) + qty
      } else {
        newMain[id] = (newMain[id] || 0) + qty
      }
    })

    setMainDeck(newMain)
    setExtraDeck(newExtra)
    setShowImport(false)
    setImportText("")
  }

  // ================= EXPORT =================

  async function exportDeckImage() {

    if (!title.trim()) {
      alert("Please enter deck title.")
      return
    }

    const scale = 2
    const cardWidth = 220
    const cardHeight = 310
    const padding = 20
    const columns = 7
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

    ctx.font = "60px Arial"
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

  // ================= EXPORT TEXT ==================
  
  function formatDisplay(display: string) {
  const parts = display.split("-")

  if (parts.length < 3) return display // fallback if unexpected format

  const code = `${parts[0]}-${parts[1]}`
  const name = parts.slice(2).join("-")

  return `${name} [${code}]`
}

function generateExportText() {
  const lines: string[] = []

  Object.entries(mainDeck).forEach(([id, qty]) => {
    const card = cards.find((c: any) => c.id === id)
    if (!card) return
    lines.push(`${qty} ${formatDisplay(card.display)}`)
  })

  Object.entries(extraDeck).forEach(([id, qty]) => {
    const card = cards.find((c: any) => c.id === id)
    if (!card) return
    lines.push(`${qty} ${formatDisplay(card.display)}`)
  })

  const text = lines.join("\n")
  setExportText(text)
  setShowExportText(true)
}
function copyExportText() {
  navigator.clipboard.writeText(exportText)
}

  // ================= PREVIEW GROUP =================

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
        <button onClick={exportDeckImage} className="bg-blue-600 px-3 py-2 rounded-md">ExportImage</button>
        <button onClick={generateExportText} className="bg-indigo-600 px-3 py-2 rounded-md">ExportText</button>
        <button onClick={() => setShowImport(true)} className="bg-purple-600 px-3 py-2 rounded-md">Import</button>
        <button onClick={saveDeck} className="bg-green-600 px-3 py-2 rounded-md">Save</button>
        <button onClick={fetchDecks} className="bg-yellow-600 px-3 py-2 rounded-md">Load</button>
        <button onClick={resetDeck} className="bg-red-600 px-3 py-2 rounded-md">Reset</button>
      </div>

      <div className="mb-4">
        <div className={mainOver ? "text-red-400 font-bold" : "font-bold"}>Main: {mainCount} / 60</div>
        <div className={extraOver ? "text-red-400 font-bold" : "font-bold"}>Extra: {extraCount} / 6</div>
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

            <div className="grid grid-cols-3 gap-3">
              {cardsInType.map(card => (
                <div key={card.id} className="bg-gray-800 p-2 rounded-lg">

                  <img
                    src={`/cards/${card.id}.jpg`}
                    className="w-full rounded-md shadow-lg"
                  />

                  <div className="text-sm font-bold mt-1">x{card.qty}</div>

                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      onClick={() => removeOne(card.id, false)}
                      className="bg-gray-700 px-3 py-1 rounded-md"
                    >
                      –
                    </button>

                    <button
                      onClick={() => addOne(card.id, false)}
                      className="bg-blue-600 px-3 py-1 rounded-md"
                    >
                      +
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )
      })}

      {Object.keys(extraDeck).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">
            Extra ({extraCount})
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {Object.entries(extraDeck).map(([id, qty]) => (
              <div key={id} className="bg-gray-800 p-2 rounded-lg">

                <img
                  src={`/cards/${id}.jpg`}
                  className="w-full rounded-md shadow-lg"
                />

                <div className="text-sm font-bold mt-1">x{qty}</div>

                <div className="flex justify-center gap-2 mt-2">
                  <button
                    onClick={() => removeOne(id, true)}
                    className="bg-gray-700 px-3 py-1 rounded-md"
                  >
                    –
                  </button>

                  <button
                    onClick={() => addOne(id, true)}
                    className="bg-blue-600 px-3 py-1 rounded-md"
                  >
                    +
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[500px]">
            <h2 className="text-xl mb-4">Import Deck</h2>
            <textarea
              className="w-full h-64 bg-gray-800 p-3 rounded-md"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => parseImport(false)} className="bg-blue-600 px-4 py-2 rounded-md">Import and add</button>
              <button onClick={() => parseImport(true)} className="bg-green-600 px-4 py-2 rounded-md">Import and replace</button>
              <button onClick={() => setShowImport(false)} className="bg-gray-600 px-4 py-2 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLoad && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[400px]">
            <h2 className="text-lg mb-4">Saved Decks</h2>
            {savedDecks.map(deck => (
              <div key={deck.id} className="flex justify-between mb-2">
                <span>{deck.title}</span>
                <div className="flex gap-2">
                  <button onClick={() => loadDeck(deck)} className="bg-green-600 px-2 py-1 rounded text-sm">Load</button>
                  <button onClick={() => deleteDeck(deck.id)} className="bg-red-600 px-2 py-1 rounded text-sm">Delete</button>
                </div>
              </div>
            ))}
            <button onClick={() => setShowLoad(false)} className="mt-4 bg-gray-600 px-3 py-2 rounded-md w-full">Close</button>
          </div>
        </div>
      )}
      {showExportText && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[600px] max-h-[80vh] flex flex-col">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Export</h2>
              <button
                onClick={() => setShowExportText(false)}
                className="text-gray-400 text-xl"
              >
                ×
              </button>
            </div>

            <textarea
              className="w-full h-[400px] bg-gray-800 p-4 rounded-md text-sm resize-none overflow-y-auto"
              value={exportText}
              readOnly
            />

            <button
              onClick={copyExportText}
              className="mt-4 bg-gray-700 hover:bg-gray-600 py-2 rounded-md"
            >
              Copy
            </button>

          </div>
        </div>
      )}
    </div>
  )
}
