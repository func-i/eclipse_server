/**
 * SimulationsController
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
   *    `/simulations/create`
   */
  create: function (req, res) {

    Game.findOneByUuid(req.param('game_id')).done(function(err, game){
      if (err) return res.send(err,500);
      if (!game) return res.send("Game not found", 404);
      results = SimulatorService.simulateBattle(req.param('battle_object'));
      res.json(results);
    });
  },

  test: function (req, res) {
    Game.findOneByUuid(req.param('game_id')).done(function(err, game){
      Player.find({game_id: game.id}).done(function(err, players) {
        player1 = players[0];
        player2 = players[1];

        battleObject = {
          attacker : {
            player : player1,
            ships  : {"Dreadnaught": "1"}
          },
          defender : {
            player : player2,
            ships  : {"Dreadnaught": "1"}
          }
        };

        results = SimulatorService.simulateBattle(battleObject);
        res.json(results);

      });
    });
  },



  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to SimulationsController)
   */
  _config: {}


};
