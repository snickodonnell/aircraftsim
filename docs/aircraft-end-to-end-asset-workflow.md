# Aircraft End-to-End Asset Workflow Pointer

Read the full aircraft asset workflow before generating or processing aircraft models:

```txt
docs/docs/aircraft-end-to-end-asset-workflow.md
```

That document is the current source of truth for turning a manually generated 2D aircraft concept image into a runtime aircraft visual asset plus a mapped data-driven aircraft profile.

Key rules from the workflow:

- Do not call Meshy until the user explicitly approves a live generation step.
- Do not batch-generate aircraft unless explicitly instructed.
- Store source aircraft images under `public/images/references/aircraft/<aircraftId>/`.
- Store aircraft GLBs under `public/models/{raw,cleaned,optimized}/aircraft/<aircraftId>/`.
- Runtime aircraft visuals must use optimized GLBs.
- The model is visual only; flight physics come from `aircraftProfileId`.
- Do not derive aerodynamic data from Meshy geometry.
- Record metadata, cleanup reports, optimization reports, source notes, assumptions, and profile confidence.
