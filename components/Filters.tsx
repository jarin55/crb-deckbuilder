export default function Filters({ filters, setFilters }: any) {
  return (
    <div className="flex gap-3 mb-4 flex-wrap">

      {/* Search */}
      <input
        className="border p-2"
        placeholder="Search"
        value={filters.search}
        onChange={(e) =>
          setFilters({ ...filters, search: e.target.value })
        }
      />

      {/* Type */}
      <select
        className="border p-2"
        value={filters.type}
        onChange={(e) =>
          setFilters({ ...filters, type: e.target.value })
        }
      >
        <option value="All">All Types</option>
        <option value="Cookie">Cookie</option>
        <option value="Trap">Trap</option>
        <option value="Item">Item</option>
        <option value="Flip">Flip</option>
        <option value="Stage">Stage</option>
        <option value="Extra">Extra</option>
      </select>

      {/* Level */}
      <select
        className="border p-2"
        value={filters.level}
        onChange={(e) =>
          setFilters({ ...filters, level: e.target.value })
        }
      >
        <option value="All">All Levels</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>

      {/* Color */}
      <select
        className="border p-2"
        value={filters.color}
        onChange={(e) =>
          setFilters({ ...filters, color: e.target.value })
        }
      >
        <option value="All">All Colors</option>
        <option value="Blue">Blue</option>
        <option value="Red">Red</option>
        <option value="Yellow">Yellow</option>
        <option value="Green">Green</option>
        <option value="Purple">Purple</option>
        <option value="Colorless">Colorless</option>
      </select>

    </div>
  )
}