#!/usr/bin/env node
import {args} from 'unified-args'
import {unified} from 'unified'
import defaultPreset from '../lib/default-preset.js'
import stringifyTags from '../lib/stringify-tags.js'

args({
  processor: unified().use(defaultPreset).use(stringifyTags),
  name: 'remark-tags',
  description: 'Generate tags for Markdown documents',
  version: '1.0.0',
  pluginPrefix: 'remark',
  extensions: ['md'],
  packageField: 'remarkTagsConfig',
  rcName: '.remarktagsrc',
  ignoreName: '.remarktagsignore'
})
