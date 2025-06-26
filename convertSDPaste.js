import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

// Class to represent a Pokemon
class Pokemon {
    constructor(name, tera, ability, moves, IVs, EVs, nature, item) {
        this.name = name;
        this.tera = tera;
        this.ability = ability;
        this.moves = moves;
        this.IVs = IVs;
        this.EVs = EVs;
        this.nature = nature;
        this.item = item;
    }
}

// Function to fix special characters
const fixSpecialChars = (name) => {
    return name.replace("&#39;", "'")
               .replace("&amp;", "&")
               .replace("&gt;", ">")
               .replace("&lt;", "<");
};

// Correct the Tera type string
const correctTeraType = (text) => {
    const teraExceptions = ["normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel",
                            "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy", "stellar", "Stellar"];
    for (const tera of teraExceptions) {
        if (text.toLowerCase().includes(tera)) {
            return tera.charAt(0).toUpperCase() + tera.slice(1);
        }
    }
    return text.trim();
};

// Patch move exceptions in the text
const patchMoveExceptions = (text) => {
    const moveExceptions = [
        "Matcha Gotcha", "Blood Moon", "Ivy Cudgel", "Syrup Bomb", "Electro Shot", "Thunderclap", "Tachyon Cutter", 
        "Mighty Cleave", "Psyblade", "Hydro Steam", "Supercell Slam", "Burning Bulwark", "Hard Press", "Fickle Beam", 
        "Tera Starstorm", "Dragon Cheer", "Alluring Voice", "Temper Flare", "Psychic Noise", "Upper Hand", "Malignant Chain"
    ];

    let returnText = text;

    moveExceptions.forEach(move => {
        returnText = returnText.replace(`- ${move}`, `<span class="type-grass">-</span> ${move}  `);
    });

    return returnText;
};

// Patch mon exceptions in the text
const patchMonExceptions = (text) => {
    const monExceptions = [
        "Munkidori", "Okidogi", "Fezandipiti", "Dipplin", "-Bloodmoon", "-Hisui", "-Cornerstone", "-Wellspring", 
        "-Hearthflame", "-Artisan", "-Masterpiece", "Overqwil", "Walking Wake", "Iron Leaves", "Archaludon", "Raging Bolt", 
        "Hydrapple", "Gouging Fire", "Iron Boulder", "Iron Crown", "Terapagos", "Pecharunt"
    ];

    let returnText = text;
    const firstSplit = returnText.split('</span>')[0];

    monExceptions.forEach(exception => {
        if (firstSplit.includes(exception)) {
            returnText = `<span class="type-grass">${returnText.replace(exception, exception + "</span>")}`;
            returnText = returnText.replace("-Masterpiece", "").replace("-Artisan", "");
            return returnText;
        }
    });

    return returnText;
};

