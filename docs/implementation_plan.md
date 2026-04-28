# Task: EasyEnglish OCR Mapping + Unique Trainer Illustrations

## Implementation Details
- Use OCR output from `E:\EasyEnglish.pdf` to prepare reusable curriculum mapping artifacts.
- Build a structured mapping from textbook topics to Lingvo lesson codes for import/planning.
- Keep trainer/page visual style inspired by textbook illustrated cards, but use original unique SVG artwork.
- Preserve existing file names for lesson artwork so runtime references in the trainer modules stay valid.

## Subtasks
- [x] Run OCR and extract source text from PDF
- [x] Build normalized topic map in JSON
- [x] Export topic map in CSV for spreadsheet editing
- [x] Replace lesson illustration assets with unique SVG drawings
- [x] Validate SVG/text outputs and check lints

## Testing Plan
- [x] Verify JSON/CSV files open and contain consistent topic IDs
- [x] Verify `trainer.html` and `project.html` still render lesson images (file name compatibility preserved)
- [x] Verify the trainer module flow resolves existing image filenames
- [x] Parse all new SVG files to confirm valid XML
- [x] Linter check for edited frontend files

## Verification
- [x] OCR results saved (`E:\EasyEnglish_ocr.txt`, `E:\EasyEnglish_ocr_summary.json`)
- [x] Topic mapping artifacts committed in repo
- [x] Unique lesson illustrations visible in trainer/pages
- [x] No linter/XML errors after changes

# Task: Tester Activity Monitoring (who/where/how long)

## Implementation Details
- Add backend activity tracking table keyed by user + client fingerprint (IP + User-Agent) + day.
- Record activity on successful login and on authorized learning/admin requests.
- Add admin endpoint returning aggregated tester activity with duration and last-seen data.
- Add UI block in `project.html` so admin can fetch and view activity.

## Subtasks
- [x] Add DB migration for tester activity table + indexes
- [x] Implement repository/service/middleware for activity touch + aggregate query
- [x] Expose admin API endpoint `GET /admin/testers/activity`
- [x] Add frontend viewer in `project.html` + `project.js`
- [x] Run typecheck/lint style checks and validate flow

## Testing Plan
- [x] Run backend typecheck
- [ ] Run migration script
- [ ] Verify login/learning requests update activity rows
- [ ] Verify admin endpoint shows user/email, IP/origin, duration and request counts
- [x] Verify frontend block loads data for admin and shows 403 hint for non-admin

## Verification
- [x] Backend builds without errors
- [ ] Endpoint returns expected data shape
- [ ] Frontend viewer renders and refreshes

# Task: UA Base + EN/IT Target Learning Mode

## Implementation Details
- Keep Ukrainian as source language for prompts (`ua_text` unchanged as baseline).
- Add optional Italian target text storage to DB (`it_text`) for words/phrases.
- Add `targetLang` query support (`en` default, `it` optional) on lesson content endpoint.
- Keep backward compatibility: if Italian text is missing, fallback to English target text.
- Add frontend selector in `project.html` to choose learning target (EN/IT).

## Subtasks
- [x] Add migration for `it_text` columns in lesson words/phrases
- [x] Extend backend repository/service/controller/schemas for `targetLang`
- [x] Extend admin create/update schemas/services/repositories with optional `itText`
- [x] Add frontend language selector and persist choice in localStorage
- [x] Validate typecheck/build and API compatibility

## Testing Plan
- [x] Run backend typecheck/build
- [ ] Verify `GET /learning/lessons/:id?targetLang=en` returns EN target
- [ ] Verify `GET /learning/lessons/:id?targetLang=it` returns IT target or EN fallback
- [x] Verify project UI changes target language without breaking attempts/progress

## Verification
- [x] Existing EN flow works unchanged
- [x] IT mode is selectable and functional
