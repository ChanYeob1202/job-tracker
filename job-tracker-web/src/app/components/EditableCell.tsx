"use client";

import { useState } from "react";
type EditableCellProps = {
  value: string;
  type?: "text" | "select" | "date";
  options?: readonly string[];
  display?: string;
  onSave: (newValue: string) => Promise<void>;
};

function EditableCell({
  value,
  type = "text",
  options,
  display,
  onSave,

}: EditableCellProps) {
  const stored = value ?? "";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stored);
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setDraft(stored);
    setEditing(true);
  }

  function cancel() {
    setDraft(stored);
    setEditing(false);
  }

  async function commit(newValue: string) {
    if (newValue === stored) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(newValue);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    const readLabel = display || stored || "-";
    return (
      <button
        type="button"
        onClick={startEdit}
        className="text-left w-full min-h-5 hover:bg-gray-100 rounded px-1 -mx-1 cursor-pointer"
      >
        {readLabel}
      </button>
    );
  }

  const inputClass =
    "border border-blue-400 rounded px-1 py-0.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30";

  if (type === "select" && options) {
    return (
      <select
        autoFocus
        disabled={saving}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          commit(e.target.value);
        }}
        onBlur={() => setEditing(false)}
        className={inputClass}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      autoFocus
      disabled={saving}
      type={type === "date" ? "date" : "text"}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => commit(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          cancel();
        }
      }}
      className={inputClass}
    />
  );
}

export default EditableCell;
