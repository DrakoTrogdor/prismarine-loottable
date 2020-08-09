function parseFunction (func) {
  const lootFunction = new LootFunction(func.function)

  switch (lootFunction.type) {
    case 'minecraft:apply_bonus':
      // TODO
      break

    case 'minecraft:copy_name':
      // TODO
      break

    case 'minecraft:copy_nbt':
      // TODO
      break

    case 'minecraft:copy_state':
      // TODO
      break

    case 'minecraft:enchant_randomly':
      // TODO
      break

    case 'minecraft:enchant_with_levels':
      // TODO
      break

    case 'minecraft:exploration_map':
      // TODO
      break

    case 'minecraft:explosion_decay':
      // TODO
      break

    case 'minecraft:furnace_smelt':
      // TODO
      break

    case 'minecraft:fill_player_head':
      // TODO
      break

    case 'minecraft:limit_count':
      // TODO
      break

    case 'minecraft:looting_enchant':
      // TODO
      break

    case 'minecraft:set_attributes':
      // TODO
      break

    case 'minecraft:set_contents':
      // TODO
      break

    case 'minecraft:set_count':
      // TODO
      break

    case 'minecraft:set_damage':
      // TODO
      break

    case 'minecraft:set_loot_table':
      // TODO
      break

    case 'minecraft:set_lore':
      // TODO
      break

    case 'minecraft:set_name':
      // TODO
      break

    case 'minecraft:set_nbt':
      // TODO
      break

    case 'minecraft:set_stew_effect':
      // TODO
      break

    default:
      throw new Error(`Unknown condition type ${lootFunction.type}!`)
  }

  return lootFunction
}

function parseCondition (condition) {
  const lootCondition = new LootCondition(condition.condition)

  switch (lootCondition.type) {
    case 'minecraft:alternative':
      lootCondition.terms = []
      for (const term of condition.terms) {
        lootCondition.terms.push(parseCondition(term))
      }
      break

    case 'minecraft:inverted':
      lootCondition.term = parseCondition(condition.term)
      break

    case 'minecraft:reference':
      // TODO
      break

    case 'minecraft:block_state_property':
    case 'minecraft:damage_source_properties':
    case 'minecraft:entity_properties':
    case 'minecraft:entity_scores':
    case 'minecraft:killed_by_player':
    case 'minecraft:location_check':
    case 'minecraft:match_tool':
    case 'minecraft:random_chance':
    case 'minecraft:random_chance_with_looting':
    case 'minecraft:survives_explosion':
    case 'minecraft:table_bonus':
    case 'minecraft:time_check':
    case 'minecraft:weather_check':
      for (const prop in condition) {
        lootCondition[prop] = condition[prop]
      }
      break

    default:
      throw new Error(`Unknown condition type ${lootCondition.type}!`)
  }

  return lootCondition
}

function handleItemEntry (drops, entry, pool) {
  const item = new LootItemDrop(entry.name)

  if (entry.weight !== undefined) item.weight = entry.weight
  if (entry.quality !== undefined) item.quality = entry.quality

  if (typeof pool.rolls === 'object') {
    item.minCount = pool.rolls.min
    item.maxCount = pool.rolls.max
  } else {
    item.minCount = pool.rolls
    item.maxCount = pool.rolls
  }

  for (const func of entry.functions || []) {
    item.functions.push(parseFunction(func))
  }

  for (const func of pool.functions || []) {
    item.functions.push(parseFunction(func))
  }

  for (const condition of entry.conditions || []) {
    item.conditions.push(parseCondition(condition))
  }

  for (const condition of pool.conditions || []) {
    item.conditions.push(parseCondition(condition))
  }

  drops.push(item)
}

function handleEntry (drops, entry, pool) {
  switch (entry.type) {
    case 'minecraft:item':
      handleItemEntry(drops, entry, pool)
      break

    case 'minecraft:tag':
      // TODO Implement tags
      // Would rely on MC-Data to retrieve all items from a tag list.
      break

    case 'minecraft:loot_table':
      // TODO Combine with data from another loot table
      // Figure out a clean API for loot tables to reference each other.
      break

    case 'minecraft:group':
    case 'minecraft:alternatives':
    case 'minecraft:sequence':
      for (const e of entry.children) {
        handleEntry(drops, e, pool)
      }
      break

    case 'minecraft:dynamic':
      // These are special cases, so not much we can do with these.
      break

    case 'minecraft:empty':
      break // Do nothing

    default:
      throw new Error(`Unknown entry type ${entry.type}!`)
  }
}

/**
 * Gets a list of all drops which can be provided from the given loot table
 * as well as the conditions required for the item to be dropped.
 *
 * @param {*} lootTable - The raw loot table.
 *
 * @return A list of all potential item drops and the conditions required.
 */
function getPotentialDrops (lootTable, mcVersion) {
  const drops = []

  for (const pool of lootTable.pools || []) {
    for (const entry of pool.entries || []) {
      handleEntry(drops, entry, pool)
    }
  }

  return drops
}

/**
 * Takes the given input type and generates a set of item drops which would come from the table
 * as a result. This applies randomness and conditionals as needed.
 *
 * @param {*} lootTable - The raw loot table to read from.
 * @param {*} options - The options to use when calculating the loot.
 *
 * @returns a List of prismarine items.
 */
function generateLoot (lootTable, options = {}) {
  // TODO
  return []
}

class LootItemDrop {
  constructor (itemType) {
    this.itemType = itemType
    this.minCount = 1
    this.maxCount = 1
    this.functions = []
    this.conditions = []
    this.weight = 1.0
    this.quality = 1.0
  }
}

class LootCondition {
  constructor (type) {
    this.type = type
  }

  isSilkTouch () {
    if (this.type === 'minecraft:match_tool' &&
        this.predicate &&
        this.predicate.enchantments) {
      for (const enchantment of this.predicate.enchantments) {
        if (enchantment === 'minecraft:silk_touch') return true
      }
    }

    return false
  }
}

class LootFunction {
  constructor (type) {
    this.type = type
  }
}

module.exports = { LootItemDrop, LootCondition, LootFunction, getPotentialDrops, generateLoot }
