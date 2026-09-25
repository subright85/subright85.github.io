# Edit your journey

Edit **`journey.json`**. This one file updates the living timeline, globe markers, and moves. No rebuild is needed; reload your local preview. Commit and push the file to update the public site.

## Locations

Give each place a short, unique key in `locations`. Coordinates are **[longitude, latitude]**, in that order. Use `null` when the exact location is unknown; the stay will remain in your journey, but routes touching it will not be drawn.

```json
"tokyo": {
  "city": "Tokyo",
  "country": "Japan",
  "coordinates": [139.6917, 35.6895]
}
```

## Stays, in travel order

Add one entry to `stops` for each stay. Returning to a city means adding another stop using the same location key. The globe connects each stop to the next, so place entries in chronological order.

```json
{
  "id": "tokyo-2027",
  "location": "tokyo",
  "arrived": "2027-04",
  "departed": "2027-06",
  "age_note": null,
  "note": "Visiting researcher",
  "current": false,
  "approximate": false
}
```

The example is illustrative; it is not included in your actual journey.

| Field | Meaning |
| --- | --- |
| `id` | Unique name for this stay. |
| `location` | A key from `locations`. |
| `arrived`, `departed` | `YYYY-MM`, or `null` if unknown. Departure includes that entire month. |
| `period_label` | Optional display label when years are confirmed but month boundaries are approximate. |
| `age_note` | Optional age-based label, e.g. `Birth–age 19`. |
| `note` | Your own description. |
| `current` | `true` only for the final stay where you live now; leave `departed` as `null`. |
| `approximate` | `true` when move months are estimates; shows a dashed bar. |

When adding a new current home, fill the prior home's departure month and change its `current` to `false`. Unknown historical end dates do **not** count as ongoing residence. Stays with neither date are retained in the route but cannot yet have a duration bar.

The initial file preserves your eight known stays, including repeat stays in Pohang and San Jose. Incheon is confirmed as 1985–2004, with Pohang starting in 2004. January boundaries are approximate placeholders for those year-only dates; `period_label` preserves the confirmed year ranges. The early-2016 Korean city remains unknown.

`early_life` is the short sentence above the chart; update it when changing the early history. Conference candidates remain separately in `places.json` and never become journey stops automatically.

## Check before publishing

```sh
node scripts/check-journey.cjs
python3 -m http.server 8000
```

Open `http://localhost:8000/places.html`. Select a move below the globe to highlight its direction and center the map on that route. Curves connect places geographically; they are not claimed flight paths.
