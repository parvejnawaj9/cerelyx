"use client";

import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ImageField, ImageGrid } from "@/components/builder/image-upload";
import { genItemId } from "@/lib/sections";
import type {
  EditableSectionType,
  SiteContent,
  HeroData,
  StoryData,
  EventsData,
  VenueData,
  GalleryData,
  RsvpData,
  FooterData,
  StoryItem,
  EventItem,
} from "@/lib/types";

export function SectionForm({
  type,
  content,
  siteId,
  onChange,
}: {
  type: EditableSectionType;
  content: SiteContent;
  siteId: string;
  onChange: (next: SiteContent) => void;
}) {
  const patch = <K extends keyof SiteContent>(key: K, data: SiteContent[K]) =>
    onChange({ ...content, [key]: data });

  switch (type) {
    case "hero":
      return (
        <HeroForm
          value={content.hero ?? { titleA: "" }}
          siteId={siteId}
          onChange={(d) => patch("hero", d)}
        />
      );
    case "story":
      return (
        <StoryForm
          value={content.story ?? { items: [] }}
          onChange={(d) => patch("story", d)}
        />
      );
    case "events":
      return (
        <EventsForm
          value={content.events ?? { items: [] }}
          onChange={(d) => patch("events", d)}
        />
      );
    case "venue":
      return (
        <VenueForm value={content.venue ?? {}} onChange={(d) => patch("venue", d)} />
      );
    case "gallery":
      return (
        <GalleryForm
          value={content.gallery ?? { imagePaths: [] }}
          siteId={siteId}
          onChange={(d) => patch("gallery", d)}
        />
      );
    case "rsvp":
      return (
        <RsvpDataForm value={content.rsvp ?? {}} onChange={(d) => patch("rsvp", d)} />
      );
    case "footer":
      return (
        <FooterForm value={content.footer ?? {}} onChange={(d) => patch("footer", d)} />
      );
    default:
      return null;
  }
}

// ---- repeatable-list helpers ----------------------------------------------

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it!);
  return next;
}

