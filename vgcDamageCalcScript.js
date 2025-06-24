import {calculate, Generations, Pokemon, Move, Field} from '@smogon/calc';
import fetchTeamData from './convertSDPaste.js';
import { display } from '@smogon/calc/dist/desc.js';
import { input } from '@inquirer/prompts';
import * as fs from "fs";
import { Document, Packer, Paragraph, TextRun } from "docx";

/* Example pastes:
https://pokepast.es/53a0c693aa5453e3
https://pokepast.es/cf23c1115b55728f
*/

/*
TO DO:
- Iterate over damage calcs for each Pokemon accounting for each partner Pokemon as a bonus
- Improve formatting of output doc
- Create a simple UI to update the Field attribute (low priority)
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

const atkTeraQuestion = await input({message:"Do you want to show additional damage calcs where your attackers are tera'd? (y/n), n is the default:"});
const defTeraQuestion = await input({message:"Do you want to show additional damage calcs where the opposition Pokemon are tera'd? (y/n), n is the default:"});

const atkTera = atkTeraQuestion.toLowerCase();
const defTera = defTeraQuestion.toLowerCase();

const gen = Generations.get(9);

var sectionArray = [];
atkPaste.forEach((atkPoke) => {
  const moves = atkPoke.moves
  defPaste.forEach((defPoke) => {
    var damageDescArray = []
    moves.forEach((move) => {
      var field = new Field(
        { gameType: 'Doubles' }
      );
      var moveDesc;
      if (atkTera.toLowerCase() == "y" || atkTera.toLowerCase() == "yes") {
        if (defTera.toLowerCase() == "y" || defTera.toLowerCase() == "yes") {
          moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
          moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "no") // Atk tera
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
          moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "yes"); // Def tera
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
          moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "yes") // Atk & Def tera
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
        } else {
          moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
          moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "no") // Atk tera
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
        }
      } else {
        if (defTera.toLowerCase() == "y" || defTera.toLowerCase() == "yes") {
          moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
          moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "yes"); // Def tera
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
        } else {
          moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
        }
      }
    });
    var childrenArray = {children: [new TextRun({text: atkPoke.name + " vs. " + defPoke.name, bold: true, break: 1})]}
    damageDescArray.forEach((calc) => {
      childrenArray.children.push(new TextRun({text: calc, break: 1}));
    })
    var paragraph = new Paragraph(childrenArray);
    sectionArray.push({children: [paragraph]});
  });
});

const doc = new Document({
  title: "Test Doc",
  sections: sectionArray,
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("testDoc.docx", buffer);
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
      return description;
    } else {
      console.log(atkMove.name + " does no damage!");
      return atkMove.name + " does no damage!";
    }
  }
}