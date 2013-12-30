/**
 * GamesController
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
  create: function(req, res) {
    Game.create(req.param('game')).done(function(err, game){
      if (err) {
        return console.log(err);
      } else {
        res.json(game);
      }
    });
  },

  show: function (req, res) {
    Game.findOneByUuid(req.param('id')).done(function(err, game) {
      if (err) return res.send(err,500);
      if (!game) return res.send("Game not found", 404);

      // Find all the players in this game
      Player.find({
        game_id: game.id
      }).done(function(err, players) {
        if (err) return res.send(err,500);
        BlueprintService.get(function(blueprints) {
          res.json({game: game, players: players, blueprints: blueprints});
        });
      });
    });
  },

  _config: {}


};
