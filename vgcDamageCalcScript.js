import {Dex} from '@pkmn/dex';
import {Generations} from '@pkmn/data';
import {calculate, Pokemon, Move, Field, Result} from '@smogon/calc';
import fetchTeamData from './convertSDPaste.js';
import fieldStatequestionnaire from './fieldState.js';
import { input, select } from '@inquirer/prompts';
import * as fs from "fs";
import { Document, Packer, Paragraph, TextRun, UnderlineType } from "docx";

/* Example pastes:
https://pokepast.es/53a0c693aa5453e3 - Zacian Paste
https://pokepast.es/cf23c1115b55728f - Zam Paste
https://pokepast.es/a6f455eb0c255c08 - Terapagos/Stellar Tera Paste
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
  default: "Yes",
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
  default: "Yes",
});

const additionalFieldEffects = await select({
  message:"Do you want to show additional damage calcs for any potential field effects? i.e Weather, Terrain, Screens, etc.",
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

var fieldArray;
if (additionalFieldEffects == "Yes") {
  fieldArray = await fieldStatequestionnaire(userPaste, oppPaste);
} else {
  fieldArray = [new Field(
    { gameType: 'Doubles' }
  )];
}

const fileOutput = await select({
  message:"What format do you want the damage calcs stored in?",
  choices: [
    {
      name: "docx",
      value: "docx",
    },
    {
      name: "markdown",
      value: "mk",
    }
  ],
  default: "docx",
});

var docName = await input({message:"What do you want to name the calc document? (Naming the document the same as another document will overwrite the original document):"});
while (docName == undefined || docName == "") {
  console.log("This is not a valid name. Please enter a valid name for the document.");
  docName = await input({message:"What do you want to name the calc document?:"});
}

if (!fs.existsSync("generatedDocs/")) {
  fs.mkdirSync("generatedDocs");
}

if(fs.existsSync("generatedDocs/" + docName + ".md")) {
  fs.writeFileSync("generatedDocs/" + docName + ".md", "");
}

const gens = new Generations(Dex);
const gen = gens.get(9);

var sectionArray = [];
userPaste.forEach((userPoke) => {
  const atkMoves = userPoke.moves
  var childrenArray = {children: []};
  oppPaste.forEach((oppPoke) => {
    var userDamageDescArray = [];
    var oppDamageDescArray = [];
    var firstUserDamageDescArray;
    var firstOppDamageDescArray;
    const defMoves = oppPoke.moves
    // Iterate's through the field conditions
    fieldArray.forEach((field) => {
      var fieldStatus = "Field Status: ";
      for (var status in field) {
        var statusValue = field[status];
        if (statusValue != false && statusValue != undefined && statusValue != 0 && typeof(statusValue) != "function") {
          if (status == "attackerSide" || status == "defenderSide") {
            var sideFieldStatus = "";
            var i = 0;
            for (var sideStatus in statusValue) {
              var sideStatusValue = statusValue[sideStatus];
              if (sideStatusValue != false && sideStatusValue != undefined && sideStatusValue != 0 && typeof(sideStatusValue) != "function") {
                sideFieldStatus += sideStatus + ": " + sideStatusValue + ", ";
                i++;
              }
            }
            if (i > 0) {
              if (status == "attackerSide") {
                fieldStatus += "User Side: " + sideFieldStatus;
              } else {
                fieldStatus += "Opposition Side: " + sideFieldStatus;
              }
            }
          } else {
            fieldStatus += status + ": " + statusValue + ", ";
          }
        }
      }
      fieldStatus = fieldStatus.substring(0, fieldStatus.length - 2); // removes the ", " from the end of the last field status

      // Creates offensive calcs
      if (whichPaste !== "Defend") {
        userDamageDescArray = moveDescConstructor(gen, userPoke, oppPoke, field, atkTera, defTera, atkMoves, userDamageDescArray);
        var newUserDamageDescArray = [];
        if (firstUserDamageDescArray == undefined) {
          firstUserDamageDescArray = newUserDamageDescArray = userDamageDescArray;
        } else {
          // Adds damage calcs that have not shown up before
          userDamageDescArray.forEach((damage) => {
            if (!firstUserDamageDescArray.includes(damage)) {
              newUserDamageDescArray.push(damage);
            }
          })
          // Adds the new calcs to the comparison list
          firstUserDamageDescArray = firstUserDamageDescArray.concat(newUserDamageDescArray);
        }
        if (fileOutput == "docx") {
          if (newUserDamageDescArray.length > 0) {
            childrenArray.children.push(new TextRun({text: userPoke.name + " (atk) vs. (def) " + oppPoke.name, font: "Calibri", size: 32, bold: true, underline: {type: UnderlineType.THICK}, break: 1})); // Font size is in half point, so size: 32 = 16 in Word
            childrenArray.children.push(new TextRun({text: fieldStatus, font: "Calibri", size: 28, bold: true, underline: {type: UnderlineType.THICK}, break: 1}));
            newUserDamageDescArray.forEach((calc) => {
              childrenArray.children.push(new TextRun({text: calc, font: "Calibri", size: 24, break: 1}));
            })
            childrenArray.children.push(new TextRun({font: "Calibri", size: 24, break: 1}));
          }
        } else if (fileOutput == "mk") {
          if (newUserDamageDescArray.length > 0) {
            var file = fs.openSync("generatedDocs/" + docName + ".md", "a");
            fs.writeFileSync(file, "## " + userPoke.name + " (atk) vs. (def) " + oppPoke.name + "\n");
            fs.writeFileSync(file, "### " + fieldStatus + "\n");
            newUserDamageDescArray.forEach((calc) => {
              fs.writeFileSync(file, calc + "  \n");
            })
            fs.writeFileSync(file, "\n");
          }
        }
      }
      // Creates defensive calcs
      if (whichPaste !== "Attack") {
        // Updates the field so that the user Side attributes are on the defensive calcs and opp Side attributes are on the offensive calcs
        var userSide = field["attackerSide"];
        var oppSide = field["defenderSide"];
        field["attackerSide"] = oppSide;
        field["defenderSide"] = userSide; 

        oppDamageDescArray = moveDescConstructor(gen, oppPoke, userPoke, field, defTera, atkTera, defMoves, oppDamageDescArray);

        // Reverts the change back because it doesn't do that by itself when testing
        field["attackerSide"] = userSide;
        field["defenderSide"] = oppSide;

        var newOppDamageDescArray = [];
        if (firstOppDamageDescArray == undefined) {
          firstOppDamageDescArray = newOppDamageDescArray = oppDamageDescArray;
        } else {
          // Adds damage calcs that have not shown up before
          oppDamageDescArray.forEach((damage) => {
            if (!firstOppDamageDescArray.includes(damage)) {
              newOppDamageDescArray.push(damage);
            }
          })
          // Adds the new calcs to the comparison list
          firstOppDamageDescArray = firstOppDamageDescArray.concat(newOppDamageDescArray);
        }
        if (fileOutput == "docx") {
          if (newOppDamageDescArray.length > 0) {
            childrenArray.children.push(new TextRun({text: userPoke.name + " (def) vs. (atk) " + oppPoke.name, font: "Calibri", size: 32, bold: true, underline: {type: UnderlineType.THICK}, break: 1})); // Font size is in half point, so size: 32 = 16 in Word
            childrenArray.children.push(new TextRun({text: fieldStatus, font: "Calibri", size: 28, bold: true, underline: {type: UnderlineType.THICK}, break: 1}));
            newOppDamageDescArray.forEach((calc) => {
              childrenArray.children.push(new TextRun({text: calc, font: "Calibri", size: 24, break: 1}));
            })
            childrenArray.children.push(new TextRun({font: "Calibri", size: 24, break: 1}));
          }
        } else if (fileOutput == "mk") {
          if (newOppDamageDescArray.length > 0) {
            var file = fs.openSync("generatedDocs/" + docName + ".md", "a");
            fs.writeFileSync(file, "## " + userPoke.name + " (def) vs. (atk) " + oppPoke.name + "\n");
            fs.writeFileSync(file, "### " + fieldStatus + "\n");
            newOppDamageDescArray.forEach((calc) => {
              fs.writeFileSync(file, calc + "  \n");
            })
            fs.writeFileSync(file, "\n");
          }
        }
      }
    })
  });
  if (fileOutput == "docx") {
    var paragraph = new Paragraph(childrenArray);
    sectionArray.push({children: [paragraph]});
  }
});

var doc;
if (fileOutput == "docx") {
  doc = new Document({
    title: "Test Doc",
    sections: sectionArray,
  });
}

if (fileOutput == "docx") {
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("generatedDocs/" + docName + ".docx", buffer);
  });
}

function moveDescConstructor(gen, atkPoke, defPoke, field, atkTera, defTera, moves, damageDescArray) {
  damageDescArray = [];
  moves.forEach((move) => {
    var moveDesc;
    var moveDescArray = [];

    moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "No", "No"); // Standard calc
    if (moveDesc != undefined) {
      moveDescArray.push(moveDesc);
    }
    if (atkTera == "Yes") {
      moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "Yes", "No") // Atk tera
      if (moveDesc != undefined) {
        moveDescArray.push(moveDesc);
      }
    }
    if (defTera == "Yes") {
      moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "No", "Yes"); // Def tera
      if (moveDesc != undefined) {
        moveDescArray.push(moveDesc);
      }
    }
    if (atkTera == "Yes" && defTera == "Yes") {
      moveDesc = battleConstructor(gen, atkPoke, defPoke, move, field, "Yes", "Yes") // Atk & Def tera
      if (moveDesc != undefined) {
        moveDescArray.push(moveDesc);
      }
    }

    // Removes damage descriptions when tera doesn't make difference to damage output
    if (moveDescArray.length > 1) {
      var newMoveDescArray = [];
      var descArray = [];

      moveDescArray.forEach((damageDesc) => {
        var damageAmount = damageDesc.split(":")[1]; // Should only be the amount of damage with any terrain recovery
        if (!descArray.includes(damageAmount)) {
          descArray.push(damageAmount);
          newMoveDescArray.push(damageDesc);
        }
      })
      damageDescArray = damageDescArray.concat(newMoveDescArray);
    } else {
      damageDescArray = damageDescArray.concat(moveDescArray);
    }
  });

  return damageDescArray;
}

function battleConstructor(gen, atkPoke, defPoke, move, field, atkTeraCheck, defTeraCheck) {
  var atkPokemon;
  var defPokemon;
  var atkPokeName = atkPoke.name;
  var atkPokeAbility = atkPoke.ability;
  var atkPokeItem = atkPoke.item;
  var defPokeName = defPoke.name;
  var defPokeAbility = defPoke.ability;
  var defPokeItem = defPoke.item;
  if (atkTeraCheck == "Yes") {
    if (atkPokeName == "Ogerpon-Hearthflame") {
      atkPokeAbility = "Embody Aspect (Hearthflame)";
    } else if (atkPokeName == "Terapagos-Terastal") {
      atkPokeName = "Terapagos-Stellar";
      atkPokeAbility = "Teraform Zero";
    }
    atkPokemon = new Pokemon(gen, atkPokeName, {
      level: 50,
      item: atkPokeItem,
      nature: atkPoke.nature,
      ability: atkPokeAbility,
      teraType: atkPoke.tera,
      ivs: atkPoke.IVs,
      evs: atkPoke.EVs,
      boostedStat: "auto",
    });
  } else {
    if (atkPokeName == "Terapagos-Terastal") {
      atkPokeAbility = "Tera Shell";
    }
    atkPokemon = new Pokemon(gen, atkPokeName, {
      level: 50,
      item: atkPokeItem,
      nature: atkPoke.nature,
      ability: atkPokeAbility,
      ivs: atkPoke.IVs,
      evs: atkPoke.EVs,
      boostedStat: "auto",
    });
  }
  if (defTeraCheck == "Yes") {
    if (defPokeName == "Ogerpon-Cornerstone") {
      defPokeAbility = "Embody Aspect (Cornerstone)";
    } else if (defPokeName == "Ogerpon-Wellspring") {
      defPokeAbility = "Embody Aspect (Wellspring)";
    } else if (defPokeName == "Terapagos-Terastal") {
      defPokeName = "Terapagos-Stellar";
      defPokeAbility = "Teraform Zero";
    }
    defPokemon = new Pokemon(gen, defPokeName, {
      level: 50,
      item: defPokeItem,
      nature: defPoke.nature,
      ability: defPokeAbility,
      teraType: defPoke.tera,
      ivs: defPoke.IVs,
      evs: defPoke.EVs,
      boostedStat: "auto",
    });
  } else {
    if (defPokeName == "Terapagos-Terastal") {
      defPokeAbility = "Tera Shell";
    }
    defPokemon = new Pokemon(gen, defPokeName, {
      level: 50,
      item: defPokeItem,
      nature: defPoke.nature,
      ability: defPokeAbility,
      ivs: defPoke.IVs,
      evs: defPoke.EVs,
      boostedStat: "auto",
    });
  }
  var atkMove = new Move(gen, move, {
    ability: atkPokeAbility,
    item: atkPokeItem,
  });
  if (atkTeraCheck == "Yes") {
    if (atkPoke.tera == "Stellar") {
      // Required to account for tera Stellar in calcs
      atkMove = new Move(gen, move, {
        ability: atkPokeAbility,
        item: atkPokeItem,
        isStellarFirstUse: true,
      });
      if (move == "Tera Starstorm") {
          atkMove = new Move(gen, move, {
          ability: atkPokeAbility,
          item: atkPokeItem,
          overrides: {type: "Stellar"}, // Required as default type for Tera Starstorm in Normal
        });
      }
    }
  }

  var result = calculate(
    gen,
    atkPokemon,
    defPokemon,
    atkMove,
    field
  );

  if (result["move"]["category"] != "Status") {
    if (result.damage != 0) {
      var resultBase = new Result(gen, atkPokemon, defPokemon, result.move, field, result.damage, result.rawDesc);
      var description = resultBase.desc();
      var c = resultBase.moveDesc();
      var e = resultBase.recoil();
      var f = resultBase.recovery();
      if (e.text != "" || f.text != "") {
        var damageRange = c.split(" (")[0];
        description = description.replace(damageRange, c);
      }
      return description;
    } else {
      return atkMove.name + " does no damage!";
    }
  }
}