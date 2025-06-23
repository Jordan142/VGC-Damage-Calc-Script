import {calculate, Generations, Pokemon, Move, Field} from '@smogon/calc';
import fetchTeamData from './convertSDPaste.js';
import { display } from '@smogon/calc/dist/desc.js';
import readline from 'node:readline';

const atkPaste = await fetchTeamData("https://pokepast.es/53a0c693aa5453e3");

const defPaste = await fetchTeamData("https://pokepast.es/cf23c1115b55728f");

var atkTera;
var defTera;

// const r1 = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   prompt: '> '
// });

// r1.question("Do you want to show additional damage calcs where your attackers are tera'd? (y/n)", (answer) => {
//   atkTera = answer.toLowerCase();
//   r1.close();
// });

// r1.question("Do you want to show additional damage calcs where the opposition Pokemon are tera'd? (y/n)", (answer) => {
//   defTera = answer.toLowerCase();
//   r1.close();
// });

const gen = Generations.get(9);
atkPaste.forEach((atkPoke) => {
  const moves = atkPoke.moves
  defPaste.forEach((defPoke) => {
    moves.forEach((move) => {
      var field = new Field(
        { gameType: 'Doubles'}
      );
      if (atkTera == "y" || atkTera == "yes") {
        if (defTera == "y" || defTera == "yes") {
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no");
          battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "no");
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "yes");
          battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "yes");
        } else {
          battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "no");
          battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "no");
        }
      } else {
        if (defTera == "y" || defTera == "yes") {
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "yes");
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "yes");
        } else {
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no");
        }
      }
      // if (result["move"]["category"] != "Status") {
      //   if (result.damage != 0) {
      //     const description = display(gen, atkPokemon, defPokemon, atkMove, field, result.damage, result.rawDesc)
      //     console.log(description);
      //   } else {
      //     console.log("This move does no damage!");
      //   }
      // }
    });
  });
});

/*
TO DO:
- Add user input for tera check
- Iterate over damage calcs for each Pokemon accounting for each partner Pokemon as a bonus
- Output final data to a document of some sort
- Create a simple UI to update the Field attribute
*/

function battleConstructor(gen, atkPoke, defPoke, move, field, atkTeraCheck, defTeraCheck) {
  var atkPokemon;
  var defPokemon;
  if (atkTeraCheck == "y" || atkTeraCheck == "yes") {
    atkPokemon = new Pokemon(gen, atkPoke.name, {
      level: 50,
      item: atkPoke.item,
      nature: atkPoke.nature,
      ability: atkPoke.ability,
      teraType: atkPoke.tera,
      ivs: atkPoke.IVs,
      evs: atkPoke.EVs,
    });
  } else {
    atkPokemon = new Pokemon(gen, atkPoke.name, {
      level: 50,
      item: atkPoke.item,
      nature: atkPoke.nature,
      ability: atkPoke.ability,
      ivs: atkPoke.IVs,
      evs: atkPoke.EVs,
    });
  }
  if (defTeraCheck == "y" || defTeraCheck == "yes") {
    defPokemon = new Pokemon(gen, defPoke.name, {
      level: 50,
      item: defPoke.item,
      nature: defPoke.nature,
      ability: defPoke.ability,
      teraType: defPoke.tera,
      ivs: defPoke.IVs,
      evs: defPoke.EVs,
    });
  } else {
    defPokemon = new Pokemon(gen, defPoke.name, {
      level: 50,
      item: defPoke.item,
      nature: defPoke.nature,
      ability: defPoke.ability,
      ivs: defPoke.IVs,
      evs: defPoke.EVs,
    });
  }
  const atkMove = new Move(gen, move);
  const result = calculate(
    gen,
    atkPokemon,
    defPokemon,
    atkMove,
    field
  );

  if (result["move"]["category"] != "Status") {
    if (result.damage != 0) {
      const description = display(gen, atkPokemon, defPokemon, atkMove, field, result.damage, result.rawDesc);
      console.log(description);
    } else {
      console.log("This move does no damage!");
    }
  }
}