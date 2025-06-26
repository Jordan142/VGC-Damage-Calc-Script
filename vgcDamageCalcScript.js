import {calculate, Generations, Pokemon, Move, Field} from '@smogon/calc';
import fetchTeamData from './convertSDPaste.js';
import { display } from '@smogon/calc/dist/desc.js';
import { input } from '@inquirer/prompts';
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
const whichPaste = await input({message:"Are you wanting attacking or defenseive calcs? (atk/def), Attack is the default:"});

const userPaste = await fetchTeamData(userPasteQuestion);
const oppPaste = await fetchTeamData(oppPasteQuestion);

const atkTeraQuestion = await input({message:"Do you want to show additional damage calcs where your attackers are tera'd? (y/n), n is the default:"});
const defTeraQuestion = await input({message:"Do you want to show additional damage calcs where the opposition Pokemon are tera'd? (y/n), n is the default:"});

const atkTera = atkTeraQuestion.toLowerCase();
const defTera = defTeraQuestion.toLowerCase();

const gen = Generations.get(9);

var sectionArray = [];
var moves;
userPaste.forEach((atkPoke) => {
  if (!whichPaste.toLowerCase().includes("def")) {
    moves = atkPoke.moves
  }
  var childrenArray = {children: []};
  oppPaste.forEach((defPoke) => {
    var damageDescArray = []
    if (whichPaste.toLowerCase().includes("def")) {
      moves = defPoke.moves
    }
    moves.forEach((move) => {
      var field = new Field(
        { gameType: 'Doubles' }
      );
      var moveDesc;
      if (atkTera.toLowerCase() == "y" || atkTera.toLowerCase() == "yes") {
        if (defTera.toLowerCase() == "y" || defTera.toLowerCase() == "yes") {
          if (whichPaste.toLowerCase().includes("def")) {
            moveDesc = battleConstructor(gen, defPoke, atkPoke, move, field, "no", "no"); // Standard calc
          } else {
            moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          }
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
          if (whichPaste.toLowerCase().includes("def")) {
            moveDesc = battleConstructor(gen, defPoke, atkPoke, move, field, "yes", "no") // Atk tera
          } else {
            moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "no") // Atk tera
          }
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
          if (whichPaste.toLowerCase().includes("def")) {
            moveDesc = battleConstructor(gen, defPoke, atkPoke, move, field, "no", "yes"); // Def tera
          } else {
            moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "yes"); // Def tera
          }
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
          if (whichPaste.toLowerCase().includes("def")) {
            moveDesc = battleConstructor(gen, defPoke, atkPoke, move, field, "yes", "yes") // Atk & Def tera
          } else {
            moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "yes") // Atk & Def tera
          }
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
        } else {
          if (whichPaste.toLowerCase().includes("def")) {
            moveDesc = battleConstructor(gen, defPoke, atkPoke, move, field, "no", "no"); // Standard calc
          } else {
            moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          }
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
          if (whichPaste.toLowerCase().includes("def")) {
            moveDesc = battleConstructor(gen, defPoke, atkPoke, move, field, "yes", "no") // Atk tera
          } else {
            moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "yes", "no") // Atk tera
          }
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
        }
      } else {
        if (defTera.toLowerCase() == "y" || defTera.toLowerCase() == "yes") {
          if (whichPaste.toLowerCase().includes("def")) {
            moveDesc = battleConstructor(gen, defPoke, atkPoke, move, field, "no", "no"); // Standard calc
          } else {
            moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          }
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
          if (whichPaste.toLowerCase().includes("def")) {
            moveDesc = battleConstructor(gen, defPoke, atkPoke, move, field, "no", "yes"); // Def tera
          } else {
            moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "yes"); // Def tera
          }
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
        } else {
          if (whichPaste.toLowerCase().includes("def")) {
            moveDesc = battleConstructor(gen, defPoke, atkPoke, move, field, "no", "no"); // Standard calc
          } else {
            moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "no", "no"); // Standard calc
          }
          if (moveDesc != undefined) {
            damageDescArray.push(moveDesc);
          }
        }
      }
    });
    if (whichPaste.toLowerCase().includes("def")) {
      childrenArray.children.push(new TextRun({text: atkPoke.name + " (def) vs. (atk) " + defPoke.name, font: "Aptos", size: 32, bold: true, underline: {type: UnderlineType.THICK}, break: 1})) // Font size is in half point, so size: 32 = 16 in Word
    } else {
      childrenArray.children.push(new TextRun({text: atkPoke.name + " (atk) vs. (def) " + defPoke.name, font: "Aptos", size: 32, bold: true, underline: {type: UnderlineType.THICK}, break: 1})) // Font size is in half point, so size: 32 = 16 in Word
    }
    damageDescArray.forEach((calc) => {
      childrenArray.children.push(new TextRun({text: calc, font: "Aptos", size: 24, break: 1}));
    })
    childrenArray.children.push(new TextRun({font: "Aptos", size: 24, break: 1}));
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
  console.log("This is not a valid paste. Please enter a valid name for the document.");
  docName = await input({message:"What do you want to name the calc document?:"});
}

if (fs.existsSync("generatedDocs\\")) {
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("generatedDocs\\" + docName + ".docx", buffer);
  });
} else {
  fs.mkdirSync("generatedDocs");
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("generatedDocs\\" + docName + ".docx", buffer);
  });
}

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