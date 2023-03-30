#!/usr/bin/env node
import {Configuration} from 'unified-engine/lib/configuration.js'
import {unified} from 'unified'
import defaultPreset from '../lib/default-preset.js'
import stringifyTags from '../lib/stringify-tags.js'
import LineByLine from 'line-by-line'
import {readSync} from 'to-vfile'
import os from 'os'

const processor = unified().use(defaultPreset).use(stringifyTags)

const configuration = new Configuration({
  cwd: process.cwd(),
  detectConfig: true,
  rcName: '.remarktagsrc'
})

process.stdin.setEncoding('utf-8')

const lr = new LineByLine(process.stdin)

lr.on('line', (line) => {
  lr.pause()
  configuration.load(line, (error, preset) => {
    if (error) throw error
    const result = processor().use(preset).processSync(readSync(line))
    if (result) process.stdout.write(String(result))
    lr.resume()
  })
})
