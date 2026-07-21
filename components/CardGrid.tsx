"use client"

import { useState } from "react"

export default function CardGrid({ cards, filters, addCard }: any) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const filtered = cards.filter((card: any) => {
  // Search
  if (
    !card.display.toLowerCase().includes(filters.search.toLowerCase())
  ) {
    return false;
  }

  // Type
  if (
    filters.type.length > 0 &&
    !filters.type.includes(card.type)
  ) {
    return false;
  }

  // Level
  if (
    filters.level.length > 0 &&
    !filters.level.includes(String(card.level))
  ) {
    return false;
  }

  // Color
  if (
    filters.color.length > 0 &&
    !filters.color.includes(card.color)
  ) {
    return false;
  }

  // Rarity
  if (
    filters.rarity.length > 0 &&
    !filters.rarity.includes(card.rarity)
  ) {
    return false;
  }

  return true;
});

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
              src={`/cards/${card.id}.webp`}
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
            src={`/cards/${hovered}.webp`}
            className="w-[400px] sm:w-[450px] lg:w-[500px] border-4 border-black rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}
