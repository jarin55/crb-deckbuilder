import { useState } from "react";
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

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

const Dropdown = ({
  title,
  category,
  options,
}: {
  title: string;
  category: "type" | "level" | "color" | "rarity";
  options: string[];
}) => (
  <div className="relative w-56">
    <button
      type="button"
      onClick={() =>
        setOpenDropdown(openDropdown === category ? null : category)
      }
      className="w-full flex justify-between items-center bg-gray-800 border border-gray-700 rounded px-3 py-2"
    >
      <span>
        {filters[category].length === 0
          ? title
          : `${title} (${filters[category].length})`}
      </span>

      <span>▼</span>
    </button>

    {openDropdown === category && (
      <div className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded shadow-lg max-h-64 overflow-y-auto">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={filters[category].includes(option)}
              onChange={() => toggleFilter(category, option)}
            />

            {option}
          </label>
        ))}
      </div>
    )}
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

      <div className="flex flex-wrap gap-3">

  <Dropdown
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

  <Dropdown
    title="Level"
    category="level"
    options={["1", "2", "3", "5"]}
  />

  <Dropdown
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

  <Dropdown
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