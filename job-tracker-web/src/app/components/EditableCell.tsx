/* 
this component will turns read-only table into an editable one
ui needed to be changed when values (passed from its parent component)
==> Updatable values should be stored in useState(); 
*/
"use client";
import { useState } from "react";
type EditableCellProps = {
  /** The current value stored in the row. */
  value: string;
  /** What kind of editor to show when clicked. */
  type?: "text" | "select" | "date";
  /** Options for the <select> (only used when type === "select"). */
  options?: readonly string[];
  /** Optional override for what's shown when NOT editing (e.g. formatted date). */
  display?: string;
  /**
   * Called when the user commits a new value.
   * Return a promise so the cell can show a "saving" state and handle errors.
   */
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
