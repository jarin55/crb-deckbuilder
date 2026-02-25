"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import CardGrid from "../components/CardGrid"
import DeckPanel from "../components/DeckPanel"
import Filters from "../components/Filters"

export default function Home() {

  const [cards, setCards] = useState<any[]>([])
  const [mainDeck, setMainDeck] = useState<Record<string, number>>({})
  const [extraDeck, setExtraDeck] = useState<Record<string, number>>({})
  const [title, setTitle] = useState("")
  const [user, setUser] = useState<any>(null)

  // ✅ FULL FILTER STRUCTURE MATCHING CardGrid
  const [filters, setFilters] = useState({
    search: "",
    type: "All",
    level: "All",
    color: "All"
  })

  // LOAD CARDS
  useEffect(() => {
    fetch("/CardList_FINAL_v2.json")
      .then(res => res.json())
      .then(data => {
        const formatted = Object.values(data).map((card: any) => ({
          id: card.id,
          name: card.face.front.name,
          display: `${card.id}-${card.face.front.name}`,
          type: card.type || "",
          level: card.level || 0,
          color: card.color || ""
        }))
        setCards(formatted)
      })
  }, [])

  // AUTH
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  function addCard(card: any) {
    const MAX_COPY = 4

    if (card.type === "Extra") {
      const currentTotal = Object.values(extraDeck).reduce((a, b) => a + b, 0)
      const currentCopies = extraDeck[card.id] || 0

      if (currentTotal >= 6) return
      if (currentCopies >= MAX_COPY) return

      setExtraDeck(prev => ({
        ...prev,
        [card.id]: currentCopies + 1
      }))

    } else {
      const currentTotal = Object.values(mainDeck).reduce((a, b) => a + b, 0)
      const currentCopies = mainDeck[card.id] || 0

      if (currentTotal >= 60) return
      if (currentCopies >= MAX_COPY) return

      setMainDeck(prev => ({
        ...prev,
        [card.id]: currentCopies + 1
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">CRB Deckbuilder</h1>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm">{user.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="bg-red-600 px-3 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                supabase.auth.signInWithOAuth({
                  provider: "google"
                })
              }
              className="bg-green-600 px-3 py-2 rounded-md text-sm"
            >
              Login with Google
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Deck Title"
          className="w-full bg-gray-800 p-3 rounded-md"
        />
      </div>

      <div className="flex">

        <div className="flex-1 p-4 overflow-y-auto">
          <Filters
            filters={filters}
            setFilters={setFilters}
          />

          <CardGrid
            cards={cards}
            addCard={addCard}
            filters={filters}
          />
        </div>

        <div className="w-40 sm:w-56 md:w-72 lg:w-96 border-l border-gray-800 overflow-y-auto">
          <DeckPanel
            mainDeck={mainDeck}
            extraDeck={extraDeck}
            setMainDeck={setMainDeck}
            setExtraDeck={setExtraDeck}
            cards={cards}
            title={title}
          />
        </div>

      </div>
    </div>
  )
}