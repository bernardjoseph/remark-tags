import os from 'os'

/** @type {import('unified').Plugin<unknown[]>} Plugin */
export default function stringifyTags() {
  /** @type {import('unified').CompilerFunction<unknown, string>} */
  function compiler(_, file) {
    const tags = file.data && file.data.tags
    return JSON.stringify(tags) + os.EOL
  }

  Object.assign(this, {Compiler: compiler})
}
