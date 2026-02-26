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

      {/* Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button className="bg-blue-600 px-3 py-2 rounded-md">Export</button>
        <button onClick={() => setShowImport(true)} className="bg-purple-600 px-3 py-2 rounded-md">Import</button>
        <button className="bg-green-600 px-3 py-2 rounded-md">Save</button>
        <button className="bg-yellow-600 px-3 py-2 rounded-md">Load</button>
        <button onClick={resetDeck} className="bg-red-600 px-3 py-2 rounded-md">Reset</button>
      </div>

      {/* Counters */}
      <div className="mb-4">
        <div className={mainOver ? "text-red-400 font-bold" : "font-bold"}>
          Main: {mainCount} / 60
        </div>
        <div className={extraOver ? "text-red-400 font-bold" : "font-bold"}>
          Extra: {extraCount} / 6
        </div>
      </div>

      {/* MAIN TYPES */}
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
                <div key={card.id} className="relative bg-gray-800 p-2 rounded-lg">

                  <img
                    src={`/cards/${card.id}.jpg`}
                    className="w-full rounded-md shadow-lg"
                  />

                  {/* Quantity */}
                  <div className="absolute bottom-12 left-2 bg-black/70 px-2 py-1 rounded text-sm font-bold">
                    x{card.qty}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center gap-3 mt-2">
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

      {/* EXTRA */}
      {Object.keys(extraDeck).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">
            Extra ({extraCount})
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {Object.entries(extraDeck).map(([id, qty]) => (
              <div key={id} className="relative bg-gray-800 p-2 rounded-lg">

                <img
                  src={`/cards/${id}.jpg`}
                  className="w-full rounded-md shadow-lg"
                />

                <div className="absolute bottom-12 left-2 bg-black/70 px-2 py-1 rounded text-sm font-bold">
                  x{qty}
                </div>

                <div className="flex justify-center gap-3 mt-2">
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

    </div>
  )
}