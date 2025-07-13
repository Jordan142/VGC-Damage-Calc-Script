import {Field, Side} from '@smogon/calc';
import {checkbox} from '@inquirer/prompts';

export default async function fieldStatequestionnaire(userPaste, oppPaste) {
    var fieldArray = [];

    var userMoves = [];
    var userAbilities = [];
    var oppMoves = [];
    var oppAbilities = [];

    userPaste.forEach((poke) => {
        userAbilities.push(poke.ability);
        var pokeMoves = poke.moves;
        pokeMoves.forEach((move) => {
            userMoves.push(move);
        });
    });

    oppPaste.forEach((poke) => {
        oppAbilities.push(poke.ability);
        var pokeMoves = poke.moves;
        pokeMoves.forEach((move) => {
            oppMoves.push(move);
        });
    });

    const weatherOptions = await checkbox({
        message: 'Please select the list of weather states you want to add calcs for:',
        choices: [
            { name: 'None', value: undefined, checked: true },
            { name: 'Sun', value: 'Sun' },
            { name: 'Rain', value: 'Rain' },
            { name: 'Sand', value: 'Sand' },
            { name: 'Snow', value: 'Snow' },
        ],
    });

    const terrainOptions = await checkbox({
        message: 'Please select the list of terrain states you want to add calcs for:',
        choices: [
            { name: 'None', value: undefined, checked: true },
            { name: 'Electric', value: 'Electric' },
            { name: 'Grasssy', value: 'Grassy' },
            { name: 'Misty', value: 'Misty' },
            { name: 'Psychic', value: 'Pyschic' },
        ],
    });

    var magicRoom = [undefined];
    if (userMoves.includes("Magic Room") || oppMoves.includes("Magic Room")) {
        magicRoom = await checkbox({
            message: 'Please select the list of Magic Room options you want to add calcs for:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var wonderRoom = [undefined];
    if (userMoves.includes("Wonder Room") || oppMoves.includes("Wonder Room")) {
        wonderRoom = await checkbox({
            message: 'Please select the list of Wonder Room options you want to add calcs for:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var gravity = [undefined];
    if (userMoves.includes("Gravity") || oppMoves.includes("Gravity")) {
        gravity = await checkbox({
            message: 'Please select the list of Gravity options you want to add calcs for:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var auraBreak = [undefined];
    if (userAbilities.includes("Aura Break") || oppAbilities.includes("Aura Break")) {
        auraBreak = await checkbox({
            message: 'Please select the list of Aura Break options you want to add calcs for:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var fairyAura = [undefined];
    if (userAbilities.includes("Fairy Aura") || oppAbilities.includes("Fairy Aura")) {
        fairyAura = await checkbox({
            message: 'Please select the list of Fairy Aura options you want to add calcs for:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var darkAura = [undefined];
    if (userAbilities.includes("Dark Aura") || oppAbilities.includes("Dark Aura")) {
        darkAura = await checkbox({
            message: 'Please select the list of Dark Aura options you want to add calcs for:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var beadsRuin = [undefined];
    if (userAbilities.includes("Beads of Ruin") || oppAbilities.includes("Beads of Ruin")) {
        beadsRuin = await checkbox({
            message: 'Please select the list of Beads of Ruin options you want to add calcs for:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var swordRuin = [undefined];
    if (userAbilities.includes("Sword of Ruin") || oppAbilities.includes("Sword of Ruin")) {
        swordRuin = await checkbox({
            message: 'Please select the list of Sword of Ruin options you want to add calcs for:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var tabletRuin = [undefined];
    if (userAbilities.includes("Tablet of Ruin") || oppAbilities.includes("Tablet of Ruin")) {
        tabletRuin = await checkbox({
            message: 'Please select the list of Tablet of Ruin options you want to add calcs for:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var vesselRuin = [undefined];
    if (userAbilities.includes("Vessel of Ruin") || oppAbilities.includes("Vessel of Ruin")) {
        vesselRuin = await checkbox({
            message: 'Please select the list of Vessel of Ruin options you want to add calcs for:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var spikesAtk = [0];
    if (oppMoves.includes("Spikes") || oppMoves.includes("Ceaseless Edge")) {
        spikesAtk = await checkbox({
            message: 'Please select the list of total layers of spikes that are on your side of the field:',
            choices: [
                { name: 'None', value: 0, checked: true },
                { name: 'One', value: 1 },
                { name: 'Two', value: 2 },
                { name: 'Three', value: 3 },
            ],
        });
    }

    var spikesDef = [0];
    if (userMoves.includes("Spikes") || userMoves.includes("Ceaseless Edge")) {
        spikesDef = await checkbox({
            message: 'Please select the list of total layers of spikes that are on the oppositions side of the field:',
            choices: [
                { name: 'None', value: 0, checked: true },
                { name: 'One', value: 1 },
                { name: 'Two', value: 2 },
                { name: 'Three', value: 3 },
            ],
        });
    }

    var reflectAtk = [undefined];
    if (userMoves.includes("Reflect")) {
        reflectAtk = await checkbox({
            message: 'Please select the list of Reflect options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var reflectDef = [undefined];
    if (oppMoves.includes("Reflect")) {
        reflectDef = await checkbox({
            message: 'Please select the list of Reflect options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var lightScreenAtk = [undefined];
    if (userMoves.includes("Light Screen")) {
        lightScreenAtk = await checkbox({
            message: 'Please select the list of Light Screen options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var lightScreenDef = [undefined];
    if (oppMoves.includes("Light Screen")) {
        lightScreenDef = await checkbox({
            message: 'Please select the list of Light Screen options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var seedAtk = [undefined];
    if (oppMoves.includes("Leach Seed")) {
        seedAtk = await checkbox({
            message: 'Please select the list of Leach Seed options you want to add calcs for that is damaging your team:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var seedDef = [undefined];
    if (userMoves.includes("Leach Seed")) {
        seedDef = await checkbox({
            message: 'Please select the list of Leach Seed options you want to add calcs for that is damaging the opposition team:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var saltCureAtk = [undefined];
    if (userMoves.includes("Salt Cure")) {
        saltCureAtk = await checkbox({
            message: 'Please select the list of Salt Cure options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var saltCureDef = [undefined];
    if (oppMoves.includes("Salt Cure")) {
        saltCureDef = await checkbox({
            message: 'Please select the list of Salt Cure options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var tailwindAtk = [undefined];
    if (userMoves.includes("Tailwind")) {
        tailwindAtk = await checkbox({
            message: 'Please select the list of Tailwind options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var tailwindDef = [undefined];
    if (oppMoves.includes("Tailwind")) {
        tailwindDef = await checkbox({
            message: 'Please select the list of Tailwind options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var helpingHandAtk = [undefined];
    if (userMoves.includes("Helping Hand")) {
        helpingHandAtk = await checkbox({
            message: 'Please select the list of Helping Hand options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var helpingHandDef = [undefined];
    if (oppMoves.includes("Helping Hand")) {
        helpingHandDef = await checkbox({
            message: 'Please select the list of Helping Hand options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var flowerGiftAtk = [undefined];
    if (userAbilities.includes("Flower Gift")) {
        flowerGiftAtk = await checkbox({
            message: 'Please select the list of Flower Gift options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var flowerGiftDef = [undefined];
    if (oppAbilities.includes("Flower Gift")) {
        flowerGiftDef = await checkbox({
            message: 'Please select the list of Flower Gift options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var friendGuardAtk = [undefined];
    if (userAbilities.includes("Friend Guard")) {
        friendGuardAtk = await checkbox({
            message: 'Please select the list of Friend Guard options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var friendGuardDef = [undefined];
    if (oppAbilities.includes("Friend Guard")) {
        friendGuardDef = await checkbox({
            message: 'Please select the list of Friend Guard options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var auroraVeilAtk = [undefined];
    if (userMoves.includes("Aurora Veil")) {
        auroraVeilAtk = await checkbox({
            message: 'Please select the list of Aurora Veil options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var auroraVeilDef = [undefined];
    if (oppMoves.includes("Aurora Veil")) {
        auroraVeilDef = await checkbox({
            message: 'Please select the list of Aurora Veil options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var batteryAtk = [undefined];
    if (userAbilities.includes("Battery")) {
        batteryAtk = await checkbox({
            message: 'Please select the list of Battery options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var batteryDef = [undefined];
    if (oppAbilities.includes("Battery")) {
        batteryDef = await checkbox({
            message: 'Please select the list of Battery options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var powerSpotAtk = [undefined];
    if (userAbilities.includes("Power Spot")) {
        powerSpotAtk = await checkbox({
            message: 'Please select the list of Power Spot options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var powerSpotDef = [undefined];
    if (oppAbilities.includes("Power Spot")) {
        powerSpotDef = await checkbox({
            message: 'Please select the list of Power Spot options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var steelySpiritAtk = [undefined];
    if (userAbilities.includes("Steely Spirit")) {
        steelySpiritAtk = await checkbox({
            message: 'Please select the list of Steely Spirit options you want to add calcs for on your side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    var steelySpiritDef = [undefined];
    if (oppAbilities.includes("Steely Spirit")) {
        steelySpiritDef = await checkbox({
            message: 'Please select the list of Steely Spirit options you want to add calcs for on the opponents side:',
            choices: [
                { name: 'No', value: undefined, checked: true },
                { name: 'Yes', value: 'yes' },
            ],
        });
    }

    weatherOptions.forEach((a) => {
        terrainOptions.forEach((b) => {
            magicRoom.forEach((c) => {
                wonderRoom.forEach((d) => {
                    gravity.forEach((e) => {
                        auraBreak.forEach((f) => {
                            fairyAura.forEach((g) => {
                                darkAura.forEach((h) => {
                                    beadsRuin.forEach((i) => {
                                        swordRuin.forEach((j) => {
                                            tabletRuin.forEach((k) => {
                                                vesselRuin.forEach((l) => {
                                                    spikesAtk.forEach((m) => {
                                                        spikesDef.forEach((n) => {
                                                            reflectAtk.forEach((o) => {
                                                                reflectDef.forEach((p) => {
                                                                    lightScreenAtk.forEach((q) => {
                                                                        lightScreenDef.forEach((r) => {
                                                                            seedAtk.forEach((s) => {
                                                                                seedDef.forEach((t) => {
                                                                                    saltCureAtk.forEach((u) => {
                                                                                        saltCureDef.forEach((v) => {
                                                                                            tailwindAtk.forEach((w) => {
                                                                                                tailwindDef.forEach((x) => {
                                                                                                    helpingHandAtk.forEach((y) => {
                                                                                                        helpingHandDef.forEach((z) => {
                                                                                                            flowerGiftAtk.forEach((aa) => {
                                                                                                                flowerGiftDef.forEach((ab) => {
                                                                                                                    friendGuardAtk.forEach((ac) => {
                                                                                                                        friendGuardDef.forEach((ad) => {
                                                                                                                            auroraVeilAtk.forEach((ae) => {
                                                                                                                                auroraVeilDef.forEach((af) => {
                                                                                                                                    batteryAtk.forEach((ag) => {
                                                                                                                                        batteryDef.forEach((ah) => {
                                                                                                                                            powerSpotAtk.forEach((ai) => {
                                                                                                                                                powerSpotDef.forEach((aj) => {
                                                                                                                                                    steelySpiritAtk.forEach((ak) => {
                                                                                                                                                        steelySpiritDef.forEach((al) => {
                                                                                                                                                            var attackSide = new Side ({
                                                                                                                                                                spikes: m,
                                                                                                                                                                isReflect: o,
                                                                                                                                                                isLightScreen: q,
                                                                                                                                                                isSeeded: s,
                                                                                                                                                                isSaltCured: u,
                                                                                                                                                                isTailwind: w,
                                                                                                                                                                isHelpingHand: y,
                                                                                                                                                                isFlowerGift: aa,
                                                                                                                                                                isFriendGuard: ac,
                                                                                                                                                                isAuroraVeil: ae,
                                                                                                                                                                isBattery: ag,
                                                                                                                                                                isPowerSpot: ai,
                                                                                                                                                                isSteelySpirit: ak,
                                                                                                                                                            });
                                                                                                                                                            var defendSide = new Side ({
                                                                                                                                                                spikes: n,
                                                                                                                                                                isReflect: p,
                                                                                                                                                                isLightScreen: r,
                                                                                                                                                                isSeeded: t,
                                                                                                                                                                isSaltCured: v,
                                                                                                                                                                isTailwind: x,
                                                                                                                                                                isHelpingHand: z,
                                                                                                                                                                isFlowerGift: ab,
                                                                                                                                                                isFriendGuard: ad,
                                                                                                                                                                isAuroraVeil: af,
                                                                                                                                                                isBattery: ah,
                                                                                                                                                                isPowerSpot: aj,
                                                                                                                                                                isSteelySpirit: al,
                                                                                                                                                            });
                                                                                                                                                            var field = new Field(
                                                                                                                                                                { 
                                                                                                                                                                    gameType: 'Doubles',
                                                                                                                                                                    weather: a,
                                                                                                                                                                    terrain: b,
                                                                                                                                                                    isMagicRoom: c,
                                                                                                                                                                    isWonderRoom: d,
                                                                                                                                                                    isGravity: e,
                                                                                                                                                                    isAuraBreak: f,
                                                                                                                                                                    isFairyAura: g,
                                                                                                                                                                    isDarkAura: h,
                                                                                                                                                                    isBeadsOfRuin: i,
                                                                                                                                                                    isSwordOfRuin: j,
                                                                                                                                                                    isTabletsOfRuin: k,
                                                                                                                                                                    isVesselOfRuin: l,
                                                                                                                                                                    attackerSide: attackSide,
                                                                                                                                                                    defenderSide: defendSide,
                                                                                                                                                                }
                                                                                                                                                            );
                                                                                                                                                            fieldArray.push(field);
                                                                                                                                                        })
                                                                                                                                                    })
                                                                                                                                                })
                                                                                                                                            })
                                                                                                                                        })
                                                                                                                                    })
                                                                                                                                })
                                                                                                                            })
                                                                                                                        })
                                                                                                                    })
                                                                                                                })
                                                                                                            })
                                                                                                        })
                                                                                                    })
                                                                                                })
                                                                                            })
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })

    return fieldArray;
}