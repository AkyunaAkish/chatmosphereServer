
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table){
    table.increments().notNullable();
    table.string('email').notNullable().unique();
    table.string('username').notNullable().unique();
    table.string('password_hash').notNullable();
    table.binary('user_image').nullable() ;
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
  })
  .createTable('thought_spots', function(table){
    table.increments().notNullable();
    table.string('thought_spot_name').notNullable().unique();
    table.string('thought_spot_description').notNullable();
    table.integer('creator_id').notNullable().unsigned().references('users.id').index();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
  })
  .createTable('thought_spot_messages', function(table){
    table.string('thought_spot_name').notNullable().unique();
    table.integer('thought_spot_id').notNullable().unsigned().references('thought_spots.id').onDelete('cascade').onUpdate('cascade').index();
    table.integer('user_id').notNullable().unsigned().references('users.id').onDelete('cascade').onUpdate('cascade').index();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
  })

};

exports.down = function(knex, Promise) {
  return knex.schema
  .dropTable('users')
  .dropTable('thought_spots')
  .dropTable('thought_spot_messages')
};
