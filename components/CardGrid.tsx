"use client"

import { useState } from "react"

export default function CardGrid({ cards, filters, addCard }: any) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const filtered = cards.filter((card: any) => {
    if (!card.display.toLowerCase().includes(filters.search.toLowerCase()))
      return false
    if (filters.type !== "All" && card.type !== filters.type)
      return false
    if (filters.level !== "All" && String(card.level) !== filters.level)
      return false
    if (filters.color !== "All" && card.color !== filters.color)
      return false
    if (filters.rarity !== "All" && card.rarity !== filters.rarity)
  return false
    return true
  })

  return (
    <div className="relative">
      {/* CARD GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
        {filtered.map((card: any) => (
          <div
            key={card.id}
            className="relative"
            onMouseEnter={(e) => {
              if (window.innerWidth < 1024) return
              
              const rect = e.currentTarget.getBoundingClientRect()
              setPosition({
                x: rect.right + 10,
                y: rect.top
              })
              setHovered(card.id)
            }}
            onMouseLeave={() => setHovered(null)}
          >
            <img
              src={`/cards/${card.id}.jpg`}
              className="w-full cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => addCard(card)}
            />
          </div>
        ))}
      </div>

      {/* HOVER PREVIEW */}
      {hovered && (
        <div
          className="hidden lg:block fixed z-50 shadow-2xl"
          style={{
            left: position.x,
            top: position.y
          }}
        >
          <img
            src={`/cards/${hovered}.jpg`}
            className="w-[400px] sm:w-[450px] lg:w-[500px] border-4 border-black rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}
