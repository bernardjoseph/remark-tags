# remark-tags

**[remark][]** plugin to generate tags for Markdown documents.

## Install

This package is [ESM
only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install remark-tags
```

## Use

Say we have the following file, `example.md`:

```markdown
---
title: An Example document
author: N. N.
date: 2021-10-01
keywords:
  - Markdown
  - Tags
nocite: |
  @doe1999, @smith2004
---

See :link[A text directive]{ref=Target}, :link[Another target]
and @wadler1989 [sec. 1.3; and -@hughes1990, pp. 4].
```

And our module, `example.js`, looks as follows:

```js
import {readSync} from 'to-vfile'
import {reporter} from 'vfile-reporter'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkDirective from 'remark-directive'
import remarkCitekey from '@bernardjoseph/remark-citekey'
import remarkTags from '@bernardjoseph/remark-tags'

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, 'yaml')
  .use(remarkDirective)
  .use(remarkCitekey)
  .use(remarkTags, {
    kinds: {
      yaml: {
        title: {kind: 'title'},
        author: {kind: 'author'},
        date: {kind: 'date'},
        keywords: {kind: 'keyword'},
        nocite: {kind: 'nocite', nocite: true}
      },
      textDirective: {
        link: {kind: 'link', ref: 'ref'}
      },
      citekeyId: {kind: 'cite'}
    }
  })

const tree = processor().parse(readSync('example.md'))

processor().run(tree, (err, _, file) => {
  if (err) throw err
  console.error(reporter(file))
  // @ts-expect-error
  console.dir(file.data ? file.data.tags || [] : [], {depth: null})
})
```

Now, running `node example` yields:

```txt
no issues found
```

```js
[
  { name: 'An Example document', kind: 'title', line: 1, column: 1 },
  { name: 'N. N.', kind: 'author', line: 1, column: 1 },
  { name: '2021-10-01', kind: 'date', line: 1, column: 1 },
  { name: 'Markdown', kind: 'keyword', line: 1, column: 1 },
  { name: 'Tags', kind: 'keyword', line: 1, column: 1 },
  { name: 'doe1999', kind: 'nocite', line: 1, column: 1 },
  { name: 'smith2004', kind: 'nocite', line: 1, column: 1 },
  { name: 'Target', kind: 'link', line: 12, column: 5 },
  { name: 'Another target', kind: 'link', line: 12, column: 42 },
  { name: 'wadler1989', kind: 'cite', line: 13, column: 6 },
  { name: 'hughes1990', kind: 'cite', line: 13, column: 34 }
]
```

Tags are generated for [YAML][] frontmatter entries, `link` text directives and
[Pandoc-style citation keys][pandoc-citations].
Text directives are described in a [proposal for a syntax extension of the
Markdown language][directives-plugins-syntax].
In the proposal, they are called inline directives.
In the example above, text directives are used as links to other documents.

## API

This package exports no identifiers.
The default export is `remarkTags`.
The package installs the executables `remark-tags` and `remark-tags-filter`.

### `processor().use(remarkTags[, options])`

Configures `processor` to generate tags for Markdown documents, depending on the
node types of the nodes of the [abstract syntax trees][mdast] that are generated
for Markdown documents by the **[remark][]** parser.
The node types of the nodes for which tags are generated must be defined and
configured by the [`kinds` option][options-kinds] of the `remark-tags` plugin.

Nodes of type `yaml` are generated for frontmatter entries by the `remark-tags`
plugin if the frontmatter of the Markdown document is parsed by the
[`remark-frontmatter`][remark-frontmatter] plugin.
Nodes of type `textDirective` are generated for text directives by the
[`remark-directive`][remark-directive] plugin.
In addition, the following example `processor` generates tags for nodes of type
`citekeyId`, which are generated for [Pandoc-style citation
keys][pandoc-citations] by the [`remark-citekey`][remark-citekey] plugin:

```js
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkDirective from 'remark-directive'
import remarkCitekey from '@bernardjoseph/remark-citekey'
import remarkTags from '@bernardjoseph/remark-tags'

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, 'yaml')
  .use(remarkDirective)
  .use(remarkCitekey)
  .use(remarkTags, {
    kinds: {
      yaml: {
        title: {kind: 'title'},
        author: {kind: 'author'},
        date: {kind: 'date'},
        keywords: {kind: 'keyword'},
        nocite: {kind: 'nocite', nocite: true}
      },
      textDirective: {
        link: {kind: 'link', ref: 'ref'}
      },
      citekeyId: {kind: 'cite'}
    }
  })
