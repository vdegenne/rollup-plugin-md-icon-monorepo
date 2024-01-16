import {rm} from 'fs/promises';
import {emptyCache} from '../cache.js';

export async function resetCache() {
	await rm('.mdicon', {force: true, recursive: true});
	emptyCache();
}
