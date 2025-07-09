import {calculate, Generations, Pokemon, Move, Field} from '@smogon/calc';
import fetchTeamData from './convertSDPaste.js';
import { display } from '@smogon/calc/dist/desc.js';
import { input, select } from '@inquirer/prompts';
import * as fs from "fs";
import { Document, Packer, Paragraph, TextRun, UnderlineType } from "docx";

/* Example pastes:
https://pokepast.es/53a0c693aa5453e3
https://pokepast.es/cf23c1115b55728f
*/

const userPasteQuestion = await input({message:"Which team are you using? (Pokepaste link):"});
if (!userPasteQuestion.includes("pokepast.es")) {
  console.log("This is not a valid paste. Please run this again with a valid link.");
  process.exit();
}
const oppPasteQuestion = await input({message:"What is the opposition paste? (Pokepaste link):"});
if (!oppPasteQuestion.includes("pokepast.es")) {
  console.log("This is not a valid paste. Please run this again with a valid link.");
  process.exit();
}
const whichPaste = await select({
  message: "Are you wanting attacking, defensive or both calcs?",
  choices: [
    {
      name: "Attacking",
      value: "Attack",
    },
    {
      name: "Defensive",
      value: "Defend",
    },
    {
      name: "Both",
      value: "Both",
    }
  ],
  default: "Both",
});

const userPaste = await fetchTeamData(userPasteQuestion);
const oppPaste = await fetchTeamData(oppPasteQuestion);

const atkTera = await select({
  message:"Do you want to show additional damage calcs where your attackers are tera'd?",
  choices: [
    {
      name: "Yes",
      value: "Yes",
    },
    {
      name: "No",
      value: "No",
    }
  ],
  default: "No",
});

const defTera = await select({
  message:"Do you want to show additional damage calcs where the opposition Pokemon are tera'd?",
  choices: [
    {
      name: "Yes",
      value: "Yes",
    },
    {
      name: "No",
      value: "No",
    }
  ],
  default: "No",
});

const gen = Generations.get(9);

var sectionArray = [];
userPaste.forEach((userPoke) => {
  const atkMoves = userPoke.moves
  var childrenArray = {children: []};
  oppPaste.forEach((oppPoke) => {
    var damageDescArray;
    const defMoves = oppPoke.moves
    var field = new Field(
      { gameType: 'Doubles' }
    );
    if (!whichPaste.toLowerCase().includes("atk")) {
      damageDescArray = moveDescConstructor(gen, userPoke, oppPoke, field, atkTera, defTera, atkMoves, damageDescArray);
      childrenArray.children.push(new TextRun({text: userPoke.name + " (atk) vs. (def) " + oppPoke.name, font: "Aptos", size: 32, bold: true, underline: {type: UnderlineType.THICK}, break: 1})) // Font size is in half point, so size: 32 = 16 in Word
      damageDescArray.forEach((calc) => {
        childrenArray.children.push(new TextRun({text: calc, font: "Aptos", size: 24, break: 1}));
      })
      childrenArray.children.push(new TextRun({font: "Aptos", size: 24, break: 1}));
    }
    if (!whichPaste.toLowerCase().includes("def")) {
      damageDescArray = moveDescConstructor(gen, oppPoke, userPoke, field, defTera, atkTera, defMoves, damageDescArray);
      childrenArray.children.push(new TextRun({text: userPoke.name + " (def) vs. (atk) " + oppPoke.name, font: "Aptos", size: 32, bold: true, underline: {type: UnderlineType.THICK}, break: 1})) // Font size is in half point, so size: 32 = 16 in Word
      damageDescArray.forEach((calc) => {
        childrenArray.children.push(new TextRun({text: calc, font: "Aptos", size: 24, break: 1}));
      })
      childrenArray.children.push(new TextRun({font: "Aptos", size: 24, break: 1}));
    }
  });
  var paragraph = new Paragraph(childrenArray);
  sectionArray.push({children: [paragraph]});
});

const doc = new Document({
  title: "Test Doc",
  sections: sectionArray,
});

var docName = await input({message:"What do you want to name the calc document? (Naming the document the same as another document will overwrite the original document):"});
while (docName == undefined || docName == "") {
  console.log("This is not a valid name. Please enter a valid name for the document.");
  docName = await input({message:"What do you want to name the calc document?:"});
}

if (fs.existsSync("generatedDocs/")) {
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("generatedDocs/" + docName + ".docx", buffer);
  });
} else {
  fs.mkdirSync("generatedDocs");
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("generatedDocs/" + docName + ".docx", buffer);
  });
}

function moveDescConstructor(gen, atkPoke, defPoke, field, atkTera, defTera, moves, damageDescArray) {
  damageDescArray = [];
  moves.forEach((move) => {
    var moveDesc;

    moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "No", "No"); // Standard calc
    if (moveDesc != undefined) {
      damageDescArray.push(moveDesc);
    }
    if (atkTera == "Yes") {
      moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "Yes", "No") // Atk tera
      if (moveDesc != undefined) {
        damageDescArray.push(moveDesc);
      }
    }
    if (defTera == "Yes") {
      moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "No", "Yes"); // Def tera
      if (moveDesc != undefined) {
        damageDescArray.push(moveDesc);
      }
    }
    if (atkTera == "Yes" && defTera == "Yes") {
      moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "Yes", "Yes") // Atk & Def tera
      if (moveDesc != undefined) {
        damageDescArray.push(moveDesc);
      }
    }
  });
  return damageDescArray;
}

function battleConstructor(gen, atkPoke, defPoke, move, field, atkTeraCheck, defTeraCheck) {
  var atkPokemon;
  var defPokemon;
  if (atkTeraCheck == "Yes") {
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
  if (defTeraCheck == "Yes") {
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
      return description;
    } else {
      return atkMove.name + " does no damage!";
    }
  }
}