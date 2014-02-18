Array::remove = (v) -> @splice i, 1 while (i = @indexOf(v)) > -1
Array::clone = ->
  cloned = []
  for i in this
    cloned.push i
  cloned

Array::unique = ->
  output = {}
  output[@[key]] = @[key] for key in [0...@length]
  value for key, value of output

battleObject = undefined
battleShips = undefined
currentBattleShips = undefined
defenderPriorities = undefined
attackerPriorities = undefined
results = undefined

# The number of times each simulation will be run
numberOfSimulations = 20

# The actual function which returns the permutations of an array-like
# object (or a proper array).
permute = (arr) ->
  arr = Array::slice.call arr, 0
  return [[]] if arr.length == 0

  permutations = (for value,idx in arr
    [value].concat perm for perm in permute arrayExcept arr, idx)

  # Flatten the array before returning it.
  [].concat permutations...

addPlayerShipsToBattle = (playerType, shipName) ->
    # Create ship object and populate it with default values
  shipObj = {
    playerType: playerType
    shipName: shipName
    health: 0
    damage: 0
    timesRolled: 0
    computerTotal: 0
    shieldTotal: 0
    initiativeTotal: 0
    missiles: []
    cannons: []

  }

  console.log battleObject
  # Load the player blueprint for this ship
  playerShipBluePrint = battleObject[playerType].player.ships[shipName]

  # Set some ship bonus values
  shipObj.initiativeTotal += playerShipBluePrint.shipInitiative
  shipObj.computerTotal += playerShipBluePrint.computer
  # TODO check if shields are in the blueprint

  for slotNumber, shipPart of playerShipBluePrint
    if slotNumber.length is 1
      # Populate the rest of the ship values from the parts
      switch shipPart.type
        when 'hull' then shipObj.health += shipPart.value * shipPart.quantity
        when 'computer' then shipObj.computerTotal += shipPart.value * shipPart.quantity
        when 'shield' then shipObj.shieldTotal += shipPart.value * shipPart.quantity
        when 'missile' then shipObj.missiles.push shipPart.value for [1..shipPart.quantity]
        when 'cannon' then shipObj.cannons.push shipPart.value for [1..shipPart.quantity]

      shipObj.initiativeTotal += shipPart.upgradeInitiative

  battleShips.push shipObj

addDefenderShips = () ->
  # Put the defender ships into the battle
  for shipName, shipCount of battleObject.defender.ships
    if shipCount > 0
      defenderPriorities.push shipName
      for sCount in [1..shipCount]
        addPlayerShipsToBattle('defender', shipName)

addAttackerShips = () ->
  # Put the attacker ships into the battle
  for shipName, shipCount of battleObject.attacker.ships
    if shipCount > 0
      attackerPriorities.push shipName
      for sCount in [1..shipCount]
        addPlayerShipsToBattle('attacker', shipName)

roundWon = (priority) ->
  defenderShips = currentBattleShips.filter (s) ->
    s.playerType is 'defender'

  attackerShips = currentBattleShips.filter (s) ->
    s.playerType is 'attacker'

  if defenderShips.length is 0
    console.log "Attacker wins the hex"
    results[priority].attacker += 1
    return true
  else if attackerShips.length is 0
    console.log "Defender wins the hex"
    results[priority].defender += 1
    return true
  else
    return false

nextAttackingShip = () ->
  s = _(currentBattleShips).multiSortBy (s) -> [s.timesRolled, !(s.missiles.length>0), -s.initiativeTotal, -(s.missiles.length), (if s.playerType is 'defender' then 0 else 1)]
  console.log("Next attacking ship", s.value()[0]);
  s.value()[0]

