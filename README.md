# mgr
*Easier multithreading for Node.*

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

-----
<dl>
	<dt>mgr</dt>
	<dd>Abbreviation, "manager"</dd>
</dl>
