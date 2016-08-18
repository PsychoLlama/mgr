/* eslint-disable no-new, require-jsdoc*/
import { describe, it, beforeEach, afterEach } from 'mocha';
import expect, { spyOn } from 'expect';
import { Fork, job } from './index';
import child from 'child_process';

describe('Mgr', function () {

	this.timeout(500);
	this.slow(200);

	const spy = spyOn(child, 'fork').andCallThrough();
	const file = `${__dirname}/../dist/slave.test.js`;
	function noop () {}
	afterEach(() => spy.reset());

	describe('jobs', () => {
		let name;
		beforeEach(() => {
			name = Math.random().toString(36).slice(2);
		});

		it('should be a function', () => {
			expect(job).toBeA(Function);
		});

		it('should validate handlers', () => {
			expect(() => job(name, {})).toThrow(/function/i);
		});

		it('should throw if a name has already been used', () => {
			job('name', noop);
			expect(() => {
				job('name', noop);
			}).toThrow(/(used|defined)/i);
		});
	});

	describe('Fork', () => {

		it('should throw if the path is not a string', () => {
			expect(() => new Fork()).toThrow(/string/i);
		});

		it('should throw if the path is not absolute', () => {
			expect(() => new Fork('./slave.test.js')).toThrow(/absolute/i);
		});

		it('should fork the process on creation', () => {
			new Fork(file);
			expect(spy).toHaveBeenCalled();
		});

		describe('run', () => {

			const slave = new Fork(file);

			it('should call slave jobs', async () => {
				const result = await slave.run('return 5');
				expect(result).toBe(5);
			});

			it('should complain if the return is not a promise', async () => {
				try {
					await slave.run('return invalid');
					throw new Error('Job should have thrown.');
				} catch (error) {
					expect(error.message).toMatch(/promise/i);
				}
			});

			it('should reject calls to unknown jobs', async () => {
				const name = 'No such job.';
				try {
					await slave.run(name);
					throw new Error('Should have rejected.');
				} catch ({ message }) {
					expect(message).toContain(name);
				}
			});

			it('should report failed jobs', async () => {
				try {
					await slave.run('reject');
					throw new Error('Should have rejected.');
				} catch (error) {

					// See `slave.test.js`
					expect(error).toBe('custom message');
				}
			});

			it('should allow concurrent jobs.', async () => {
				const jobs = [
					slave.run('return 5'),
					slave.run('return string'),
				];
				const results = await Promise.all(jobs);
				expect(results).toContain(5);
			});

			it('should remove the listener when done', async () => {
				await slave.run('return 5');
				expect(slave.child.listenerCount('message')).toBe(0);
			});

			it('should pass instructions to the job', async () => {
				const instructions = {
					range: { lt: 10, gt: 5 },
				};
				const result = await slave.run('return args', instructions);

				expect(result).toEqual(instructions);
			});

		});

	});

});