// Fetch team data from a URL
export default async function fetchTeamData(url) {
    const response = await fetch(url);
    const text = await response.text();

    const $ = cheerio.load(text);
    const team = [];

    const preBlocks = $('pre');
    preBlocks.each((index, pre) => {
        let monHtml = $(pre).html();
        monHtml = patchMonExceptions(monHtml);
        monHtml = patchMoveExceptions(monHtml);

        const $$ = cheerio.load(monHtml);

        // Extract name from the header
        let headerText = $$.text().split('\n')[0].trim();
        headerText = headerText.replace('(M)', '').replace('(F)', '');
        let name = headerText.includes('(') ? headerText.split('(')[1].split(')')[0].split('@')[0].trim() : headerText.split('@')[0].trim();
        name = fixSpecialChars(name);

        // Extract Tera Type
        let tera = "Unknown";
        const teraSpan = $$('span').filter((i, el) => $(el).text() === 'Tera Type: ').next('span');
        const teraStellarTest = $$.text().split('\n')[3].trim();
        if (teraStellarTest.includes("Stellar") || teraStellarTest.includes("stellar")) {
          tera = "Stellar";
        } else {
          if (teraSpan.length) {
            tera = correctTeraType(teraSpan.text());
          } else {
              const teraText = $$.text().splitlines().find(line => line.includes('Tera Type'));
              if (teraText) {
                  tera = correctTeraType(teraText.split(': ')[1]);
              }
          }
        }

        // Extract Ability
        const ability = $$.text().split('\n')[1].replace('Ability: ', '').trim() || "Unknown";

        // Extract Item
        const itemLine = $$.text().split('\n').find(line => line.includes('@'));
        const item = itemLine ? itemLine.split('@')[1].trim() : "No Item";

        // Adjust names based on item
        if (name === "Zacian" && item === "Rusted Sword") name = "Zacian-Crowned";
        if (name === "Zamazenta" && item === "Rusted Shield") name = "Zamazenta-Crowned";

        // Extract Moves
        const moves = [];
        const lines = $$.text().split('\n- ');
        lines.shift();
        lines.forEach((move, i) => {
          move = move.trim();
          if (name === "Zacian-Crowned" || name === "Zamazenta-Crowned") {
            if (name === "Zacian-Crowned" && move === "Iron Head") {
                move = "Behemoth Blade";
            } else if (name === "Zamazenta-Crowned" && move === "Iron Head") {
                move = "Behemoth Bash";
            }
          }
          moves.push(move);
        })

        // Extract EVs and IVs (same as the previous logic)
        let hpIV;
        let atkIV;
        let defIV;
        let spaIV;
        let spdIV;
        let speIV;
        let span;
        const ivSpan = $$('span').filter((i, el) => $(el).text() === 'IVs: ').next('span');
        if (ivSpan.length) {
            span = ivSpan.text();
            var stat = span.slice(-3);
            if (stat == " HP") {
              hpIV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('HP')).next('span').text();
              stat = span.slice(-3);
            } else {
              hpIV = 31;
            }
            if (stat == "Atk") {
              atkIV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('Atk')).next('span').text();
              stat = span.slice(-3);
            } else {
              atkIV = 31;
            }
            if (stat == "Def") {
              defIV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('Def')).next('span').text();
              stat = span.slice(-3);
            } else {
              defIV = 31;
            }
            if (stat == "SpA") {
              spaIV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('SpA')).next('span').text();
              stat = span.slice(-3);
            } else {
              spaIV = 31;
            }
            if (stat == "SpD") {
              spdIV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('SpD')).next('span').text();
              stat = span.slice(-3);
            } else {
              spdIV = 31;
            }
            if (stat == "Spe") {
              speIV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('Spe')).next('span').text();
              stat = span.slice(-3);
            } else {
              speIV = 31;
            }
        } else {
            hpIV = 31;
            atkIV = 31;
            defIV = 31;
            spaIV = 31;
            spdIV = 31;
            speIV = 31;
        }

        let hpEV;
        let atkEV;
        let defEV;
        let spaEV;
        let spdEV;
        let speEV;
        const evSpan = $$('span').filter((i, el) => $(el).text() === 'EVs: ').next('span');
        if (evSpan.length) {
            span = evSpan.text();
            var stat = span.slice(-3);
            if (stat == " HP") {
              hpEV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('HP')).next('span').text();
              stat = span.slice(-3);
            } else {
              hpEV = 0;
            }
            if (stat == "Atk") {
              atkEV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('Atk')).next('span').text();
              stat = span.slice(-3);
            } else {
              atkEV = 0;
            }
            if (stat == "Def") {
              defEV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('Def')).next('span').text();
              stat = span.slice(-3);
            } else {
              defEV = 0;
            }
            if (stat == "SpA") {
              spaEV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('SpA')).next('span').text();
              stat = span.slice(-3);
            } else {
              spaEV = 0;
            }
            if (stat == "SpD") {
              spdEV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('SpD')).next('span').text();
              stat = span.slice(-3);
            } else {
              spdEV = 0;
            }
            if (stat == "Spe") {
              speEV = parseInt(span.replace(" " + stat, ""));
              span = $$('span').filter((i, el) => $(el).text().includes('Spe')).next('span').text();
              stat = span.slice(-3);
            } else {
              speEV = 0;
            }
        } else {
            hpEV = 0;
            atkEV = 0;
            defEV = 0;
            spaEV = 0;
            spdEV = 0;
            speEV = 0;
        }

        const IVs = {"hp": hpIV, "atk": atkIV, "def": defIV, "spa": spaIV, "spd": spdIV, "spe": speIV};
        const EVs = {"hp": hpEV, "atk": atkEV, "def": defEV, "spa": spaEV, "spd": spdEV, "spe": speEV};

        const natureLine = $$.text().split('\n')[5].trim();
        var nature;
        if (natureLine.includes("Nature")) {
          nature = natureLine.replace(" Nature", "").trim();
        } else {
          nature = "Bashful"
        }

        // Create Pokemon object and add it to the team
        const mon = new Pokemon(name, tera, ability, moves, IVs, EVs, nature, item);
        team.push(mon);
    });

    return team;
};