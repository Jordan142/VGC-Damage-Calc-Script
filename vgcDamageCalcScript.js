import {calculate, Generations, Pokemon, Move, Field} from '@smogon/calc';
import fetchTeamData from './convertSDPaste.js';
import { getKOChance } from '@smogon/calc/dist/desc.js';

// Moves need to be fixed

const atkPaste = await fetchTeamData("https://pokepast.es/cf23c1115b55728f");

const defPaste = await fetchTeamData("https://pokepast.es/53a0c693aa5453e3");

const gen = Generations.get(9);
atkPaste.forEach((atkPoke) => {
  const moves = atkPoke.moves
  defPaste.forEach((defPoke) => {
    moves.forEach((move) => {
      const atkPokemon = new Pokemon(gen, atkPoke.name, {
          level: 50,
          item: atkPoke.item,
          nature: atkPoke.nature,
          ability: atkPoke.ability,
          teraType: atkPoke.tera,
          ivs: atkPoke.IVs,
          evs: atkPoke.EVs,
        });
      const defPokemon = new Pokemon(gen, defPoke.name, {
          level: 50,
          item: defPoke.item,
          nature: defPoke.nature,
          ability: defPoke.ability,
          teraType: defPoke.tera,
          ivs: defPoke.IVs,
          evs: defPoke.EVs,
        });
      const atkMove = new Move(gen, move)
      const result = calculate(
        gen,
        atkPokemon,
        defPokemon,
        atkMove,
      );
      if (result["move"]["category"] != "Status") {
        if (result.damage != 0) {
          damageDescription(result);
          const koChance = getKOChance(gen, atkPokemon, defPokemon, atkMove, new Field({defenderSide: {isLightScreen: false}}), result.damage);
          console.log(koChance);
        } else {
          console.log("This move does no damage!");
        }
      }
    })
  })
});

/*
TO DO:
- Find way to calculate OHKO chance
- Find a way to set it to double battles account for double battles
  - Iterate over damage calcs for each Pokemon accounting for each partner Pokemon
- Output final data to a document of some sort
- Create a simple UI to update the Field attribute
*/

function damageDescription(result) {
  const desc = result.rawDesc;
  const damage = result.damage;
  const defPoke = result.defender;
  const minDamPerc = Math.round((damage[0] / defPoke.originalCurHP) * 1000)/10;
  const maxDamPerc = Math.round((damage[15] / defPoke.originalCurHP) * 1000)/10;
  const baseOutput = desc.attackEVs + " " + desc.attackerName + " " + desc.moveName + " vs. " + desc.HPEVs + "/" + desc.defenseEVs + " " + desc.defenderName + ": " + damage[0] + "-" + damage[15] + " (" + minDamPerc + " - " + maxDamPerc + "%)"; 
  console.log(baseOutput);
  console.log(damage);
}