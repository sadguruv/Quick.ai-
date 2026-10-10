import { getPosts } from './db/localDb.js';

console.log('Search for "yearly":');
const results1 = getPosts('All', 'yearly');
console.log(results1);

console.log('\nSearch for "background":');
const results2 = getPosts('All', 'background');
console.log(results2);

console.log('\nSearch for "":');
const results3 = getPosts('All', '');
console.log(results3.length, 'posts');
