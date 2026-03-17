#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'src/assets/icons/anchor.svg')
const outDir = join(root, 'build')
const outPath = join(outDir, 'icon.png')

const svg = readFileSync(svgPath, 'utf-8')
  .replace('currentColor', '#3b82f6')

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1024 },
})
const png = resvg.render()
const pngData = png.asPng()

mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, pngData)
console.log('Generated', outPath)
