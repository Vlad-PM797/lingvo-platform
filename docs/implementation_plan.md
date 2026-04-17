# Task: EasyEnglish OCR Mapping + Unique Trainer Illustrations

## Implementation Details
- Use OCR output from `E:\EasyEnglish.pdf` to prepare reusable curriculum mapping artifacts.
- Build a structured mapping from textbook topics to Lingvo lesson codes for import/planning.
- Keep trainer/page visual style inspired by textbook illustrated cards, but use original unique SVG artwork.
- Preserve existing file names for lesson artwork so runtime references in `app.bundle.js` stay valid.

## Subtasks
- [x] Run OCR and extract source text from PDF
- [x] Build normalized topic map in JSON
- [x] Export topic map in CSV for spreadsheet editing
- [x] Replace lesson illustration assets with unique SVG drawings
- [x] Validate SVG/text outputs and check lints

## Testing Plan
- [x] Verify JSON/CSV files open and contain consistent topic IDs
- [x] Verify `trainer.html` and `project.html` still render lesson images (file name compatibility preserved)
- [x] Verify `app.bundle.js` resolves existing image filenames
- [x] Parse all new SVG files to confirm valid XML
- [x] Linter check for edited frontend files

## Verification
- [x] OCR results saved (`E:\EasyEnglish_ocr.txt`, `E:\EasyEnglish_ocr_summary.json`)
- [x] Topic mapping artifacts committed in repo
- [x] Unique lesson illustrations visible in trainer/pages
- [x] No linter/XML errors after changes
