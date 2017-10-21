# [UNMAINTAINED] mgr
*Easier multithreading for Node.*

[![Travis branch](https://img.shields.io/travis/PsychoLlama/mgr/master.svg?style=flat-square)](https://travis-ci.org/PsychoLlama/mgr)
[![npm](https://img.shields.io/npm/dt/mgr.svg?style=flat-square)](https://www.npmjs.com/package/mgr)
[![npm](https://img.shields.io/npm/l/mgr.svg?style=flat-square)](https://github.com/PsychoLlama/mgr/blob/master/LICENSE)

## Maintenance Notice
I've abandon this library because it's dumb.

## Why?
Because multi-threaded node applications are unwieldy to work with, and I needed to work with them.

## API
### `.job`
Used by new child processes to expose functions (tasks) to parent processes.

It takes two arguments:
 - The name of the job (case sensitive).
 - A function to call when it's ready.

```javascript
import { job } from 'mgr'

job('compute PI', () => {
	// do stuff
})
```

Jobs will only run when called by their parent process, and must **always** return a promise. If you've got a sweet [Babel setup](https://babeljs.io/docs/plugins/transform-async-to-generator/), I recommend using `async` functions. They're way nicer and crafted from unicorn tears.

```javascript
job('do things', async (name) => {
	// things
	return 10 // Automagically promisified.
})
```

When a job finishes, the value is sent to the parent process (same goes for errors).

### `.Fork`
`Fork` creates a new child node process and aims it at a file path you pass it. Any jobs declared by the child process can be run through `Fork`.

> Paths must be absolute.

```javascript
// Import the Fork class.
import { Fork } from 'mgr'

// The absolute path to a .js file.
const file = `${__dirname}/slave-code.js`

// Spawns a new process.
const slave = new Fork(file)
```

### `fork.run`
Starts a job in the child process, returning a promise.

> Job names are case-sensitive.

```javascript
slave.run('compute PI')
	.then(console.log)
	.catch((error) => console.log('Oh noes!'))
```

If the job is expecting arguments, you can pass one immediately after the job name.

```javascript
slave.run('encrypt', {
  data: 'Nuclear launch codes: ...',
  phrase: 'potatoes are lovely',
}).then((result) => console.log(result))
```

> To keep stuff simple, only one argument is allowed.

## Installing

**From npm**
```sh
$ npm install mgr --save
```

**From GitHub**
```sh
$ git clone https://github.com/PsychoLlama/mgr.git
$ cd mgr
$ npm install
$ npm run build
```

## Running tests

First, install from GitHub. npm only has the compiled code.

Be sure to run the build first:
```sh
# Run once.
$ npm run build

# OPTIONAL: watch for changes.
$ npm run build -- --watch
```

Now you can run the tests.
```sh
$ npm test
```

-----
<dl>
	<dt>mgr</dt>
	<dd>Abbreviation, "manager"</dd>
</dl>
