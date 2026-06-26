"use client";

import { ArrowUp, ArrowDown, Trash2, Plus, X } from "lucide-react";
import { Field, Input, Textarea, fieldBase } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ImageField, ImageGrid } from "@/components/builder/image-upload";
import { AudioField } from "@/components/builder/audio-upload";
import { genItemId } from "@/lib/sections";
import { cn } from "@/lib/cn";
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
  CustomQuestion,
  CountdownData,
  MusicData,
  WishesData,
  RegistryData,
  RegistryItem,
  LivestreamData,
  FaqData,
  FaqItem,
  TravelData,
  TravelItem,
  DressCodeData,
  PhotosData,
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
          siteId={siteId}
          onChange={(d) => patch("story", d)}
        />
      );
    case "events":
      return (
        <EventsForm
          value={content.events ?? { items: [] }}
          siteId={siteId}
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
    case "countdown":
      return (
        <CountdownForm
          value={content.countdown ?? {}}
          onChange={(d) => patch("countdown", d)}
        />
      );
    case "music":
      return (
        <MusicForm
          value={content.music ?? {}}
          siteId={siteId}
          onChange={(d) => patch("music", d)}
        />
      );
    case "wishes":
      return (
        <WishesForm value={content.wishes ?? {}} onChange={(d) => patch("wishes", d)} />
      );
    case "registry":
      return (
        <RegistryForm
          value={content.registry ?? { items: [] }}
          siteId={siteId}
          onChange={(d) => patch("registry", d)}
        />
      );
    case "livestream":
      return (
        <LivestreamForm
          value={content.livestream ?? {}}
          onChange={(d) => patch("livestream", d)}
        />
      );
    case "faq":
      return (
        <FaqForm value={content.faq ?? { items: [] }} onChange={(d) => patch("faq", d)} />
      );
    case "travel":
      return (
        <TravelForm
          value={content.travel ?? { items: [] }}
          onChange={(d) => patch("travel", d)}
        />
      );
    case "dressCode":
      return (
        <DressCodeForm
          value={content.dressCode ?? {}}
          onChange={(d) => patch("dressCode", d)}
        />
      );
    case "photos":
      return (
        <PhotosForm value={content.photos ?? {}} onChange={(d) => patch("photos", d)} />
      );
    default:
      return null;
  }
}

// ---- small shared inputs ---------------------------------------------------

/** An accessible on/off toggle (styled native checkbox). */
function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong text-brand focus:ring-2 focus:ring-brand/25"
      />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Editable list of short string "chips" (meal options, etc.). */
