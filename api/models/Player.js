/**
 * Player
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    name: 'string',
    race: 'string',
    ships: 'json',
    game_id: 'integer',
    uuid: 'string'
  }
};