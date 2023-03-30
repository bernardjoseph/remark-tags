/**
 * @typedef {import('mdast').Root|import('mdast').Content} Node
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 * @typedef {import('mdast-util-directive').TextDirective} TextDirective
 */

/**
 * @typedef Options
 * @property {Object<string, Object>} [kinds]
 * @property {boolean} [strict]
 *
 * @typedef TagInfo
 * @property {string} name
 * @property {string} kind
 * @property {number} line
 * @property {number} column
 */

import {visit} from 'unist-util-visit'
import {load, FAILSAFE_SCHEMA} from 'js-yaml'
import {directiveFromMarkdown} from 'mdast-util-directive'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkCitekey from 'remark-citekey'

/** @type {FromMarkdownHandle|undefined} */
const exitDirectiveTextLabelString =
  // @ts-expect-error
  directiveFromMarkdown.exit.directiveTextLabelString

/** @type {FromMarkdownHandle|undefined} */
const exitDirectiveTextAttributes =
  // @ts-expect-error
  directiveFromMarkdown.exit.directiveTextAttributes

/**
 * Plugin to generate tags for Markdown documents.
 *
 * @type {import('unified').Plugin}<[Options?]|void[], Node, Node>}
 */
export default function remarkTags(options = {}) {
  /* c8 ignore next 2 */
  const kinds = options.kinds || {}
  const kindsYaml = kinds.yaml || {}
  const kindsTextDirective = kinds.textDirective || {}
  const strict = options.strict || false

  /** @type {FromMarkdownHandle} */
  function exitTagsTextDirectiveLabelString(token) {
    if (exitDirectiveTextLabelString)
      /* c8 ignore next 1 */
      exitDirectiveTextLabelString.call(this, token)

    const node = /** @type {TextDirective & {ref: string}} */ (
      this.stack[this.stack.length - 1]
    )

    if (Object.keys(kindsTextDirective).includes(node.name))
      node['ref'] = this.sliceSerialize(token).replace(/\r?\n/g, ' ')
  }

  // @ts-expect-error
  directiveFromMarkdown.exit['directiveTextLabelString'] =
    exitTagsTextDirectiveLabelString

  /** @type {FromMarkdownHandle} */
  function exitTagsTextDirectiveAttributes(token) {
    if (exitDirectiveTextAttributes)
      /* c8 ignore next 1 */
      exitDirectiveTextAttributes.call(this, token)

    const node = /** @type {TextDirective & {ref: string}} */ (
      this.stack[this.stack.length - 1]
    )

    if (Object.keys(kindsTextDirective).includes(node.name)) {
      const ref = node.attributes && node.attributes.ref
      if (ref) node['ref'] = ref.replace(/\r?\n/g, ' ')
    }
  }

  // @ts-expect-error
  directiveFromMarkdown.exit['directiveTextAttributes'] =
    exitTagsTextDirectiveAttributes

  /** @type {import('unified').FrozenProcessor} */
  const citekeyProcessor = unified()
    .use(remarkParse)
    .use(remarkCitekey, {strict: strict})
    .freeze()

  return (tree, file) => {
    /** @type {Array<TagInfo>} */
    let tags = []

    visit(tree, Object.keys(kinds), (node) => {
      // @ts-expect-error
      const line = node.position.start.line
      // @ts-expect-error
      const column = node.position.start.column

      switch (node.type) {
        case 'yaml':
          if (kindsYaml) {
            /** @type Object */
            let parsedValue = []
            try {
              // @ts-expect-error
              parsedValue = load(node.value, {schema: FAILSAFE_SCHEMA})
              /* c8 ignore next 1 */
            } catch (e) {}
            Object.entries(parsedValue).forEach((entry) => {
              const [key, value] = entry
              const opts = kindsYaml[key]
              if (opts) {
                if (opts.nocite) {
                  visit(citekeyProcessor.parse(value), 'citekeyId', (id) => {
                    tags.push({
                      // @ts-expect-error
                      name: id.value,
                      kind: opts.kind,
                      line: line,
                      column: column
                    })
                  })
                } else if (Array.isArray(value)) {
                  value.forEach((id) => {
                    tags.push({
                      name: id,
                      kind: opts.kind,
                      line: line,
                      column: column
                    })
                  })
                } else
                  tags.push({
                    name: value,
                    kind: opts.kind,
                    line: line,
                    column: column
                  })
              }
            })
          }
          break
        case 'textDirective':
          // @ts-expect-error
          if (Object.keys(kindsTextDirective).includes(node.name)) {
            // @ts-expect-error
            const opts = kindsTextDirective[node.name]
            if (opts) {
              tags.push({
                // @ts-expect-error
                name: node.ref,
                kind: opts.kind,
                line: line,
                column: column
              })
            }
          }
          break
        default:
          const kindType = kinds[node.type]
          if (kindType) {
            tags.push({
              // @ts-expect-error
              name: node.value,
              kind: kindType.kind,
              line: line,
              column: column
            })
            break
          }
      }
    })

    /* c8 ignore next 1 */
    file.data ? (file.data['tags'] = tags) : (file['data'] = {tags: [tags]})

    return tree
  }
}
