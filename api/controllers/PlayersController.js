/**
 * PlayersController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  /**
   * Action blueprints:
   *    `/players/create`
   */
   create: function (req, res) {
    var game = Game.findOneByUuid(req.param('game_id')).done(function(err, game){
      if (err) return res.send(err,500);
      if (!game) return res.send("Game not found", 404);

      playerParams = req.param('player');
      playerParams.game_id = game.id;

      console.log(playerParams);
      Player.create(playerParams).done(function(err, player){
        if (err) {
          return console.log(err);
        } else {
          res.json(player);
        }
      });
    });
  },

  update: function (req, res) {
    console.log("updating player");
    var game = Game.findOne(req.param('game_id')).done(function(err, game){
      Player.update({id: req.param('id')}, req.param('player')).done(function(err, player){
        if (err) {
          return console.log(err);
        } else {
          res.json(player);
        }
      });
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to PlayersController)
   */
  _config: {}

};
