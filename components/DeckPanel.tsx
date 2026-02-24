export default function DeckPanel({
  mainDeck,
  extraDeck,
  setMainDeck,
  setExtraDeck,
  title
}: any) {

  function removeOne(id: string) {
    setMainDeck((prev: any) => {
      if (!prev[id]) return prev
      const copy = { ...prev }
      copy[id]--
      if (copy[id] <= 0) delete copy[id]
      return copy
    })
  }

  return (
    <div className="w-80 border p-4">
      <h2 className="font-bold">Main Deck</h2>
      {Object.entries(mainDeck).map(([id, qty]) => (
        <div key={id}>{id} x{qty as number}</div>
      ))}

      <h2 className="font-bold mt-4">Extra Deck</h2>
      {Object.entries(extraDeck).map(([id, qty]) => (
        <div key={id}>{id} x{qty as number}</div>
      ))}

      <button
        className="mt-4 bg-blue-500 text-white p-2"
        onClick={async () => {
          const res = await fetch("/api/export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mainDeck, extraDeck, title })
          })

          if (!res.ok) {
            alert("Export failed")
            return
          }

          const blob = await res.blob()
          const url = window.URL.createObjectURL(blob)

          const a = document.createElement("a")
          a.href = url
          a.download = `${title || "deck"}.jpg`
          document.body.appendChild(a)
          a.click()

          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }}
      >
        Export Deck Image
      </button>
    </div>
  )
}