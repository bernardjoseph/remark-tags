import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkDirective from 'remark-directive'
import remarkCitekey from '@bernardjoseph/remark-citekey'
import remarkTags from '../index.js'

/** @type {import('unified').Preset} */
const defaultPreset = {
  plugins: [
    remarkParse,
    [remarkFrontmatter, 'yaml'],
    remarkDirective,
    remarkCitekey,
    remarkTags
  ]
}

export default defaultPreset
