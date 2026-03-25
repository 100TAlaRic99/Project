import React from "react";
import "./FilterBar.css";

/**
 * FilterBar
 * ─────────
 * Tab-style filter to switch between All / Pending / Completed views.
 *
 * Props:
 *   filter    {"all"|"pending"|"completed"}  – current active filter
 *   onChange  {Function}                     – called with the new filter value
 *   counts    {{ all, pending, completed }}  – task counts per category
 */
function FilterBar({ filter, onChange, counts }) {
  const tabs = [
    { key: "all",       label: "All" },
    { key: "pending",   label: "Pending" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="filter-bar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`filter-bar__tab ${filter === tab.key ? "filter-bar__tab--active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          <span className="filter-bar__count">{counts[tab.key] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
