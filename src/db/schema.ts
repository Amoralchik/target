import { knex } from './knex';

export const schema = async () => {
  try {
    await knex.schema.hasTable('users').then(function (exists: any) {
      if (!exists) {
        return knex.schema.createTable(
          'users',
          function (table: {
            increments: (arg0: string) => void;
            string: (arg0: string) => void;
            timestamps: () => void;
          }) {
            table.increments('id');
            table.string('username');
            table.string('password');
            table.timestamps();
          }
        );
      }
    });

    await knex.schema.hasTable('posts').then(function (exists: any) {
      if (!exists) {
        return knex.schema.createTable('posts', function (table: any) {
          table.increments('id');
          table.integer('author').unsigned().notNullable();
          table.string('title');
          table.string('content');
          table.timestamps();

          table.foreign('author').references('id').inTable('users');
        });
      }
    });

    await knex.schema.hasTable('categories').then(function (exists: any) {
      if (!exists) {
        return knex.schema.createTable('categories', function (table: any) {
          table.increments('id');
          table.integer('author').unsigned().notNullable();
          table.string('title');
          table.timestamps();

          table.foreign('author').references('id').inTable('users');
        });
      }
    });

    await knex.schema.hasTable('post_category').then(function (exists: any) {
      if (!exists) {
        return knex.schema.createTable('post_category', function (table: any) {
          table.increments('id');
          table.integer('postId').unsigned().notNullable();
          table.integer('categoryId').unsigned().notNullable();

          table.foreign('postId').references('id').inTable('posts');
          table.foreign('categoryId').references('id').inTable('categories');
        });
      }
    });

    return console.log('Database connected');
  } catch (error) {
    error;
  }
};