function ChipList({
  values,
  onChange,
  placeholder,
  addLabel,
  max = 12,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  addLabel: string;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={v}
            placeholder={placeholder}
            onChange={(e) =>
              onChange(values.map((x, j) => (j === i ? e.target.value : x)))
            }
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            aria-label="Remove"
            className="rounded p-1.5 text-muted hover:text-rose"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {values.length < max && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange([...values, ""])}
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
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
  siteId,
  onChange,
}: {
  value: StoryData;
  siteId: string;
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
                id={`sb-${item.id}`}
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
            <Field label="Photo" hint="Optional.">
              <ImageField
                siteId={siteId}
                value={item.imagePath}
                onChange={(path) =>
                  setItems(
                    items.map((x) =>
                      x.id === item.id ? { ...x, imagePath: path } : x
                    )
                  )
                }
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
  siteId,
  onChange,
}: {
  value: EventsData;
  siteId: string;
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
            <Field
              label="Map link"
              htmlFor={`em-${ev.id}`}
              hint="Optional — a Google Maps link for directions."
            >
              <Input
                id={`em-${ev.id}`}
                value={ev.mapUrl ?? ""}
                onChange={(e) => patchItem(ev.id, { mapUrl: e.target.value })}
                placeholder="https://maps.google.com/…"
              />
            </Field>
            <Field label="Details" htmlFor={`ex-${ev.id}`}>
              <Textarea
                id={`ex-${ev.id}`}
                value={ev.description ?? ""}
                onChange={(e) => patchItem(ev.id, { description: e.target.value })}
                placeholder="A note for guests…"
              />
            </Field>
            <Field label="Photo" hint="Optional — a photo or icon for this event.">
              <ImageField
                siteId={siteId}
                value={ev.imagePath}
                onChange={(path) => patchItem(ev.id, { imagePath: path })}
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
  const set = (p: Partial<RsvpData>) => onChange({ ...value, ...p });
  const questions = value.customQuestions ?? [];
  const setQuestions = (next: CustomQuestion[]) =>
    set({ customQuestions: next });
  const patchQ = (id: string, p: Partial<CustomQuestion>) =>
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...p } : q)));

  return (
    <div className="flex flex-col gap-5">
      <Field label="RSVP note" htmlFor="r-note">
        <Textarea
          id="r-note"
          value={value.note ?? ""}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="Kindly let us know by…"
        />
      </Field>

      <Field
        label="Meal options"
        hint="Add choices and guests pick one. Leave empty to skip the meal question."
      >
        <ChipList
          values={value.mealChoices ?? []}
          onChange={(next) => set({ mealChoices: next })}
          placeholder="Vegetarian"
          addLabel="Add a meal option"
        />
      </Field>

      <Field
        label="Custom questions"
        hint="Ask guests anything extra (e.g. song requests, dietary needs)."
      >
        <div className="flex flex-col gap-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line bg-canvas p-4"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    value={q.label}
                    onChange={(e) => patchQ(q.id, { label: e.target.value })}
                    placeholder="Any song requests?"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setQuestions(questions.filter((x) => x.id !== q.id))
                  }
                  aria-label="Remove question"
                  className="rounded p-1.5 text-muted hover:text-rose"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  aria-label="Answer type"
                  value={q.type}
                  onChange={(e) =>
                    patchQ(q.id, {
                      type: e.target.value as CustomQuestion["type"],
                    })
                  }
                  className={cn(fieldBase, "w-auto")}
                >
                  <option value="text">Short text</option>
                  <option value="select">Pick one</option>
                </select>
                <Toggle
                  checked={Boolean(q.required)}
                  onChange={(v) => patchQ(q.id, { required: v })}
                  label="Required"
                />
              </div>
              {q.type === "select" && (
                <Field label="Options" hint="Guests pick one of these.">
                  <ChipList
                    values={q.options ?? []}
                    onChange={(next) => patchQ(q.id, { options: next })}
                    placeholder="Option"
                    addLabel="Add an option"
                  />
                </Field>
              )}
            </div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setQuestions([
                ...questions,
                { id: genItemId("q"), label: "", type: "text" },
              ])
            }
          >
            <Plus className="h-4 w-4" />
            Add a question
          </Button>
        </div>
      </Field>
    </div>
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

// ---- Phase 3 forms ---------------------------------------------------------

function CountdownForm({
  value,
  onChange,
}: {
  value: CountdownData;
  onChange: (d: CountdownData) => void;
}) {
  const set = (p: Partial<CountdownData>) => onChange({ ...value, ...p });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="cd-title">
        <Input
          id="cd-title"
          value={value.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Counting down to the big day"
        />
      </Field>
      <Field
        label="Counting down to"
        htmlFor="cd-target"
        hint="Usually your main event."
      >
        <Input
          id="cd-target"
          type="datetime-local"
          value={value.targetDate ?? ""}
          onChange={(e) => set({ targetDate: e.target.value })}
        />
      </Field>
      <Field label="Message after it passes" htmlFor="cd-passed">
        <Input
          id="cd-passed"
          value={value.passedMessage ?? ""}
          onChange={(e) => set({ passedMessage: e.target.value })}
          placeholder="The day is finally here!"
        />
      </Field>
    </div>
  );
}

