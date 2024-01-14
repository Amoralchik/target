export const knex = require('knex')({
  client: 'pg',
  connection: 'postgres://targetUser:targetPass@localhost:5432/targetDB', // process.env.PG_CONNECTION_STRING,
  searchPath: ['knex', 'public'],
});
