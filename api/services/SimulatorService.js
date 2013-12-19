(function() {
  var addAttackerShips, addDefenderShips, addPlayerShipsToBattle, arrayExcept, attackerPriorities, battleObject, battleShips, currentBattleShips, defenderPriorities, formatResults, nextAttackingShip, numberOfSimulations, permute, results, roundWon, shipAttackOpponent, simulatePriority, start;

  Array.prototype.remove = function(v) {
    var i, _results;
    _results = [];
    while ((i = this.indexOf(v)) > -1) {
      _results.push(this.splice(i, 1));
    }
    return _results;
  };

  Array.prototype.clone = function() {
    var cloned, i, _i, _len;
    cloned = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      i = this[_i];
      cloned.push(i);
    }
    return cloned;
  };

  Array.prototype.unique = function() {
    var key, output, value, _ref, _results;
    output = {};
    for (key = 0, _ref = this.length; 0 <= _ref ? key < _ref : key > _ref; 0 <= _ref ? key++ : key--) {
      output[this[key]] = this[key];
    }
    _results = [];
    for (key in output) {
      value = output[key];
      _results.push(value);
    }
    return _results;
  };

  battleObject = void 0;

  battleShips = void 0;

  currentBattleShips = void 0;

  defenderPriorities = void 0;

  attackerPriorities = void 0;

  results = void 0;

  numberOfSimulations = 20;

  permute = function(arr) {
    var idx, perm, permutations, value, _ref;
    arr = Array.prototype.slice.call(arr, 0);
    if (arr.length === 0) return [[]];
    permutations = (function() {
      var _len, _results;
      _results = [];
      for (idx = 0, _len = arr.length; idx < _len; idx++) {
        value = arr[idx];
        _results.push((function() {
          var _i, _len2, _ref, _results2;
          _ref = permute(arrayExcept(arr, idx));
          _results2 = [];
          for (_i = 0, _len2 = _ref.length; _i < _len2; _i++) {
            perm = _ref[_i];
            _results2.push([value].concat(perm));
          }
          return _results2;
        })());
      }
      return _results;
    })();
    return (_ref = []).concat.apply(_ref, permutations);
  };

  addPlayerShipsToBattle = function(playerType, shipName) {
    var playerShipBluePrint, shipObj, shipPart, slotNumber, _i, _j, _ref, _ref2;
    shipObj = {
      playerType: playerType,
      shipName: shipName,
      health: 0,
      damage: 0,
      timesRolled: 0,
      computerTotal: 0,
      shieldTotal: 0,
      initiativeTotal: 0,
      missiles: [],
      cannons: []
    };
    console.log(battleObject);
    playerShipBluePrint = battleObject[playerType].player.ships[shipName];
    shipObj.initiativeTotal += playerShipBluePrint.shipInitiative;
    shipObj.computerTotal += playerShipBluePrint.computer;
    for (slotNumber in playerShipBluePrint) {
      shipPart = playerShipBluePrint[slotNumber];
      if (slotNumber.length === 1) {
        switch (shipPart.type) {
          case 'hull':
            shipObj.health += shipPart.value * shipPart.quantity;
            break;
          case 'computer':
            shipObj.computerTotal += shipPart.value * shipPart.quantity;
            break;
          case 'shield':
            shipObj.shieldTotal += shipPart.value * shipPart.quantity;
            break;
          case 'missile':
            for (_i = 1, _ref = shipPart.quantity; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
              shipObj.missiles.push(shipPart.value);
            }
            break;
          case 'cannon':
            for (_j = 1, _ref2 = shipPart.quantity; 1 <= _ref2 ? _j <= _ref2 : _j >= _ref2; 1 <= _ref2 ? _j++ : _j--) {
              shipObj.cannons.push(shipPart.value);
            }
        }
        shipObj.initiativeTotal += shipPart.upgradeInitiative;
      }
    }
    return battleShips.push(shipObj);
  };

  addDefenderShips = function() {
    var sCount, shipCount, shipName, _ref, _results;
    _ref = battleObject.defender.ships;
    _results = [];
    for (shipName in _ref) {
      shipCount = _ref[shipName];
      if (shipCount > 0) {
        defenderPriorities.push(shipName);
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (sCount = 1; 1 <= shipCount ? sCount <= shipCount : sCount >= shipCount; 1 <= shipCount ? sCount++ : sCount--) {
            _results2.push(addPlayerShipsToBattle('defender', shipName));
          }
          return _results2;
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  addAttackerShips = function() {
    var sCount, shipCount, shipName, _ref, _results;
    _ref = battleObject.attacker.ships;
    _results = [];
    for (shipName in _ref) {
      shipCount = _ref[shipName];
      if (shipCount > 0) {
        attackerPriorities.push(shipName);
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (sCount = 1; 1 <= shipCount ? sCount <= shipCount : sCount >= shipCount; 1 <= shipCount ? sCount++ : sCount--) {
            _results2.push(addPlayerShipsToBattle('attacker', shipName));
          }
          return _results2;
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  roundWon = function(priority) {
    var attackerShips, defenderShips;
    defenderShips = currentBattleShips.filter(function(s) {
      return s.playerType === 'defender';
    });
    attackerShips = currentBattleShips.filter(function(s) {
      return s.playerType === 'attacker';
    });
    if (defenderShips.length === 0) {
      console.log("Attacker wins the hex");
      results[priority].attacker += 1;
      return true;
    } else if (attackerShips.length === 0) {
      console.log("Defender wins the hex");
      results[priority].defender += 1;
      return true;
    } else {
      return false;
    }
  };

  nextAttackingShip = function() {
    var s;
    s = _(currentBattleShips).multiSortBy(function(s) {
      return [s.timesRolled, !(s.missiles.length > 0), -s.initiativeTotal, -s.missiles.length, (s.playerType === 'defender' ? 0 : 1)];
    });
    console.log("Next attacking ship", s.value()[0]);
    return s.value()[0];
  };

  shipAttackOpponent = function(attackingShip, priority) {
    var attackingShipPriority, opponentShips, p, roll, targetShip, weapon, weapons, _i, _j, _len, _len2, _results;
    attackingShip.timesRolled += 1;
    opponentShips = currentBattleShips.filter(function(ship) {
      return ship.playerType !== attackingShip.playerType;
    });
    if (opponentShips.length === 0) return;
    for (_i = 0, _len = priority.length; _i < _len; _i++) {
      p = priority[_i];
      if (p[0] !== attackingShip.playerType) attackingShipPriority = p.slice(1);
    }
    opponentShips = (_(opponentShips).sortBy(function(oS) {
      return [attackingShipPriority.indexOf(oS.shipName), oS.health - oS.damage];
    })).value();
    if (attackingShip.missiles.length > 0) {
      console.log("Attacking with Missiles");
      weapons = attackingShip.missiles;
      currentBattleShips[currentBattleShips.indexOf(attackingShip)].missiles = [];
      currentBattleShips[currentBattleShips.indexOf(attackingShip)].timesRolled = 0;
    } else {
      console.log("Attacking with cannons");
      weapons = attackingShip.cannons;
    }
    if (weapons.length > 0) {
      _results = [];
      for (_j = 0, _len2 = weapons.length; _j < _len2; _j++) {
        weapon = weapons[_j];
        roll = Math.floor(Math.random() * 6) + 1;
        console.log("Roll: " + roll);
        targetShip = opponentShips[0];
        if (attackingShip.shipName === 'Ancient' || attackingShip.shipName === 'GCDS') {
          targetShip = _(opponentShips).multiSortBy(function(s) {
            var canDestroy, shipValue;
            canDestroy = weapon + s.damage > s.health && (roll === 6 || roll + attackingShip.computerTotal - s.shieldTotal >= 6) ? 0 : 1;
            shipValue = (function() {
              switch (s.shipName) {
                case 'Dreadnaught':
                  return 1;
                case 'Starbase':
                  return 2;
                case 'Cruiser':
                  return 3;
                case 'Interceptor':
                  return 4;
              }
            })();
            return [canDestroy, shipValue];
          }).value()[0];
        }
        if (roll !== 1 && (roll === 6 || roll + attackingShip.computerTotal - targetShip.shieldTotal >= 6)) {
          console.log("Hit");
          targetShip.damage += weapon;
          if (targetShip.damage > targetShip.health) {
            _results.push(currentBattleShips.remove(targetShip));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  simulatePriority = function(priority) {
    var attackingShip, bShip, i, r, _i, _len, _results;
    results[priority] = {};
    results[priority].defender = 0;
    results[priority].attacker = 0;
    _results = [];
    for (i = 1; 1 <= numberOfSimulations ? i <= numberOfSimulations : i >= numberOfSimulations; 1 <= numberOfSimulations ? i++ : i--) {
      console.log(" ======= NEW SIMULATION =======");
      currentBattleShips = [];
      for (_i = 0, _len = battleShips.length; _i < _len; _i++) {
        bShip = battleShips[_i];
        currentBattleShips.push(_.extend({}, bShip));
      }
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (r = 1; r <= 100; r++) {
          attackingShip = nextAttackingShip();
          shipAttackOpponent(attackingShip, priority);
          if (roundWon(priority)) {
            console.log("Round Over, next simulation");
            break;
          } else {
            _results2.push(void 0);
          }
        }
        return _results2;
      })());
    }
    return _results;
  };

  formatResults = function(results) {
    var attackerResult, defenderResult, modifier, priority, rW;
    modifier = 100 / numberOfSimulations;
    defenderResult = {
      priority: "",
      wins: 0
    };
    attackerResult = {
      priority: "",
      wins: 0
    };
    for (priority in results) {
      rW = results[priority];
      if (rW.defender > defenderResult.wins) {
        defenderResult.priority = priority;
        defenderResult.wins = rW.defender * modifier;
      }
      if (rW.attacker > attackerResult.wins) {
        attackerResult.priority = priority;
        attackerResult.wins = rW.attacker * modifier;
      }
    }
    return {
      defenderResult: defenderResult,
      attackerResult: attackerResult
    };
  };

  start = function() {
    var aPri, dPri, finalGroupedPriorities, gPriority, groupedPriorities, _i, _j, _k, _len, _len2, _len3;
    addDefenderShips();
    addAttackerShips();
    defenderPriorities = permute(defenderPriorities, defenderPriorities.length);
    attackerPriorities = permute(attackerPriorities, attackerPriorities.length);
    finalGroupedPriorities = [];
    for (_i = 0, _len = defenderPriorities.length; _i < _len; _i++) {
      dPri = defenderPriorities[_i];
      for (_j = 0, _len2 = attackerPriorities.length; _j < _len2; _j++) {
        aPri = attackerPriorities[_j];
        groupedPriorities = [];
        groupedPriorities.push(['defender'].concat(aPri));
        groupedPriorities.push(['attacker'].concat(dPri));
        finalGroupedPriorities.push(groupedPriorities);
      }
    }
    for (_k = 0, _len3 = finalGroupedPriorities.length; _k < _len3; _k++) {
      gPriority = finalGroupedPriorities[_k];
      simulatePriority(gPriority);
    }
    console.log("Everything is done!");
    console.log("RESULTS!");
    console.log(results);
    return formatResults(results);
  };

  arrayExcept = function(arr, idx) {
    var res;
    res = arr.slice(0);
    res.splice(idx, 1);
    return res;
  };

  exports.simulateBattle = function(bObject) {
    battleObject = bObject;
    battleShips = [];
    currentBattleShips = [];
    defenderPriorities = [];
    attackerPriorities = [];
    results = {};
    return start();
  };

}).call(this);
