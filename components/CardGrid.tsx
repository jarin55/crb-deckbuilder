export default function CardGrid({ cards, filters, addCard, setPreview }: any) {

  const filtered = cards.filter((card: any) => {
  if (!card.display.toLowerCase().includes(filters.search.toLowerCase()))
    return false

  if (filters.type !== "All" && card.type !== filters.type)
    return false

  if (filters.level !== "All" && String(card.level) !== filters.level)
    return false

  if (filters.color !== "All" && card.color !== filters.color)
    return false

  return true
  })

  return (
    <div className="grid grid-cols-7 gap-2">
      {filtered.map((card: any) => (
        <img
          key={card.id}
          src={`/cards/${card.id}.jpg`}
          className="w-32 cursor-pointer"
          onClick={() => addCard(card)}
          onMouseEnter={() => setPreview(card.id)}
          onMouseLeave={() => setPreview(null)}
        />
      ))}
    </div>
  )
}