"use client"

export default function DeckPanel({
  mainDeck,
  extraDeck,
  setMainDeck,
  setExtraDeck,
  totalMain,
  totalExtra,
  title
}: any) {

  const MAIN_LIMIT = 60
  const EXTRA_LIMIT = 6

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

  function saveDeck() {
    const data = {
      title,
      mainDeck,
      extraDeck
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${title || "deck"}.json`
    link.click()
  }

  function loadDeck(event: any) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e: any) => {
      const data = JSON.parse(e.target.result)
      setMainDeck(data.mainDeck || {})
      setExtraDeck(data.extraDeck || {})
    }
    reader.readAsText(file)
  }

  return (
    <div className="w-full lg:w-80 border p-4">

      {/* COUNTER */}
      <div className="mb-4">
        <div className={`font-bold ${totalMain > MAIN_LIMIT ? "text-red-600" : ""}`}>
          Main: {totalMain} / {MAIN_LIMIT}
        </div>
        <div className={`font-bold ${totalExtra > EXTRA_LIMIT ? "text-red-600" : ""}`}>
          Extra: {totalExtra} / {EXTRA_LIMIT}
        </div>
      </div>

      {/* MAIN DECK */}
      <h2 className="font-bold">Main Deck</h2>
      {Object.entries(mainDeck).map(([id, qty]) => (
        <div
          key={id}
          className="flex justify-between cursor-pointer hover:text-red-500"
          onClick={() => removeOne(id, false)}
        >
          <span>{id}</span>
          <span>x{qty as number}</span>
        </div>
      ))}

      {/* EXTRA DECK */}
      <h2 className="font-bold mt-4">Extra Deck</h2>
      {Object.entries(extraDeck).map(([id, qty]) => (
        <div
          key={id}
          className="flex justify-between cursor-pointer hover:text-red-500"
          onClick={() => removeOne(id, true)}
        >
          <span>{id}</span>
          <span>x{qty as number}</span>
        </div>
      ))}

      {/* BUTTONS */}
      <button
        className="mt-4 bg-red-500 text-white p-2 w-full"
        onClick={resetDeck}
      >
        Reset Deck
      </button>

      <button
        className="mt-2 bg-green-600 text-white p-2 w-full"
        onClick={saveDeck}
      >
        Save Deck
      </button>

      <label className="mt-2 bg-yellow-500 text-white p-2 w-full text-center block cursor-pointer">
        Load Deck
        <input
          type="file"
          accept=".json"
          onChange={loadDeck}
          className="hidden"
        />
      </label>
    </div>
  )
}