"use client"

import { useEffect, useState } from "react"
import CardGrid from "../components/CardGrid"
import DeckPanel from "../components/DeckPanel"
import Filters from "../components/Filters"
import Preview from "../components/Preview"

export default function Home() {
  const [cards, setCards] = useState<any[]>([])
  const [mainDeck, setMainDeck] = useState<Record<string, number>>({})
  const [extraDeck, setExtraDeck] = useState<Record<string, number>>({})
  const [filters, setFilters] = useState({
    search: "",
    type: "All",
    color: "All",
    level: "All"
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")

  useEffect(() => {
    fetch("/CardList_FINAL_v2.json")
      .then(res => res.json())
      .then(data => {
        const formatted = Object.values(data).map((card: any) => ({
          id: card.id,
          display: `${card.id}-${card.face.front.name}`,
          type: card.type || "",
          color: card.color || "",
          level: card.level || 0
        }))
        setCards(formatted)
      })
  }, [])

  function totalMain() {
    return Object.values(mainDeck).reduce((a, b) => a + b, 0)
  }

  function totalExtra() {
    return Object.values(extraDeck).reduce((a, b) => a + b, 0)
  }

  function addCard(card: any) {
    const isExtra = card.type === "Extra"

    if (isExtra) {
      if (totalExtra() >= 6 || (extraDeck[card.id] || 0) >= 4) return
      setExtraDeck(prev => ({
        ...prev,
        [card.id]: (prev[card.id] || 0) + 1
      }))
    } else {
      if (totalMain() >= 60 || (mainDeck[card.id] || 0) >= 4) return
      setMainDeck(prev => ({
        ...prev,
        [card.id]: (prev[card.id] || 0) + 1
      }))
    }
  }

  return (
    <div className="flex p-6 gap-6">
      <div className="flex-1">
        <input
          className="border p-2 mb-3 w-64"
          placeholder="Deck Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <Filters filters={filters} setFilters={setFilters} />

        <CardGrid
          cards={cards}
          filters={filters}
          addCard={addCard}
          setPreview={setPreview}
        />
      </div>

      <DeckPanel
        mainDeck={mainDeck}
        extraDeck={extraDeck}
        setMainDeck={setMainDeck}
        setExtraDeck={setExtraDeck}
        title={title}
      />

      <Preview cardId={preview} />
    </div>
  )
}