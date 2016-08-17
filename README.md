# mgr
*For easily managing slave processes.*

## Why?
Because multi-threaded node applications are unwieldy to work with, and I needed to work with them.

### `.job`
Forked processes can expose functions to parent processes using `job`, which works much like `gulp.task`. It takes a task name and a function to call.

```javascript
import { job } from 'mgr'

job('compute PI', () => {
	// do stuff
})
```

The job will only run when called by another process, and should always return a promise. If you've got a sweet [Babel setup](https://babeljs.io/docs/plugins/transform-async-to-generator/), I recommend using `async` functions. They're way nicer.

```javascript
job('do things', async (name) => {
	// things
	return 10 // Automagically promisified.
})
```

The value the promise resolves to is sent to the parent process.

### `.Fork`
`Fork` is a class which accepts one parameter, the absolute path to a JavaScript file.

It spins up a new Node.js process and aims it at the file. All jobs declared within will be accessible to the `Fork` instance.

That file has code the slave process will run, and can expose jobs to `Fork` instances.

**Example**
```javascript
// ES6 goodness
import { Fork } from 'mgr'

// The absolute path to a .js file.
const file = `${__dirname}/slave-code.js`

// Fork into a new process.
const slave = new Fork(file)
```

### `fork.run`
Runs a job in the slave process, returning a promise.

```javascript
slave.run('compute PI')
	.then(console.log)
	.catch((error) => console.log('Oh noes!'))
```

The resolution or rejection values will be passed to the parent process.

Jobs can be run in parallel.

-----
<dl>
	<dt>mgr</dt>
	<dd>Abbreviation, "manager"</dd>
</dl>