function MusicForm({
  value,
  siteId,
  onChange,
}: {
  value: MusicData;
  siteId: string;
  onChange: (d: MusicData) => void;
}) {
  const set = (p: Partial<MusicData>) => onChange({ ...value, ...p });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Track name" htmlFor="mu-title" hint="Shown beside the play control.">
        <Input
          id="mu-title"
          value={value.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Our song"
        />
      </Field>
      <Field
        label="Upload a track"
        hint="MP3, M4A or OGG. It stays muted until a guest taps play."
      >
        <AudioField
          siteId={siteId}
          value={value.trackPath}
          onChange={(path) => set({ trackPath: path })}
        />
      </Field>
      <Field label="…or paste a link" htmlFor="mu-url" hint="A direct link to an audio file.">
        <Input
          id="mu-url"
          value={value.trackUrl ?? ""}
          onChange={(e) => set({ trackUrl: e.target.value })}
          placeholder="https://…/song.mp3"
        />
      </Field>
    </div>
  );
}

function WishesForm({
  value,
  onChange,
}: {
  value: WishesData;
  onChange: (d: WishesData) => void;
}) {
  const set = (p: Partial<WishesData>) => onChange({ ...value, ...p });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="wi-title">
        <Input
          id="wi-title"
          value={value.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Leave us a wish"
        />
      </Field>
      <Field label="Invitation" htmlFor="wi-intro">
        <Textarea
          id="wi-intro"
          value={value.intro ?? ""}
          onChange={(e) => set({ intro: e.target.value })}
          placeholder="We'd love to read a note from you…"
        />
      </Field>
      <Toggle
        checked={Boolean(value.autoApprove)}
        onChange={(v) => set({ autoApprove: v })}
        label="Show wishes automatically"
        hint="Off (recommended): each wish waits for your approval before it shows."
      />
    </div>
  );
}

