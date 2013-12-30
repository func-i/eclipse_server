exports.get = function(callback) {
  var blueprints = {};

  Ship.query(" \
    SELECT ship.race, ship.name as ship_name, ship.computer, upgrade.name as upgrade_name, type, value, quantity, ship.initiative as ship_initiative, upgrade.initiative as upgrade_initiative \
    FROM ship \
    INNER JOIN ship_part ON ship.id=ship_part.ship_id \
    INNER JOIN upgrade ON ship_part.upgrade_id=upgrade.id \
    ORDER BY ship.race, ship.name", function(err, data) {
      for(x=0; x<data.rows.length; x++) {
        var ship = data.rows[x];

        //var racePrint = blueprints[ship.race];
        if(blueprints[ship.race] === undefined) blueprints[ship.race] = {};

        // set it to an empty object
        if(blueprints[ship.race][ship.ship_name] === undefined) blueprints[ship.race][ship.ship_name] = {};

         // Set the default ship stats
        blueprints[ship.race][ship.ship_name].shipInitiative = ship.ship_initiative;
        blueprints[ship.race][ship.ship_name].name = ship.ship_name;
        blueprints[ship.race][ship.ship_name].computer = ship.computer;
        blueprints[ship.race][ship.ship_name].damage = 0;

        len = Object.keys(blueprints[ship.race][ship.ship_name]).length - 4 + 1;

        blueprints[ship.race][ship.ship_name][len] = {
          upgradeName: ship.upgradeName,
          type: ship.type,
          value: ship.value,
          quantity: ship.quantity,
          upgradeInitiative: ship.upgrade_initiative
        };


      }
      callback(blueprints);
  });
};