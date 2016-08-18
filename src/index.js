import { fork } from 'child_process';
import { equal } from 'assert';
import { isAbsolute } from 'path';
import Promise from 'bluebird';
const jobs = {};

/**
 * Copies all properties (including prototopes) into a target object.
 *
 * @param  {Object} object - Any enumerable object.
 * @param  {Object} target - The object to copy to.
 * @returns {Object} - The target object.
 */
function copyInherited (object, target) {

	/** Iterate over all properties (including inherited). */
	Object.getOwnPropertyNames(object).forEach((key) => {

		/** Copy them to the target object. */
		target[key] = object[key];
	});

	return target;
}

/** Handles incoming job requests. */
process.on('message', async ({ job, jobID, instructions }) => {
	const handler = jobs[job];

	try {

		if (!handler) {
			throw new Error(
`Could not find job "${job}".
Make sure it's registered in the child process file
(Hint: job names are case-sensitive).`
			);
		}

		const result = await handler(instructions);
		process.send({ jobID, result });
	} catch (failure) {
		let error = failure;

		/** Make sure errors survive `JSON.stringify`. */
		if (error instanceof Object) {
			error = copyInherited(error, {});
		}

		process.send({ jobID, error });
	}
});

/**
 * Create a new process and run jobs in it.
 *
 * @class Fork
 * @param {String} path - The JS file to fork into.
 */
export class Fork {
	constructor (path) {
		equal(
			typeof path, 'string',
			'Fork path must be a string.'
		);
		equal(
			isAbsolute(path), true,
			'Fork path must be absolute.'
		);

		/** Create a new child process. */
		const child = fork(path);

		this.child = child;
	}

	/**
	 * Run a job in a child process.
	 *
	 * @param  {String} job - The name of the job to run.
	 * @param  {Mixed} instructions - Parameters to give the job runner.
	 * @returns {Promise} - Resolves when the job finishes.
	 */
	run (job, instructions) {
		const { child } = this;

		/** Creates a (mostly) unique job ID. */
		const jobID = Math.random().toString(36).slice(2);

		return new Promise((res, rej) => {

			/**
			 * Filters incoming messages for it's own jobID,
			 * removing itself as a listener.
			 *
			 * @param  {Object} message - An object containing job details.
			 * @param  {String} message.id - The unique job ID.
			 * @param  {Mixed} [message.result] - The return value of the job.
			 * @param  {Error} [message.error] } - Any errors thrown.
			 * @returns {undefined}
			 */
			function handleMessage ({ jobID: id, result, error }) {

				/** Filters for it's own jobID. */
				if (id !== jobID) {
					return;
				}

				/** Removes the listener at the end. */
				child.removeListener('message', handleMessage);

				/** Rejects/resolves the promise. */
				if (error) {
					rej(error);
				} else {
					res(result);
				}
			}

			/** Listens for a response. */
			child.on('message', handleMessage);

			/** Sends the job to the child process. */
			child.send({ job, jobID, instructions });

		});

	}
}

/**
 * Exposes a function parent processes can use.
 *
 * @throws {AssertionError} - If a job name is reused.
 * @throws {AssertionError} - If the handler isn't a function.
 *
 * @param  {String} name - The name of the job. Must be unique.
 * @param  {Function} handler - The async function to call when the job fires.
 * @returns {undefined}
 */
export function job (name, handler) {
	equal(
		typeof handler, 'function',
		`Expected a handler function, got "${handler}".`
	);

	/** Makes sure the job doesn't already exist. */
	if (jobs[name]) {
		throw new Error(`Job "${name}" already defined.`);
	}

	/** Assigns the handler to the job name. */
	jobs[name] = handler;
}
