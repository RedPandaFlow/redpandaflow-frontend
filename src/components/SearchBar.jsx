import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, Kanban, UsersThree, Note, Spinner } from "@phosphor-icons/react";
import { search } from "../services/searchService";

const EMPTY_RESULTS = { workspaces: [], boards: [], cards: [] };

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length === 0) {
      return undefined;
    }

    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const data = await search(trimmed);
        if (!cancelled) {
          setResults({
            workspaces: data.workspaces ?? [],
            boards: data.boards ?? [],
            cards: data.cards ?? [],
          });
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setResults(EMPTY_RESULTS);
          setActiveIndex(-1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [trimmed]);

  useEffect(() => {
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const flatItems = [
    ...results.workspaces.map((w) => ({ type: "workspace", item: w })),
    ...results.boards.map((b) => ({ type: "board", item: b })),
    ...results.cards.map((c) => ({ type: "card", item: c })),
  ];

  const goTo = (entry) => {
    if (entry.type === "workspace") {
      navigate(`/workspace/${entry.item.id}`);
    } else if (entry.type === "card") {
      navigate(`/workspace/${entry.item.workspaceId}/board/${entry.item.boardId}?card=${entry.item.id}`);
    } else {
      navigate(`/workspace/${entry.item.workspaceId}/board/${entry.item.id}`);
    }
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((idx) => (flatItems.length === 0 ? -1 : (idx + 1) % flatItems.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((idx) =>
        flatItems.length === 0 ? -1 : (idx - 1 + flatItems.length) % flatItems.length
      );
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        event.preventDefault();
        goTo(flatItems[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showPopover = open && trimmed.length > 0;
  const hasResults = flatItems.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8B7A] pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            setOpen(true);
            setActiveIndex(-1);
            if (value.trim().length === 0) {
              setResults(EMPTY_RESULTS);
              setLoading(false);
            } else {
              setLoading(true);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un espace, un tableau ou une carte"
          className="w-full rounded-lg border border-[#EDE0D4] bg-white/70 py-2 pl-9 pr-3 text-sm text-[#3E2C1C] placeholder:text-[#9C8B7A] outline-none transition-colors focus:border-[#EA580C] focus:bg-white"
        />
        {loading && (
          <Spinner
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C8B7A] animate-spin"
          />
        )}
      </div>

      {showPopover && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[28rem] overflow-y-auto rounded-lg border border-[#EDE0D4] bg-white shadow-lg">
          {!hasResults && !loading && (
            <div className="px-4 py-6 text-center text-sm text-[#9C8B7A]">
              Aucun résultat pour « {trimmed} »
            </div>
          )}

          {results.workspaces.length > 0 && (
            <SearchSection title="Espaces de travail">
              {results.workspaces.map((workspace) => {
                const flatIdx = flatItems.findIndex(
                  (entry) => entry.type === "workspace" && entry.item.id === workspace.id
                );
                return (
                  <SearchItem
                    key={`workspace-${workspace.id}`}
                    icon={UsersThree}
                    title={workspace.name}
                    subtitle={workspace.description ?? "Espace de travail"}
                    active={flatIdx === activeIndex}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                    onClick={() => goTo({ type: "workspace", item: workspace })}
                  />
                );
              })}
            </SearchSection>
          )}

          {results.boards.length > 0 && (
            <SearchSection title="Tableaux">
              {results.boards.map((board) => {
                const flatIdx = flatItems.findIndex(
                  (entry) => entry.type === "board" && entry.item.id === board.id
                );
                return (
                  <SearchItem
                    key={`board-${board.id}`}
                    icon={Kanban}
                    title={board.title}
                    subtitle={board.workspaceName}
                    active={flatIdx === activeIndex}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                    onClick={() => goTo({ type: "board", item: board })}
                  />
                );
              })}
            </SearchSection>
          )}

          {results.cards.length > 0 && (
            <SearchSection title="Cartes">
              {results.cards.map((card) => {
                const flatIdx = flatItems.findIndex(
                  (entry) => entry.type === "card" && entry.item.id === card.id
                );
                return (
                  <SearchItem
                    key={`card-${card.id}`}
                    icon={Note}
                    title={card.title}
                    subtitle={`${card.boardTitle} · ${card.workspaceName}`}
                    active={flatIdx === activeIndex}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                    onClick={() => goTo({ type: "card", item: card })}
                  />
                );
              })}
            </SearchSection>
          )}
        </div>
      )}
    </div>
  );
};

const SearchSection = ({ title, children }) => (
  <div className="py-1">
    <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#9C8B7A]">
      {title}
    </div>
    <ul>{children}</ul>
  </div>
);

const SearchItem = ({ icon: Icon, title, subtitle, active, onClick, onMouseEnter }) => (
  <li>
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`flex w-full items-start gap-3 px-4 py-2 text-left transition-colors ${
        active ? "bg-[#FDF3EA]" : "hover:bg-[#FDF3EA]"
      }`}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FDF3EA] text-[#EA580C]">
        <Icon size={16} weight="bold" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-[#3E2C1C]">{title}</span>
        <span className="block truncate text-xs text-[#9C8B7A]">{subtitle}</span>
      </span>
    </button>
  </li>
);

export default SearchBar;
