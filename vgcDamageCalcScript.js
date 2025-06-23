import {calculate, Generations, Pokemon, Move, Field} from '@smogon/calc';
import fetchTeamData from './convertSDPaste.js';
import { display } from '@smogon/calc/dist/desc.js';
import { input } from '@inquirer/prompts';

/* Example pastes:
https://pokepast.es/53a0c693aa5453e3
https://pokepast.es/cf23c1115b55728f
*/

/*
TO DO:
- Iterate over damage calcs for each Pokemon accounting for each partner Pokemon as a bonus
- Output final data to a document of some sort
- Create a simple UI to update the Field attribute
*/

const userPaste = await input({message:"Which team are you using? (Pokepaste link):"});
if (!userPaste.includes("pokepast.es")) {
  console.log("This is not a valid paste. Please run this again with a valid link.");
  process.exit();
}
const oppPaste = await input({message:"What is the opposition paste? (Pokepaste link):"});
if (!oppPaste.includes("pokepast.es")) {
  console.log("This is not a valid paste. Please run this again with a valid link.");
  process.exit();
}
const whichPaste = await input({message:"Are you wanting attacking or defenseive calcs? (atk/def), Attack is the default:"});

var atkPaste;
var defPaste;

if (whichPaste.toLowerCase().includes("def")) {
  atkPaste = await fetchTeamData(oppPaste);
  defPaste = await fetchTeamData(userPaste);
} else {
  atkPaste = await fetchTeamData(userPaste);
  defPaste = await fetchTeamData(oppPaste);
}

const atkTeraQuestion = await input({message:"Do you want to show additional damage calcs where your attackers are tera'd? (y/n):"});
const defTeraQuestion = await input({message:"Do you want to show additional damage calcs where the opposition Pokemon are tera'd? (y/n):"});

const atkTera = atkTeraQuestion.toLowerCase();
const defTera = defTeraQuestion.toLowerCase();

const gen = Generations.get(9);
atkPaste.forEach((atkPoke) => {
  const moves = atkPoke.moves
  defPaste.forEach((defPoke) => {
    moves.forEach((move) => {
      var field = new Field(
        { gameType: 'Doubles' }
      );
      if (atkTera.toLowerCase() == "y" || atkTera.toLowerCase() == "yes") {
        if (defTera.toLowerCase() == "y" || defTera.toLowerCase() == "yes") {
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "no"); // Atk tera
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "yes"); // Def tera
          battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "yes"); // Atk & Def tera
        } else {
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "no"); // Atk tera
        }
      } else {
        if (defTera.toLowerCase() == "y" || defTera.toLowerCase() == "yes") {
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "yes"); // Def tera
        } else {
          battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
        }
      }
    });
  });
});

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
      console.log(atkMove.name + " does no damage!");
    }
  }
}