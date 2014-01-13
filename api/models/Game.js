/**
 * Game
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	uuid: 'string',

    numberOfPlayers: function(cb) {
      Player.find({game_id: this.id}).done(function(err, players) {
        cb(players.length);
      });
    }
  },

  beforeCreate: function(values, cb) {
    crypto = require('crypto');

    // Set the UUID
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    values.uuid = crypto.createHash('sha1').update(current_date + random).digest('hex').slice(0, 5);
    cb();
  },



};
