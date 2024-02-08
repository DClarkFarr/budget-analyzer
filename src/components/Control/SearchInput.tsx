import { useState, useTransition } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

import iconStyles from "./SearchInput.module.scss";

const SearchIcon = () => (
  <FaSearch
    className={`text-md text-gray-500 pointer-events-none select-none`}
  />
);

export default function SearchInput({
  onSearch,
  placeholder = "Search",
}: {
  onSearch: (search: string) => void;
  placeholder: string;
}) {
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const handleSearchEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);

    startTransition(() => {
      onSearch(e.target.value);
    });
  };

  const onClearSearch = () => {
    setSearch("");

    startTransition(() => {
      onSearch("");
    });
  };

  return (
    <div className="flex gap-x-2 items-center">
      <div>
        <div className="relative">
          <div className={`search-icon absolute ${iconStyles.searchIcon}`}>
            <SearchIcon />
          </div>
          <input
            type="text"
            value={search}
            onChange={handleSearchEvent}
            placeholder={placeholder}
            className="search-input__input form-control pl-10"
          />
        </div>
      </div>
      {search.length > 0 && (
        <div>
          <button
            onClick={onClearSearch}
            className="btn btn-icon text-red-600 hover:text-red-800"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}
