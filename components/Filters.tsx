export default function Filters({ filters, setFilters }: any) {
  const toggleFilter = (
    category: "type" | "level" | "color" | "rarity",
    value: string
  ) => {
    const current = filters[category] as string[];

    if (current.includes(value)) {
      setFilters({
        ...filters,
        [category]: current.filter((v) => v !== value),
      });
    } else {
      setFilters({
        ...filters,
        [category]: [...current, value],
      });
    }
  };

  const FilterGroup = ({
    title,
    category,
    options,
  }: {
    title: string;
    category: "type" | "level" | "color" | "rarity";
    options: string[];
  }) => (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-white">{title}</span>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = filters[category].includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleFilter(category, option)}
              className={`px-3 py-1 rounded-md border transition
                ${
                  active
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 mb-6">
      {/* Search */}
      <input
        className="border border-gray-700 bg-white text-black p-2 rounded"
        placeholder="Search"
        value={filters.search}
        onChange={(e) =>
          setFilters({
            ...filters,
            search: e.target.value,
          })
        }
      />

      <FilterGroup
        title="Type"
        category="type"
        options={[
          "Cookie",
          "Trap",
          "Item",
          "Flip",
          "Stage",
          "Extra",
        ]}
      />

      <FilterGroup
        title="Level"
        category="level"
        options={["1", "2", "3", "5"]}
      />

      <FilterGroup
        title="Color"
        category="color"
        options={[
          "Blue",
          "Red",
          "Yellow",
          "Green",
          "Purple",
          "Black",
          "Pure",
        ]}
      />

      <FilterGroup
        title="Rarity"
        category="rarity"
        options={[
          "C",
          "U",
          "R",
          "SR",
          "UR",
          "SSR",
          "SUR",
          "EXR",
          "GXR",
          "P",
        ]}
      />
    </div>
  );
}