```

Running `processor().run(processor().parse(file))` generates an array containing
a tag for each entry of the [YAML][] frontmatter whose key has an entry in the
value of the `yaml` entry of the [`kinds` option][options-kinds], for each text
directive whose name has an entry in the value of the `textDirective` entry of
the [`kinds` option][options-kinds], and for each other node whose node type has
an entry in the [`kinds` option][options-kinds] (which are the nodes of type
`citekeyId` in the example `processor`).
Each tag is an object with entries `name` for the identifier of the tag, `kind`
for the kind of the tag, and `line` and `column` for the source line and the
source column of the tag in the parsed document.
The array of tags is assigned to `file.data.tags`.

###### `options.kinds`

The node types of the nodes for which tags are generated must be defined and
configured by the [`kinds` option][options-kinds].
The value of the [`kinds` option][options-kinds] is an object whose keys are
node types and whose values are objects.

The value of a [`kinds` option][options-kinds] entry with key `yaml` is an
object mapping [YAML][] frontmatter keys to configuration objects.
For a frontmatter entry, tags are generated only if its key is one of the keys
of the mapping.
Each configuration object has a mandatory `kind` entry and an optional `nocite`
entry.
Unless the value of the optional `nocite` entry is `true`, tags are generated if
the value of the frontmatter entry is either a single [YAML][] block or flow
scalar or a [YAML][] block or flow sequence of [YAML][] block or flow scalars.
For each [YAML][] scalar contained in value of such a frontmatter entry, a tag
whose identifier is the [YAML][] scalar and whose kind is the value of the
`kind` entry of the configuration object is generated.
If the value of the optional `nocite` entry of the configuration object is
`true`, tags are generated if the value of the frontmatter entry is a [YAML][]
block scalar.
In this case, the frontmatter entry is treated as a `nocite` entry in the sense
of [Pandoc, containing citation keys of bibliographic references that are not
explicitly cited in the document but should occur in a bibliography for the
document][including-uncited-items-in-the-bibliography].
For each [Pandoc-style citation key][pandoc-citations] that is contained in the
value of such a frontmatter entry, a tag whose identifier is the citation key
without the leading `@` and whose kind is the value of the `kind` entry of the
configuration object is generated.

The value of a [`kinds` option][options-kinds] entry with key `textDirective` is
an object mapping names of text directives to configuration objects.
A tag is generated for each text directive whose name is one of the keys of the
mapping.
Each configuration object has a mandatory `kind` entry and an optional `ref`
entry.
The kind of the generated tag is the value of the `kind` entry.
The value of the optional `ref` entry is the name of an optional text directive
attribute.
If the text directive has an attribute with that name, the identifier of the
generated tag is the value of that attribute.
If the text directive has no such attribute, or the configuration object of the
text directive has no `ref` entry, the identifier of the generated tag is the
content of the text directive (which is a Markdown formatted string).

The value of a [`kinds` option][options-kinds] entry whose key is a node type
other than `yaml` or `textDirective` is a configuration object with a mandatory
`kind` entry.
For each node of the key node type, a tag whose identifier is the content of the
node and whose kind is the value of the `kind` entry of the configuration object
is generated.
The example `processor` above, for instance, generates tags of kind `cite` for
nodes of type `citekeyId`, whose identifiers are the citation keys of
[Pandoc-style citations][pandoc-citations] without the leading `@`.

###### `options.strict`

The `strict` option is a `boolean` option to restrict [Pandoc-style citation
keys][pandoc-citations] in [`nocite`][options-kinds] entries of the [YAML][]
frontmatter to ASCII.
Its default value is `false`.

The `strict` option of the `remark-tags` plugin corresponds to the [`strict`
option of the `remark-citekey` plugin][remark-citekey-option], which is passed
to [`micromark-extension-citekey`][micromark-extension-citekey].
If the [`remark-citekey`][remark-citekey] plugin is imported, both `strict`
options should always have the same value.

###### Caveat

The [`remark-frontmatter`][remark-frontmatter] plugin parses frontmatters as
whole blocks.
Therefore, the `line` and the `column` entries of the tags that are generated
for frontmatter entries contain the starting line and column of the whole
frontmatter block instead of the starting lines and columns of the individual
entries.

### The `remark-tags` executable

The `remark-tags` executable reads the file name of a Markdown document from the
command line and prints a JSON formatted array of tags on the `console`.
It uses the following **[unified-args][]** command line interface:

```js
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
```

With default preset:

```js
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkDirective from 'remark-directive'
import remarkCitekey from '@bernardjoseph/remark-citekey'
import remarkTags from '@bernardjoseph/remark-tags'