function ItemCard({
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line bg-canvas p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-faint">
          #{index + 1}
        </span>
        <div className="flex items-center gap-1 text-muted">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move up"
            className="rounded p-1 hover:text-ink disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label="Move down"
            className="rounded p-1 hover:text-ink disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove"
            className="rounded p-1 hover:text-rose"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

// ---- forms -----------------------------------------------------------------

function HeroForm({
  value,
  siteId,
  onChange,
}: {
  value: HeroData;
  siteId: string;
  onChange: (d: HeroData) => void;
}) {
  const set = (p: Partial<HeroData>) => onChange({ ...value, ...p });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Eyebrow" htmlFor="h-eyebrow" hint="A small line above the title.">
        <Input
          id="h-eyebrow"
          value={value.eyebrow ?? ""}
          onChange={(e) => set({ eyebrow: e.target.value })}
          placeholder="Together with their families"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name / title" htmlFor="h-a">
          <Input
            id="h-a"
            value={value.titleA ?? ""}
            onChange={(e) => set({ titleA: e.target.value })}
            placeholder="Aarav"
          />
        </Field>
        <Field label="Second name" htmlFor="h-b" hint="Optional (couples).">
          <Input
            id="h-b"
            value={value.titleB ?? ""}
            onChange={(e) => set({ titleB: e.target.value })}
            placeholder="Priya"
          />
        </Field>
      </div>
      <Field label="A short line" htmlFor="h-tag">
        <Input
          id="h-tag"
          value={value.tagline ?? ""}
          onChange={(e) => set({ tagline: e.target.value })}
          placeholder="Two families, one celebration…"
        />
      </Field>
      <Field label="Date" htmlFor="h-date">
        <Input
          id="h-date"
          type="date"
          value={value.date ?? ""}
          onChange={(e) => set({ date: e.target.value })}
        />
      </Field>
      <Field label="Hero photo" hint="Optional — shown at the top.">
        <ImageField
          siteId={siteId}
          value={value.imagePath}
          onChange={(path) => set({ imagePath: path })}
        />
      </Field>
    </div>
  );
}

function StoryForm({
  value,
  onChange,
}: {
  value: StoryData;
  onChange: (d: StoryData) => void;
}) {
  const items = value.items ?? [];
  const setItems = (next: StoryItem[]) => onChange({ ...value, items: next });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="s-title">
        <Input
          id="s-title"
          value={value.title ?? ""}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="How we got here"
        />
      </Field>
      <Field label="Intro" htmlFor="s-intro">
        <Textarea
          id="s-intro"
          value={value.intro ?? ""}
          onChange={(e) => onChange({ ...value, intro: e.target.value })}
          placeholder="A line or two about your journey…"
        />
      </Field>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <ItemCard
            key={item.id}
            index={i}
            count={items.length}
            onMove={(dir) => setItems(move(items, i, i + dir))}
            onRemove={() => setItems(items.filter((x) => x.id !== item.id))}
          >
            <div className="grid grid-cols-[1fr_8rem] gap-3">
              <Field label="Title" htmlFor={`st-${item.id}`}>
                <Input
                  id={`st-${item.id}`}
                  value={item.title}
                  onChange={(e) =>
                    setItems(
                      items.map((x) =>
                        x.id === item.id ? { ...x, title: e.target.value } : x
                      )
                    )
                  }
                  placeholder="The first hello"
                />
              </Field>
              <Field label="When" htmlFor={`sd-${item.id}`}>
                <Input
                  id={`sd-${item.id}`}
                  value={item.date ?? ""}
                  onChange={(e) =>
                    setItems(
                      items.map((x) =>
                        x.id === item.id ? { ...x, date: e.target.value } : x
                      )
                    )
                  }
                  placeholder="2021"
                />
              </Field>
            </div>
            <Field label="Story" htmlFor={`sb-${item.id}`}>
              <Textarea
                value={item.body}
                onChange={(e) =>
                  setItems(
                    items.map((x) =>
                      x.id === item.id ? { ...x, body: e.target.value } : x
                    )
                  )
                }
                placeholder="What happened…"
              />
            </Field>
          </ItemCard>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            setItems([...items, { id: genItemId("s"), title: "", body: "" }])
          }
        >
          <Plus className="h-4 w-4" />
          Add a moment
        </Button>
      </div>
    </div>
  );
}

