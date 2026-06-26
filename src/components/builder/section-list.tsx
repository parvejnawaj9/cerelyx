"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import {
  SECTION_LIBRARY,
  EDITABLE_SECTION_TYPES,
  isRequiredSection,
  makeSectionBlock,
} from "@/lib/sections";
import { cn } from "@/lib/cn";
import type { SectionBlock, EditableSectionType } from "@/lib/types";

const reindex = (list: SectionBlock[]): SectionBlock[] =>
  list.map((s, i) => ({ ...s, order: i }));

export function SectionList({
  sections,
  selected,
  onSelect,
  onChange,
}: {
  sections: SectionBlock[];
  selected: EditableSectionType | null;
  onSelect: (type: EditableSectionType) => void;
  onChange: (next: SectionBlock[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const present = new Set(sections.map((s) => s.type));
  const addable = EDITABLE_SECTION_TYPES.filter((t) => !present.has(t));

  return (
    <div className="flex flex-col gap-3">
      <Reorder.Group
        axis="y"
        values={sections}
        onReorder={(next) => onChange(reindex(next))}
        className="flex flex-col gap-1.5"
      >
        {sections.map((s) => (
          <SectionRow
            key={s.id}
            section={s}
            active={selected === s.type}
            onSelect={() => onSelect(s.type as EditableSectionType)}
            onToggle={() =>
              onChange(
                reindex(
                  sections.map((x) =>
                    x.id === s.id ? { ...x, visible: !x.visible } : x
                  )
                )
              )
            }
            onRemove={() =>
              onChange(reindex(sections.filter((x) => x.id !== s.id)))
            }
          />
        ))}
      </Reorder.Group>

      {addable.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-line-strong px-3 py-2 text-sm text-muted transition-colors hover:border-brand hover:text-ink"
          >
            <Plus className="h-4 w-4" />
            Add a section
          </button>
          {adding && (
            <div className="mt-1.5 flex flex-col gap-1 rounded-[var(--radius-md)] border border-line bg-surface p-1.5 shadow-[var(--shadow-soft)]">
              {addable.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    onChange(
                      reindex([...sections, makeSectionBlock(t, sections.length)])
                    );
                    onSelect(t);
                    setAdding(false);
                  }}
                  className="flex flex-col rounded-[var(--radius-sm)] px-3 py-2 text-left hover:bg-brand-soft"
                >
                  <span className="text-sm text-ink">{SECTION_LIBRARY[t].label}</span>
                  <span className="text-xs text-muted">
                    {SECTION_LIBRARY[t].description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionRow({
  section,
  active,
  onSelect,
  onToggle,
  onRemove,
}: {
  section: SectionBlock;
  active: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const controls = useDragControls();
  const meta = SECTION_LIBRARY[section.type as EditableSectionType];
  const required = isRequiredSection(section.type as EditableSectionType);

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "flex items-center gap-2 rounded-[var(--radius-md)] border bg-surface px-2 py-2",
        active ? "border-brand ring-1 ring-brand/25" : "border-line"
      )}
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label="Drag to reorder"
        className="cursor-grab touch-none px-0.5 text-faint hover:text-muted active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-left"
      >
        <span
          className={cn(
            "text-sm",
            section.visible ? "text-ink" : "text-faint line-through"
          )}
        >
          {meta?.label ?? section.type}
        </span>
      </button>
      <button
        type="button"
        onClick={onToggle}
        aria-label={section.visible ? "Hide section" : "Show section"}
        className="rounded p-1 text-muted hover:text-ink"
      >
        {section.visible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>
      {!required && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove section"
          className="rounded p-1 text-muted hover:text-rose"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </Reorder.Item>
  );
}
