module.exports = {
  up: queryInterface => {
    return queryInterface.addConstraint('users', ['avatar_id'], {
      type: 'foreign key',
      name: 'users_avatar_fkey',
      references: {
        table: 'files',
        field: 'id',
      },
      onDelete: 'set null',
      onUpdate: 'cascade',
    });
  },

  down: queryInterface => {
    return queryInterface.removeConstraint('users', 'users_avatar_fkey');
  },
};
