# 04 — Album covers

Adds real album covers. The existing design stays exactly as it is; only the colored placeholder square gets replaced by a real cover when one is found.

## Album covers

- Each record shows its real album cover where the colored square currently is.
- Covers come from the **iTunes Search API**, searched by artist + album title. Use a large image size (at least 600px) so covers look sharp.
- **Fallback:** the current colored square with initials is shown:
  - while the cover is loading,
  - when no cover is found,
  - when the request fails.
- Results are cached in the browser, including "no cover found", so each album is only looked up once, even after reloads.
- Covers appear everywhere records appear: home grid, record detail, profile pages and trade pages.

## Header fix

- The active user's name currently appears twice in the header. Show it only once, in the user switcher.

## Acceptance criteria

- **AC-D.1** Seed records show their real album covers.
- **AC-D.2** A made-up album (e.g. artist "Test", album "Nothing Real") shows the colored placeholder.
- **AC-D.3** The placeholder shows while a cover loads, with no blank or broken image.
- **AC-D.4** After a reload, covers appear without being fetched again.
- **AC-D.5** Nothing else about the existing design changes.
- **AC-D.6** The header shows the active user's name only once.