function EventsForm({
  value,
  onChange,
}: {
  value: EventsData;
  onChange: (d: EventsData) => void;
}) {
  const items = value.items ?? [];
  const setItems = (next: EventItem[]) => onChange({ ...value, items: next });
  const patchItem = (id: string, p: Partial<EventItem>) =>
    setItems(items.map((x) => (x.id === id ? { ...x, ...p } : x)));
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="e-title">
        <Input
          id="e-title"
          value={value.title ?? ""}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="The celebrations"
        />
      </Field>
      <div className="flex flex-col gap-3">
        {items.map((ev, i) => (
          <ItemCard
            key={ev.id}
            index={i}
            count={items.length}
            onMove={(dir) => setItems(move(items, i, i + dir))}
            onRemove={() => setItems(items.filter((x) => x.id !== ev.id))}
          >
            <Field label="Name" htmlFor={`en-${ev.id}`}>
              <Input
                id={`en-${ev.id}`}
                value={ev.name}
                onChange={(e) => patchItem(ev.id, { name: e.target.value })}
                placeholder="Reception"
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Date" htmlFor={`ed-${ev.id}`}>
                <Input
                  id={`ed-${ev.id}`}
                  type="date"
                  value={ev.date ?? ""}
                  onChange={(e) => patchItem(ev.id, { date: e.target.value })}
                />
              </Field>
              <Field label="Start" htmlFor={`et-${ev.id}`}>
                <Input
                  id={`et-${ev.id}`}
                  type="time"
                  value={ev.startTime ?? ""}
                  onChange={(e) => patchItem(ev.id, { startTime: e.target.value })}
                />
              </Field>
              <Field label="End" htmlFor={`ee-${ev.id}`}>
                <Input
                  id={`ee-${ev.id}`}
                  type="time"
                  value={ev.endTime ?? ""}
                  onChange={(e) => patchItem(ev.id, { endTime: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Where" htmlFor={`ev-${ev.id}`}>
              <Input
                id={`ev-${ev.id}`}
                value={ev.venueName ?? ""}
                onChange={(e) => patchItem(ev.id, { venueName: e.target.value })}
                placeholder="Grand Lawn"
              />
            </Field>
            <Field
              label="Address"
              htmlFor={`ea-${ev.id}`}
              hint="Optional — if this event is somewhere else."
            >
              <Input
                id={`ea-${ev.id}`}
                value={ev.address ?? ""}
                onChange={(e) => patchItem(ev.id, { address: e.target.value })}
              />
            </Field>
            <Field label="Details" htmlFor={`ex-${ev.id}`}>
              <Textarea
                value={ev.description ?? ""}
                onChange={(e) => patchItem(ev.id, { description: e.target.value })}
                placeholder="A note for guests…"
              />
            </Field>
          </ItemCard>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setItems([...items, { id: genItemId("e"), name: "" }])}
        >
          <Plus className="h-4 w-4" />
          Add an event
        </Button>
      </div>
    </div>
  );
}

function VenueForm({
  value,
  onChange,
}: {
  value: VenueData;
  onChange: (d: VenueData) => void;
}) {
  const set = (p: Partial<VenueData>) => onChange({ ...value, ...p });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Venue name" htmlFor="v-name">
        <Input
          id="v-name"
          value={value.name ?? ""}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Taj Falaknuma Palace"
        />
      </Field>
      <Field label="Address" htmlFor="v-addr">
        <Textarea
          id="v-addr"
          value={value.address ?? ""}
          onChange={(e) => set({ address: e.target.value })}
          placeholder="Street, city, country"
        />
      </Field>
      <Field
        label="Map link"
        htmlFor="v-map"
        hint="Paste a Google Maps link, or leave blank to use the address."
      >
        <Input
          id="v-map"
          value={value.mapUrl ?? ""}
          onChange={(e) => set({ mapUrl: e.target.value })}
          placeholder="https://maps.google.com/…"
        />
      </Field>
    </div>
  );
}

function GalleryForm({
  value,
  siteId,
  onChange,
}: {
  value: GalleryData;
  siteId: string;
  onChange: (d: GalleryData) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="g-title">
        <Input
          id="g-title"
          value={value.title ?? ""}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="A few favourites"
        />
      </Field>
      <Field label="Photos" hint="Up to 12 — they compress automatically.">
        <ImageGrid
          siteId={siteId}
          values={value.imagePaths ?? []}
          onChange={(paths) => onChange({ ...value, imagePaths: paths })}
        />
      </Field>
    </div>
  );
}

function RsvpDataForm({
  value,
  onChange,
}: {
  value: RsvpData;
  onChange: (d: RsvpData) => void;
}) {
  return (
    <Field label="RSVP note" htmlFor="r-note">
      <Textarea
        id="r-note"
        value={value.note ?? ""}
        onChange={(e) => onChange({ note: e.target.value })}
        placeholder="Kindly let us know by…"
      />
    </Field>
  );
}

function FooterForm({
  value,
  onChange,
}: {
  value: FooterData;
  onChange: (d: FooterData) => void;
}) {
  const set = (p: Partial<FooterData>) => onChange({ ...value, ...p });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Sign-off" htmlFor="f-hosts">
        <Input
          id="f-hosts"
          value={value.hosts ?? ""}
          onChange={(e) => set({ hosts: e.target.value })}
          placeholder="With love, the Sharma & Gupta families"
        />
      </Field>
      <Field label="Small note" htmlFor="f-note">
        <Input
          id="f-note"
          value={value.note ?? ""}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="Made with joy on Cerelyx."
        />
      </Field>
    </div>
  );
}