shipAttackOpponent = (attackingShip, priority) ->

  #onsole.log "Attacking Ship: #{attackingShip.shipName} by #{attackingShip.playerType}"

  attackingShip.timesRolled += 1

  opponentShips = currentBattleShips.filter (ship) ->
    ship.playerType isnt attackingShip.playerType

  # There aren't any ships to attack, get outta here!
  return if opponentShips.length is 0

  # Go through the priorities and priorities for the attacker or defender
  # ['attacker', 'ship1', 'ship2']
  # OR
  # ['defender', 'ship1', 'ship2']
  for p in priority
    attackingShipPriority = p[1..] if p[0] isnt attackingShip.playerType

  # Sort all the opponent ships according to priority
  opponentShips = (_(opponentShips).sortBy (oS) ->
    [attackingShipPriority.indexOf(oS.shipName), oS.health - oS.damage]).value()

  if attackingShip.missiles.length > 0
    console.log "Attacking with Missiles"
    # This ship still has missles and hasn't fired them
    # Fire them now!
    weapons = attackingShip.missiles

    # Remove the missles from the ship, they have been fired!
    currentBattleShips[currentBattleShips.indexOf(attackingShip)].missiles = []
    currentBattleShips[currentBattleShips.indexOf(attackingShip)].timesRolled = 0
  else
    console.log "Attacking with cannons"
    # This ship only has cannons to fire
    # Fire them now
    weapons = attackingShip.cannons

  if weapons.length > 0
    # There are weapons to fire!
     for weapon in weapons
      roll = Math.floor(Math.random() * 6) + 1
      console.log "Roll: #{roll}"

      # Find the next ship to attack
      targetShip = opponentShips[0]

      # Check if the roll is a hit based on computers and shields
      if attackingShip.shipName is 'Ancient' || attackingShip.shipName is 'GCDS'
        # Change target based on these ships
        targetShip = _(opponentShips).multiSortBy((s) ->
          canDestroy = if weapon + s.damage > s.health && (roll is 6 || roll + attackingShip.computerTotal - s.shieldTotal >= 6) then 0 else 1

          shipValue = switch s.shipName
            when 'Dreadnaught' then 1
            when 'Starbase' then 2
            when 'Cruiser' then 3
            when 'Interceptor' then 4

          [canDestroy, shipValue]
        ).value()[0]

      # PVP, use priority ship selected
      if roll isnt 1 && (roll is 6 || roll + attackingShip.computerTotal - targetShip.shieldTotal >= 6)
        console.log "Hit"

        # Apply damage to ship
        targetShip.damage += weapon

        if targetShip.damage > targetShip.health
          currentBattleShips.remove(targetShip)

       # If destroyed, remove it from the current ships

simulatePriority = (priority) ->
  results[priority] = {}
  results[priority].defender = 0
  results[priority].attacker = 0

  # simulate the battle for this priority 10 times
  for i in [1..numberOfSimulations]
    console.log " ======= NEW SIMULATION ======="

    # Reset all attributes
    currentBattleShips = []

    for bShip in battleShips
      # Create a new copy of the ship object and push that
      # Not just a new copy of the array with the same objects in them!
      currentBattleShips.push _.extend({}, bShip)

    # run 100 rolls for the turn to be resolved
    for r in [1..100]
      attackingShip = nextAttackingShip()
      shipAttackOpponent(attackingShip, priority)
      if roundWon(priority)
        # Reload the ships each time we test this case
        console.log "Round Over, next simulation"
        break

formatResults = (results) ->
  # Number of
  modifier = 100 / numberOfSimulations

  defenderResult = {
      priority: ""
      wins: 0
    }
    attackerResult = {
      priority: ""
      wins: 0
    }

    for priority, rW of results
      if rW.defender > defenderResult.wins
        defenderResult.priority = priority
        defenderResult.wins = rW.defender * modifier

      if rW.attacker > attackerResult.wins
        attackerResult.priority = priority
        attackerResult.wins = rW.attacker * modifier

  return {
    defenderResult: defenderResult,
    attackerResult: attackerResult
  }

start = () ->
  addDefenderShips()
  addAttackerShips()

  defenderPriorities = permute(defenderPriorities, defenderPriorities.length)
  attackerPriorities = permute(attackerPriorities, attackerPriorities.length)

  finalGroupedPriorities = []

  for dPri in defenderPriorities
    for aPri in attackerPriorities
      groupedPriorities = []
      groupedPriorities.push ['defender'].concat aPri
      groupedPriorities.push ['attacker'].concat dPri
      finalGroupedPriorities.push groupedPriorities

  for gPriority in finalGroupedPriorities
    simulatePriority(gPriority)

  console.log "Everything is done!"
  console.log "RESULTS!"
  console.log results
  return formatResults(results)

arrayExcept = (arr, idx) ->
  res = arr[0..]
  res.splice idx, 1
  res

exports.simulateBattle = (bObject) ->
  battleObject = bObject
  battleShips = []
  currentBattleShips = []
  defenderPriorities = []
  attackerPriorities = []
  results = {}
  start()