#!/usr/bin/env node
/**
 * Build macOS-style app icon: squircle background + padded anchor glyph.
 * Matches macOS Dock design (rounded corners, internal padding).
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'src/assets/icons/anchor.svg')
const outDir = join(root, 'build')
const outPath = join(outDir, 'icon.png')

const anchorRaw = readFileSync(svgPath, 'utf-8').replace('currentColor', '#3b82f6')
const anchorInner = anchorRaw.replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

// macOS-style: 1024x1024, squircle bg (radius ~18%), icon at ~72% with padding
const SIZE = 1024
const PADDING = Math.round(0.14 * SIZE)  // ~14% padding - icon occupies ~72%
const ICON_SIZE = SIZE - 2 * PADDING
const RADIUS = 185  // squircle corner radius for 1024
const SCALE = ICON_SIZE / 24

const compositeSvg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">`,
  `  <rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="#ffffff"/>`,
  `  <g transform="translate(${PADDING}, ${PADDING}) scale(${SCALE})" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`,
  anchorInner.split('\n').map((l) => '    ' + l.trim()).filter(Boolean).join('\n'),
  '  </g>',
  '</svg>',
].join('\n')

const resvg = new Resvg(compositeSvg)
const png = resvg.render()
const pngData = png.asPng()

mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, pngData)
console.log('Generated', outPath)