function RegistryForm({
  value,
  siteId,
  onChange,
}: {
  value: RegistryData;
  siteId: string;
  onChange: (d: RegistryData) => void;
}) {
  const items = value.items ?? [];
  const setItems = (next: RegistryItem[]) => onChange({ ...value, items: next });
  const patchItem = (id: string, p: Partial<RegistryItem>) =>
    setItems(items.map((x) => (x.id === id ? { ...x, ...p } : x)));
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="rg-title">
        <Input
          id="rg-title"
          value={value.title ?? ""}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Gift registry"
        />
      </Field>
      <Field label="Intro" htmlFor="rg-intro">
        <Textarea
          id="rg-intro"
          value={value.intro ?? ""}
          onChange={(e) => onChange({ ...value, intro: e.target.value })}
          placeholder="Your presence is the only gift we need — but if you'd like to…"
        />
      </Field>
      <div className="flex flex-col gap-3">
        {items.map((it, i) => (
          <ItemCard
            key={it.id}
            index={i}
            count={items.length}
            onMove={(dir) => setItems(move(items, i, i + dir))}
            onRemove={() => setItems(items.filter((x) => x.id !== it.id))}
          >
            <Field label="Title" htmlFor={`rgt-${it.id}`}>
              <Input
                id={`rgt-${it.id}`}
                value={it.title}
                onChange={(e) => patchItem(it.id, { title: e.target.value })}
                placeholder="Honeymoon fund"
              />
            </Field>
            <Field label="Note" htmlFor={`rgn-${it.id}`}>
              <Input
                id={`rgn-${it.id}`}
                value={it.note ?? ""}
                onChange={(e) => patchItem(it.id, { note: e.target.value })}
                placeholder="A short description"
              />
            </Field>
            <Field label="Link" htmlFor={`rgu-${it.id}`}>
              <Input
                id={`rgu-${it.id}`}
                value={it.url ?? ""}
                onChange={(e) => patchItem(it.id, { url: e.target.value })}
                placeholder="https://…"
              />
            </Field>
            <Field label="Image" hint="Optional.">
              <ImageField
                siteId={siteId}
                value={it.imagePath}
                onChange={(path) => patchItem(it.id, { imagePath: path })}
              />
            </Field>
          </ItemCard>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setItems([...items, { id: genItemId("rg"), title: "" }])}
        >
          <Plus className="h-4 w-4" />
          Add a gift
        </Button>
      </div>
    </div>
  );
}

function LivestreamForm({
  value,
  onChange,
}: {
  value: LivestreamData;
  onChange: (d: LivestreamData) => void;
}) {
  const set = (p: Partial<LivestreamData>) => onChange({ ...value, ...p });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="ls-title">
        <Input
          id="ls-title"
          value={value.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Watch live"
        />
      </Field>
      <Field label="Intro" htmlFor="ls-intro">
        <Textarea
          id="ls-intro"
          value={value.intro ?? ""}
          onChange={(e) => set({ intro: e.target.value })}
          placeholder="Can't be there in person? Join us online."
        />
      </Field>
      <Field label="Stream link" htmlFor="ls-url" hint="YouTube, Zoom, Meet, etc.">
        <Input
          id="ls-url"
          value={value.url ?? ""}
          onChange={(e) => set({ url: e.target.value })}
          placeholder="https://youtube.com/live/…"
        />
      </Field>
      <Field
        label="Goes live at"
        htmlFor="ls-starts"
        hint="Optional — the link is highlighted from this time."
      >
        <Input
          id="ls-starts"
          type="datetime-local"
          value={value.startsAt ?? ""}
          onChange={(e) => set({ startsAt: e.target.value })}
        />
      </Field>
    </div>
  );
}

function FaqForm({
  value,
  onChange,
}: {
  value: FaqData;
  onChange: (d: FaqData) => void;
}) {
  const items = value.items ?? [];
  const setItems = (next: FaqItem[]) => onChange({ ...value, items: next });
  const patchItem = (id: string, p: Partial<FaqItem>) =>
    setItems(items.map((x) => (x.id === id ? { ...x, ...p } : x)));
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="fq-title">
        <Input
          id="fq-title"
          value={value.title ?? ""}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Good to know"
        />
      </Field>
      <div className="flex flex-col gap-3">
        {items.map((it, i) => (
          <ItemCard
            key={it.id}
            index={i}
            count={items.length}
            onMove={(dir) => setItems(move(items, i, i + dir))}
            onRemove={() => setItems(items.filter((x) => x.id !== it.id))}
          >
            <Field label="Question" htmlFor={`fqq-${it.id}`}>
              <Input
                id={`fqq-${it.id}`}
                value={it.q}
                onChange={(e) => patchItem(it.id, { q: e.target.value })}
                placeholder="Can I bring a plus-one?"
              />
            </Field>
            <Field label="Answer" htmlFor={`fqa-${it.id}`}>
              <Textarea
                id={`fqa-${it.id}`}
                value={it.a}
                onChange={(e) => patchItem(it.id, { a: e.target.value })}
                placeholder="Your invitation includes…"
              />
            </Field>
          </ItemCard>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setItems([...items, { id: genItemId("fq"), q: "", a: "" }])}
        >
          <Plus className="h-4 w-4" />
          Add a question
        </Button>
      </div>
    </div>
  );
}

function TravelForm({
  value,
  onChange,
}: {
  value: TravelData;
  onChange: (d: TravelData) => void;
}) {
  const items = value.items ?? [];
  const setItems = (next: TravelItem[]) => onChange({ ...value, items: next });
  const patchItem = (id: string, p: Partial<TravelItem>) =>
    setItems(items.map((x) => (x.id === id ? { ...x, ...p } : x)));
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="tv-title">
        <Input
          id="tv-title"
          value={value.title ?? ""}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Travel & stay"
        />
      </Field>
      <Field label="Intro" htmlFor="tv-intro">
        <Textarea
          id="tv-intro"
          value={value.intro ?? ""}
          onChange={(e) => onChange({ ...value, intro: e.target.value })}
          placeholder="Everything you need to get here and where to rest."
        />
      </Field>
      <div className="flex flex-col gap-3">
        {items.map((it, i) => (
          <ItemCard
            key={it.id}
            index={i}
            count={items.length}
            onMove={(dir) => setItems(move(items, i, i + dir))}
            onRemove={() => setItems(items.filter((x) => x.id !== it.id))}
          >
            <Field label="Title" htmlFor={`tvt-${it.id}`}>
              <Input
                id={`tvt-${it.id}`}
                value={it.title}
                onChange={(e) => patchItem(it.id, { title: e.target.value })}
                placeholder="Where to stay"
              />
            </Field>
            <Field label="Details" htmlFor={`tvb-${it.id}`}>
              <Textarea
                id={`tvb-${it.id}`}
                value={it.body}
                onChange={(e) => patchItem(it.id, { body: e.target.value })}
                placeholder="The Grand Hotel has a special rate for our guests…"
              />
            </Field>
            <Field label="Link" htmlFor={`tvu-${it.id}`} hint="Optional — booking or maps link.">
              <Input
                id={`tvu-${it.id}`}
                value={it.url ?? ""}
                onChange={(e) => patchItem(it.id, { url: e.target.value })}
                placeholder="https://…"
              />
            </Field>
          </ItemCard>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setItems([...items, { id: genItemId("tv"), title: "", body: "" }])}
        >
          <Plus className="h-4 w-4" />
          Add a tip
        </Button>
      </div>
    </div>
  );
}

function DressCodeForm({
  value,
  onChange,
}: {
  value: DressCodeData;
  onChange: (d: DressCodeData) => void;
}) {
  const set = (p: Partial<DressCodeData>) => onChange({ ...value, ...p });
  const swatches = value.swatches ?? [];
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="dc-title">
        <Input
          id="dc-title"
          value={value.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="What to wear"
        />
      </Field>
      <Field label="Guidance" htmlFor="dc-note">
        <Textarea
          id="dc-note"
          value={value.note ?? ""}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="Festive Indian formals. Think rich jewel tones…"
        />
      </Field>
      <Field label="Colours" hint="Optional — a palette to guide guests.">
        <div className="flex flex-wrap items-center gap-2">
          {swatches.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <input
                type="color"
                value={c}
                onChange={(e) =>
                  set({ swatches: swatches.map((x, j) => (j === i ? e.target.value : x)) })
                }
                aria-label={`Colour ${i + 1}`}
                className="h-8 w-8 cursor-pointer rounded border border-line bg-transparent"
              />
              <button
                type="button"
                onClick={() => set({ swatches: swatches.filter((_, j) => j !== i) })}
                aria-label="Remove colour"
                className="rounded p-1 text-muted hover:text-rose"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {swatches.length < 8 && (
            <button
              type="button"
              onClick={() => set({ swatches: [...swatches, "#c19a6b"] })}
              className="flex h-8 items-center gap-1 rounded-[var(--radius-sm)] border border-dashed border-line-strong px-2.5 text-xs text-muted hover:border-brand hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              Colour
            </button>
          )}
        </div>
      </Field>
    </div>
  );
}

function PhotosForm({
  value,
  onChange,
}: {
  value: PhotosData;
  onChange: (d: PhotosData) => void;
}) {
  const set = (p: Partial<PhotosData>) => onChange({ ...value, ...p });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" htmlFor="ph-title">
        <Input
          id="ph-title"
          value={value.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Share your photos"
        />
      </Field>
      <Field label="Intro" htmlFor="ph-intro">
        <Textarea
          id="ph-intro"
          value={value.intro ?? ""}
          onChange={(e) => set({ intro: e.target.value })}
          placeholder="Add the snaps you took — and grab the ones you love."
        />
      </Field>
      <Field
        label="Google Drive folder link"
        htmlFor="ph-url"
        hint="Share a Drive folder (set to 'anyone with the link can add')."
      >
        <Input
          id="ph-url"
          value={value.driveGalleryUrl ?? ""}
          onChange={(e) => set({ driveGalleryUrl: e.target.value })}
          placeholder="https://drive.google.com/drive/folders/…"
        />
      </Field>
    </div>
  );
}
