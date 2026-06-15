# Aircraft End-to-End Asset Workflow Pointer

Read the full aircraft asset workflow before generating or processing aircraft models:

```txt
docs/docs/aircraft-end-to-end-asset-workflow.md
```

That document is the current source of truth for turning a manually generated 2D aircraft concept image into a runtime aircraft visual asset plus a mapped data-driven aircraft profile.

Key rules from the workflow:

- Do not call Meshy until the user explicitly approves a live generation step.
- For a single-aircraft task, run Meshy dry-run first; then make exactly one live create call only for the requested aircraft.
- Do not batch-generate aircraft unless explicitly instructed.
- Store source aircraft images under `public/images/references/aircraft/<aircraftId>/`.
- Store aircraft GLBs under `public/models/{raw,cleaned,optimized}/aircraft/<aircraftId>/`.
- Runtime aircraft visuals must use optimized GLBs.
- The model is visual only; flight physics come from `aircraftProfileId`.
- Do not derive aerodynamic data from Meshy geometry.
- Confirm/fix visual orientation so the aircraft frame is `+X` right wing, `+Y` up, `-Z` nose/forward.
- Record metadata, cleanup reports, optimization reports, source notes, assumptions, and profile confidence.
