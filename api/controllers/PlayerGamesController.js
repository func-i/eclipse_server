/**
 * PlayergamesController
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
   * Overrides for the settings in `config/controllers.js`
   * (specific to PlayergamesController)
   */
  _config: {},

  index: function(req, res) {
    var moment = require('moment');
    Player.query(
      {
        text: 'SELECT \
            game.uuid, \
            MAX(game."createdAt") as "gameDate", \
            (SELECT COUNT(1) FROM player WHERE game_id = game.id) as "numPlayers" \
          FROM game \
          INNER JOIN player ON player.game_id=game.id \
          WHERE player.uuid=$1 \
          GROUP BY game.id, game.uuid;',
        values: [req.param('player_id')]
      },
      function(err, query) {
        var responseData = [];
        for(x=0; x<query.rows.length; x++) {
          var row = query.rows[x];
          responseData.push({
            uuid: row.uuid,
            gameDate: moment(row.gameDate).format("MMM DD YYYY"),
            numPlayers: row.numPlayers
          });
        }

        res.json(responseData);
    });
  }
};
