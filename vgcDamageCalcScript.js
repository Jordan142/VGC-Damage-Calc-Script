import {calculate, Generations, Pokemon, Move, Field} from '@smogon/calc';
import fetchTeamData from './convertSDPaste.js';

// Moves need to be fixed

const atkPaste = await fetchTeamData("https://pokepast.es/cf23c1115b55728f");

const defPaste = await fetchTeamData("https://pokepast.es/53a0c693aa5453e3");

const gen = Generations.get(9);
atkPaste.forEach((atkPoke) => {
  const moves = atkPoke.moves
  defPaste.forEach((defPoke) => {
    moves.forEach((move) => {
      const result = calculate(
        gen,
        new Pokemon(gen, atkPoke.name, {
          level: 50,
          item: atkPoke.item,
          nature: atkPoke.nature,
          ability: atkPoke.ability,
          teraType: atkPoke.tera,
          ivs: atkPoke.IVs,
          evs: atkPoke.EVs,
        }),
        new Pokemon(gen, defPoke.name, {
          level: 50,
          item: defPoke.item,
          nature: defPoke.nature,
          ability: defPoke.ability,
          teraType: defPoke.tera,
          ivs: defPoke.IVs,
          evs: defPoke.EVs,
        }),
        new Move(gen, move),
      );
      // const rawDesc = result.rawDesc;
      // console.log(rawDesc);
      console.log(atkPoke.name + " vs " + defPoke.name + " " + move + " damage: " + Object.values(result["damage"]));
    })
  })
})

/*
TO DO:
- Review Showdown calc damage formulation to see if I can get any of the below tasks completed using that
- Update message to similar format as other damage calcs
- Find way to calculate OHKO chance
- Find a way to set it to double battles account for double battles
  - Iterate over damage calcs for each Pokemon accounting for each partner Pokemon
- Output final data to a document of some sort
- Create a simple UI to update the Field attribute
*/