const defaultPreset = {
  plugins: [
    remarkParse,
    [remarkFrontmatter, 'yaml'],
    remarkDirective,
    remarkCitekey,
    remarkTags
  ]
}
```

And compiler:

```js
export default function stringifyTags() {
  function compiler(_, file) {
    const tags = file.data && file.data.tags
    return JSON.stringify(tags) + os.EOL
  }

  Object.assign(this, {Compiler: compiler})
}
```

The `remark-tags` executable can be configured by a [configuration
file][unified-engine-configuration] with base name `remarktagsrc`.
The [ignore file][unified-engine-ignoring] is `.remarktagsignore`.

### The `remark-tags-filter` executable

The `remark-tags-filter` executable reads file names of Markdown documents from
`process.stdin`, one file name per line, and prints JSON formatted arrays of
tags on the `console`, one array per file.
It uses the same processor as the [`remark-tags`
executable][the-remark-tags-executable] and can be configured by a
[configuration file][unified-engine-configuration] with base name
`remarktagsrc`.

An example [configuration file][unified-engine-configuration] looks as follows:

```js
{
  "plugins": {
    "remark-tags": {
      "strict": true,
      "kinds": {
        "yaml": {
          "title": {"kind": "title"},
          "author": {"kind": "author"},
          "date": {"kind": "date"},
          "keywords": {"kind": "keyword"},
          "nocite": {"kind": "nocite", "nocite": true}
        },
        "textDirective": {
          "link": {"kind": "link", "ref": "ref"}
        },
        "citekeyId": {"kind": "cite"}
      }
    },
    "remark-citekey": {
      "strict": true
    }
  }
}
```

## Related

*   [`unifiedjs/unified`][unified]
    — interface for processing text using syntax trees
*   [`remarkjs/remark`][remark]
    — markdown processor powered by plugins
*   [`remarkjs/remark-parse`][remark-parse]
    — parses Markdown to **[mdast][]** syntax trees
*   [`remarkjs/remark-frontmatter`][remark-frontmatter]
    — plugin to support frontmatter
*   [`remarkjs/remark-directive`][remark-directive]
    — plugin to support the [generic directives
    proposal][directives-plugins-syntax]
*   [`@bernardjoseph/remark-citekey`][remark-citekey]
    — plugin to support [Pandoc-style citation keys][pandoc-citations]

## Contribute

See [`contributing.md` in `micromark/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © Bernd Rellermeyer

<!-- Definitions -->

[npm]: https://docs.npmjs.com/cli/install

[unified]: https://github.com/unifiedjs/unified

[unified-engine-configuration]: https://github.com/unifiedjs/unified-engine/blob/main/doc/configure.md

[unified-engine-ignoring]: https://github.com/unifiedjs/unified-engine/blob/main/doc/ignore.md

[unified-args]: https://github.com/unifiedjs/unified-args

[remark]: https://github.com/remarkjs/remark

[remark-parse]: https://github.com/remarkjs/remark/tree/main/packages/remark-parse

[remark-frontmatter]: https://github.com/remarkjs/remark-frontmatter

[remark-directive]: https://github.com/remarkjs/remark-directive

[remark-citekey]: https://github.com/bernardjoseph/remark-citekey

[remark-citekey-option]: https://github.com/bernardjoseph/remark-citekey#optionsstrict

[mdast]: https://github.com/syntax-tree/mdast

[micromark-extension-citekey]: https://github.com/bernardjoseph/micromark-extension-citekey

[yaml]: https://yaml.org

[pandoc-citations]: https://pandoc.org/MANUAL.html#citations

[including-uncited-items-in-the-bibliography]: https://pandoc.org/MANUAL.html#including-uncited-items-in-the-bibliography

[directives-plugins-syntax]: https://talk.commonmark.org/t/generic-directives-plugins-syntax/444

[contributing]: https://github.com/unifiedjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/unifiedjs/.github/blob/HEAD/support.md

[coc]: https://github.com/unifiedjs/.github/blob/HEAD/code-of-conduct.md

[license]: https://github.com/micromark/micromark/blob/main/license

[options-kinds]: #optionskinds

[the-remark-tags-executable]: #the-remark-tags-executable
