#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { MAX_LENGTH, MIN_LENGTH, tidyid } from '../dist/index.js'

const args = process.argv.slice(2)

function print(message) {
  process.stdout.write(`${message}\n`)
}

function fail(message) {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

if (args.includes('--version') || args.includes('-v')) {
  const packageJson = readFileSync(join(import.meta.dirname, '..', 'package.json'))
  print(JSON.parse(packageJson).version)
} else if (args.includes('--help') || args.includes('-h')) {
  print(`Usage
  $ tidyid [options]

Options
  -s, --size       Generated ID size (${MIN_LENGTH}-${MAX_LENGTH})
  -u, --allow-uppercase
                    Allow uppercase letters
  -v, --version    Show version number
  -h, --help       Show this help

Examples
  $ tidyid
  eb4hv3ej7re9qh2cz9gd6tn5hv4fh8be

  $ tidyid -u
  Dn4Rc2Nv9Cf2Vh6Jj5cY7Pp5Gz3XD8vQ

  $ tidyid -s 16
  vx2rf4zm3mf6vf7j

  $ tidyid -s 16 -u
  Cp8Xw6Fb3Aq2Mn4Y`)
} else {
  let size
  let allowUppercase = false
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--size' || argument === '-s') {
      size = Number(args[index + 1])
      index += 1
      if (!Number.isInteger(size) || size < MIN_LENGTH || size > MAX_LENGTH) {
        fail(`Size must be an integer between ${MIN_LENGTH} and ${MAX_LENGTH}`)
      }
    } else if (argument === '--allow-uppercase' || argument === '-u') {
      allowUppercase = true
    } else {
      fail(`Unknown argument ${argument}`)
    }
  }
  print(tidyid(size, allowUppercase))
}
