module.exports = {
  seed: function (done) {
    var self = this;
    self.seedShips(function() {
      self.seedUpgrades(function() {
        self.seedShipParts(function() {
          done();
        });
      });
    });
  },

  createModel: function(Model, modelArr, index, callback) {
    var self = this;
    if(index < modelArr.length) {
      attrs = modelArr[index];
      index++;
      Model.create(attrs).done(function(err, ship) {
        if(err) console.log(err);
        self.createModel(Model, modelArr, index, callback);
      });
    }
    else
      callback();
  },

  seedShips: function(callback) {
    var self = this;

    // Remove all ships
    Ship.destroy().done(function(err) {

      // Setup ship blueprints
      var ships = require('./json/ships.json');

      // Create the first ship
      self.createModel(Ship, ships, 0, callback);
    });
  },

  seedUpgrades: function(callback) {
    var self = this;

    Upgrade.destroy().done(function(err) {
      var upgrades = require('./json/upgrades.json');
      self.createModel(Upgrade, upgrades, 0, callback);
    });
  },

  seedShipParts: function(callback) {
    var self = this;

    ShipPart.destroy().done(function(err) {
      var shipParts = require('./json/ship_parts.json');

      function createShipParts(index, callback) {
        if(index < shipParts.length) {
          var attrs = shipParts[index];
          var findAttrs = {
            race: attrs.race,
            name: attrs.name
          };

          index++;

          Ship.findOne(findAttrs).done(function(err, ship) {
            // Found the ship now add the parts
            createUpgrade(ship, attrs.parts, 0, function() {
              createShipParts(index, callback);
            });
          });
        }
        else
          callback();
      }

      function createUpgrade(ship, upgrades, index, callback) {
        if(index < upgrades.length) {
          Upgrade.findOne({name: upgrades[index]}).done(function(err, upgrade) {
            index++;

            ShipPart.create({ship_id: ship.id, upgrade_id: upgrade.id}).done(function(err, shipPart) {
              createUpgrade(ship, upgrades, index, callback);
            });
          });
        }
        else
          callback();
      }

      createShipParts(0, callback);
    });
  }
};