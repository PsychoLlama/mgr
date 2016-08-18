import { job } from './index';
import Promise from 'bluebird';

job('reject', () => Promise.reject('custom message'));
job('return 5', async () => 5);
job('return string', async () => 'hey');
job('return args', async (args) => args);
job('return invalid', () => 'bad return value');
