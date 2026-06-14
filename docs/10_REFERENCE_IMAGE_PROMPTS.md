# 10 — Reference Image Prompts

This document provides prompt templates for generating 2D images that work well as input for image-to-3D tools.

The goal is not splash art. The goal is clear reconstruction input.

## General rules

Good 2D reference images should have:

- plain background
- single object only
- centered composition
- strong silhouette
- consistent proportions
- neutral lighting
- no dramatic shadows
- no cropped edges
- no text labels over the object
- no extra props unless part of the asset

Avoid:

- cinematic lighting
- action poses
- motion blur
- heavy perspective distortion
- busy backgrounds
- multiple versions of the same object in one view unless using a reference sheet intentionally

## Single prop prompt

```txt
Create a clean orthographic reference image for a stylized low-poly browser game prop: [ASSET DESCRIPTION].

Single object only.
Plain white background.
Centered composition.
Neutral lighting.
Readable silhouette.
No dramatic shadows.
No text.
No labels.
No extra objects.
Game-ready stylized proportions.
Slightly simplified geometry suitable for a real-time browser game.
```

## Multi-view prop reference sheet prompt

```txt
Create a clean orthographic reference sheet for a stylized low-poly browser game prop: [ASSET DESCRIPTION].

Include four views: front, side, back, and 3/4 view.
Keep proportions consistent across all views.
Plain white background.
Neutral lighting.
No dramatic shadows.
No perspective distortion.
No labels over the object.
Single asset only.
Readable silhouette.
Simplified game-ready design.
```

## Character reference sheet prompt

```txt
Create a clean T-pose character reference sheet for a stylized low-poly browser game character: [CHARACTER DESCRIPTION].

Views: front, side, back, and 3/4.
Neutral T-pose.
Plain white background.
Consistent clothing and proportions across views.
No weapon in hand unless it is permanently part of the character.
No action pose.
No dramatic lighting.
No background scene.
Game-ready stylized proportions.
Readable silhouette.
```

## Enemy creature reference prompt

```txt
Create a clean orthographic creature reference sheet for a stylized low-poly browser game enemy: [CREATURE DESCRIPTION].

Views: front, side, back, and 3/4.
Neutral standing pose.
Plain white background.
Consistent proportions across views.
Clear silhouette.
No motion blur.
No gore.
No background.
Simplified forms suitable for real-time browser game use.
```

## Environmental asset prompt

```txt
Create a clean orthographic reference image for a modular stylized low-poly environment asset: [ASSET DESCRIPTION].

Single modular object only.
Plain white background.
Neutral lighting.
No terrain base unless requested.
No labels.
No extra props.
Designed for a browser game level kit.
Readable silhouette from a distance.
```

## Example asset prompts

### Wooden chest

```txt
Create a clean orthographic reference sheet for a stylized low-poly fantasy wooden treasure chest.

Include four views: front, side, back, and 3/4 view.
Dark iron bands.
Warm brown wood.
Simple readable lock plate.
Keep proportions consistent across all views.
Plain white background.
Neutral lighting.
No dramatic shadows.
No perspective distortion.
No labels over the object.
Single asset only.
Readable silhouette.
Simplified game-ready design.
```

### Stone wall segment

```txt
Create a clean orthographic reference image for a modular stylized low-poly stone wall segment for a browser game.

Single wall segment only.
Plain white background.
Neutral lighting.
Blocky stones with readable shape.
No moss unless specified.
No terrain base.
No labels.
No extra props.
Designed as a reusable level kit piece.
```

### Urban samurai character

```txt
Create a clean T-pose character reference sheet for a stylized low-poly browser game character: an urban samurai with light steampunk details.

Views: front, side, back, and 3/4.
Neutral T-pose.
Plain white background.
Consistent clothing and proportions across views.
No weapon in hand.
No action pose.
No dramatic lighting.
No background scene.
Readable silhouette.
Game-ready stylized proportions.
```
