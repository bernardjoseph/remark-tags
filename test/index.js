import test from 'tape'
import {execa} from 'execa'
import {fork} from 'child_process'
import strip from 'strip-ansi'
import os from 'os'
import fs from 'fs'
import path from 'path'

const fixtures = path.join('test', 'fixtures')
const cli = path.join('bin', 'cli.js')
const filter = path.join('bin', 'filter.js')

test('Command Line Interface', (t) => {
  t.plan(1)

  execa(cli, [path.join(fixtures, 'example.md')]).then((result) => {
    const actual = JSON.parse(strip(String(result.stdout)))
    t.deepEqual(
      actual,
      JSON.parse(String(fs.readFileSync(path.join(fixtures, 'example.json')))),
      'should work'
    )
    t.end()
  })
})

testFilter('Filter', getTestInputFromDir(path.join(fixtures, 'filter')))

testFilter(
  'Filter (ASCII citation keys)',
  getTestInputFromDir(path.join(fixtures, 'strict'))
)

testFilter('Filter (corrupt config file)', [
  {
    file: path.join(fixtures, 'fail', 'empty.md'),
    name: 'should fail with corrupt config file',
    shouldFail: true
  }
])

testFilter('Filter (missing input file)', [
  {
    file: path.join(fixtures, 'missing.md'),
    name: 'should fail with missing input file',
    shouldFail: true
  }
])

/**
 * @param {string} name
 * @param {Array<any>} input
 */
function testFilter(name, input) {
  test(name, (t) => {
    const child = fork(filter, [], {silent: true})
    let index = 0

    t.plan(input.length)

    // @ts-expect-error
    child.stdout.on('data', (data) => {
      const tname = input[index].name || 'file'
      const expected = input[index].expected || []
      const shouldFail = input[index].shouldFail || false
      const msg =
        input[index++].msg || (shouldFail ? 'should fail' : 'should work')

      t.test(tname, (st) => {
        if (shouldFail) {
          st.fail(String(data))
        } else {
          st.deepEqual(JSON.parse(strip(String(data))), expected, msg)
          st.end()
        }
      })
    })

    // @ts-expect-error
    child.stderr.on('data', (error) => {
      const tname = input[index].name || 'file'
      const shouldFail = input[index].shouldFail || false
      const msg =
        input[index++].msg || (shouldFail ? 'should fail' : 'should work')

      t.test(tname, (st) => {
        if (shouldFail) {
          st.pass(msg)
          st.end()
        } else {
          st.fail(String(error))
        }
      })
    })

    // @ts-expect-error
    child.stdin.write(input.map((i) => i.file).join(os.EOL))
    // @ts-expect-error
    child.stdin.write(os.EOL)
    // @ts-expect-error
    child.stdin.end()
  })
}

/**
 * @param {string} dir
 * @param {boolean} [shouldFail]
 * @returns {Array<any>}
 */
function getTestInputFromDir(dir, shouldFail) {
  return fs
    .readdirSync(dir)
    .filter((d) => path.extname(d) === '.md')
    .map((f) => {
      let file = path.join(dir, f)
      let name = path.basename(f, path.extname(f))
      let expected = JSON.parse(
        String(fs.readFileSync(path.join(dir, name + '.json')))
      )
      let msg = 'should parse ' + name

      return {file: file, name: name, expected: expected, msg: msg}
    })
}
