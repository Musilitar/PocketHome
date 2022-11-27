import { Data } from '../Data'
export { GSC }

namespace GSC {
    const GS_U_VERSION = 'Gold/Silver (U)'
    const C_U_VERSION = 'Crystal (U)'
    const C_251_VERSION = 'Crystal (251)'
    const GS_J_VERSION = 'Gold/Silver (J)'
    const C_J_VERSION = 'Crystal (J)'

    export class Save {
        constructor(public version: string, public team: Pokemon[], public boxes: Box[]) {}
    }

    export class Pokemon {
        constructor(
            public index: number,
            public species: string,
            public originalTrainer: string,
            public name: string,
        ) {}
    }

    export class Box {
        constructor(public name: string, public pokemon: Pokemon[]) {}
    }

    export function parseSave(data: string): Save {
        const version = determineVersion(data)
        const team = readTeam(data, version)
        const boxes = readBoxes(data, version)

        return new Save(version, team, boxes)
    }

    function determineVersion(data: string): string {
        if (isPokemonList(data, 0x288a, 20) && isPokemonList(data, 0x2d6c, 20)) return GS_U_VERSION
        if (isPokemonList(data, 0x2865, 20) && isPokemonList(data, 0x2d10, 20)) return C_U_VERSION
        if (isPokemonList(data, 0x286a, 20) && isPokemonList(data, 0x2d15, 20)) return C_251_VERSION
        if (isPokemonList(data, 0x2d10, 30) && isPokemonList(data, 0x283e, 30)) return GS_J_VERSION
        if (isPokemonList(data, 0x2d10, 30) && isPokemonList(data, 0x281a, 30)) return C_J_VERSION

        throw 'Failed to determine version'
    }

    function isPokemonList(data: string, offset: number, expectedLength: number): boolean {
        const actualLength = data.charCodeAt(offset)
        const terminator = data.charCodeAt(offset + actualLength + 1)

        return actualLength <= expectedLength && terminator == 0xff
    }

    function readTeam(data: string, version: string): Pokemon[] {
        if (version === C_251_VERSION) return readPokemonList(data, 0x286a, 6, 48, 10)

        throw 'Failed to read team'
    }

    function readBoxes(data: string, version: string): Box[] {
        const boxes: Box[] = []

        if (version === C_251_VERSION) {
            const boxOffsets = [
                0x4000, 0x4450, 0x48a0, 0x4cf0, 0x5140, 0x5590, 0x59e0, 0x6000, 0x6450, 0x68a0, 0x6cf0, 0x7140, 0x7590,
                0x79e0,
            ]

            for (let i = 0; i < boxOffsets.length; i++) {
                const pokemon = readPokemonList(data, boxOffsets[i], 20, 32, 10)

                boxes.push(new Box(`BOX ${i + 1}`, pokemon))
            }

            return boxes
        }

        throw 'Failed to read boxes'
    }

    function readPokemonList(
        data: string,
        offset: number,
        capacity: number,
        entrySize: number,
        textSize: number,
    ): Pokemon[] {
        const pokemon: Pokemon[] = []

        const countEndOffset = offset + 1
        const count = Data.readInteger(data, offset, 1)

        // Length = (1 byte per species * capacity) + 1 terminator byte
        const speciesEndOffset = countEndOffset + 1 * capacity + 1
        const speciesData = data.slice(countEndOffset, speciesEndOffset + 1)

        // Length = (entry size bytes per pokemon * capacity)
        const pokemonEndOffset = speciesEndOffset + entrySize * capacity
        const pokemonData = data.slice(speciesEndOffset, pokemonEndOffset + 1)

        // Length = ((text size bytes + 1 terminator byte) * capacity)
        const originalTrainersEndOffset = pokemonEndOffset + (textSize + 1) * capacity
        const originalTrainersData = data.slice(pokemonEndOffset, originalTrainersEndOffset + 1)

        // Length = ((text size bytes + 1 terminator byte) * capacity)
        const namesEndOffset = originalTrainersEndOffset + (textSize + 1) * capacity
        const namesData = data.slice(originalTrainersEndOffset, namesEndOffset + 1)

        for (let i = 0; i < count; i++) {
            const index = Data.readInteger(speciesData, i, 1)
            const species = POKEMON_MAP[index]
            const originalTrainer = Data.readText(originalTrainersData, i * 11, textSize, CHARACTER_MAP)
            const name = Data.readText(namesData, i * 11, textSize, CHARACTER_MAP)

            pokemon.push(new Pokemon(index, species, originalTrainer, name))
        }

        return pokemon
    }

    const CHARACTER_MAP: Record<number, string> = {
        0x50: '\0',
        0x7f: ' ',

        0x80: 'A',
        0x81: 'B',
        0x82: 'C',
        0x83: 'D',
        0x84: 'E',
        0x85: 'F',
        0x86: 'G',
        0x87: 'H',
        0x88: 'I',
        0x89: 'J',
        0x8a: 'K',
        0x8b: 'L',
        0x8c: 'M',
        0x8d: 'N',
        0x8e: 'O',
        0x8f: 'P',
        0x90: 'Q',
        0x91: 'R',
        0x92: 'S',
        0x93: 'T',
        0x94: 'U',
        0x95: 'V',
        0x96: 'W',
        0x97: 'X',
        0x98: 'Y',
        0x99: 'Z',
        0x9a: '(',
        0x9b: ')',
        0x9c: ':',
        0x9d: ';',
        0x9e: '[',
        0x9f: ']',

        0xa0: 'a',
        0xa1: 'b',
        0xa2: 'c',
        0xa3: 'd',
        0xa4: 'e',
        0xa5: 'f',
        0xa6: 'g',
        0xa7: 'h',
        0xa8: 'i',
        0xa9: 'j',
        0xaa: 'k',
        0xab: 'l',
        0xac: 'm',
        0xad: 'n',
        0xae: 'o',
        0xaf: 'p',
        0xb0: 'q',
        0xb1: 'r',
        0xb2: 's',
        0xb3: 't',
        0xb4: 'u',
        0xb5: 'v',
        0xb6: 'w',
        0xb7: 'x',
        0xb8: 'y',
        0xb9: 'z',

        0xe1: 'PK',
        0xe2: 'MN',
        0xe3: '-',
        0xe6: '?',
        0xe7: '!',
        0xe8: '.',

        0xf1: '*',
        0xf3: '/',
        0xf4: ',',

        0xf6: '0',
        0xf7: '1',
        0xf8: '2',
        0xf9: '3',
        0xfa: '4',
        0xfb: '5',
        0xfc: '6',
        0xfd: '7',
        0xfe: '8',
        0xff: '9',
    }

    const POKEMON_MAP: Record<number, string> = {
        0: '?????',
        1: 'Bulbasaur',
        2: 'Ivysaur',
        3: 'Venusaur',
        4: 'Charmander',
        5: 'Charmeleon',
        6: 'Charizard',
        7: 'Squirtle',
        8: 'Wartortle',
        9: 'Blastoise',
        10: 'Caterpie',
        11: 'Metapod',
        12: 'Butterfree',
        13: 'Weedle',
        14: 'Kakuna',
        15: 'Beedrill',
        16: 'Pidgey',
        17: 'Pidgeotto',
        18: 'Pidgeot',
        19: 'Rattata',
        20: 'Raticate',
        21: 'Spearow',
        22: 'Fearow',
        23: 'Ekans',
        24: 'Arbok',
        25: 'Pikachu',
        26: 'Raichu',
        27: 'Sandshrew',
        28: 'Sandslash',
        29: 'Nidoran♀',
        30: 'Nidorina',
        31: 'Nidoqueen',
        32: 'Nidoran♂',
        33: 'Nidorino',
        34: 'Nidoking',
        35: 'Clefairy',
        36: 'Clefable',
        37: 'Vulpix',
        38: 'Ninetales',
        39: 'Jigglypuff',
        40: 'Wigglytuff',
        41: 'Zubat',
        42: 'Golbat',
        43: 'Oddish',
        44: 'Gloom',
        45: 'Vileplume',
        46: 'Paras',
        47: 'Parasect',
        48: 'Venonat',
        49: 'Venomoth',
        50: 'Diglett',
        51: 'Dugtrio',
        52: 'Meowth',
        53: 'Persian',
        54: 'Psyduck',
        55: 'Golduck',
        56: 'Mankey',
        57: 'Primeape',
        58: 'Growlithe',
        59: 'Arcanine',
        60: 'Poliwag',
        61: 'Poliwhirl',
        62: 'Poliwrath',
        63: 'Abra',
        64: 'Kadabra',
        65: 'Alakazam',
        66: 'Machop',
        67: 'Machoke',
        68: 'Machamp',
        69: 'Bellsprout',
        70: 'Weepinbell',
        71: 'Victreebel',
        72: 'Tentacool',
        73: 'Tentacruel',
        74: 'Geodude',
        75: 'Graveler',
        76: 'Golem',
        77: 'Ponyta',
        78: 'Rapidash',
        79: 'Slowpoke',
        80: 'Slowbro',
        81: 'Magnemite',
        82: 'Magneton',
        83: "Farfetch'd",
        84: 'Doduo',
        85: 'Dodrio',
        86: 'Seel',
        87: 'Dewgong',
        88: 'Grimer',
        89: 'Muk',
        90: 'Shellder',
        91: 'Cloyster',
        92: 'Gastly',
        93: 'Haunter',
        94: 'Gengar',
        95: 'Onix',
        96: 'Drowzee',
        97: 'Hypno',
        98: 'Krabby',
        99: 'Kingler',
        100: 'Voltorb',
        101: 'Electrode',
        102: 'Exeggcute',
        103: 'Exeggutor',
        104: 'Cubone',
        105: 'Marowak',
        106: 'Hitmonlee',
        107: 'Hitmonchan',
        108: 'Lickitung',
        109: 'Koffing',
        110: 'Weezing',
        111: 'Rhyhorn',
        112: 'Rhydon',
        113: 'Chansey',
        114: 'Tangela',
        115: 'Kangaskhan',
        116: 'Horsea',
        117: 'Seadra',
        118: 'Goldeen',
        119: 'Seaking',
        120: 'Staryu',
        121: 'Starmie',
        122: 'Mr. Mime',
        123: 'Scyther',
        124: 'Jynx',
        125: 'Electabuzz',
        126: 'Magmar',
        127: 'Pinsi',
        128: 'Tauros',
        129: 'Magikarp',
        130: 'Gyarados',
        131: 'Lapras',
        132: 'Ditto',
        133: 'Eevee',
        134: 'Vaporeon',
        135: 'Jolteon',
        136: 'Flareon',
        137: 'Porygon',
        138: 'Omanyte',
        139: 'Omastar',
        140: 'Kabuto',
        141: 'Kabutops',
        142: 'Aerodactyl',
        143: 'Snorlax',
        144: 'Articuno',
        145: 'Zapdos',
        146: 'Moltres',
        147: 'Dratini',
        148: 'Dragonair',
        149: 'Dragonite',
        150: 'Mewtwo',
        151: 'Mew',
        152: 'Chikorita',
        153: 'Bayleef',
        154: 'Meganium',
        155: 'Cyndaquil',
        156: 'Quilava',
        157: 'Typhlosion',
        158: 'Totodile',
        159: 'Croconaw',
        160: 'Feraligatr',
        161: 'Sentret',
        162: 'Furret',
        163: 'Hoothoot',
        164: 'Noctowl',
        165: 'Ledyba',
        166: 'Ledian',
        167: 'Spinarak',
        168: 'Ariados',
        169: 'Crobat',
        170: 'Chinchou',
        171: 'Lanturn',
        172: 'Pichu',
        173: 'Cleffa',
        174: 'Igglybuff',
        175: 'Togepi',
        176: 'Togetic',
        177: 'Natu',
        178: 'Xatu',
        179: 'Mareep',
        180: 'Flaaffy',
        181: 'Ampharos',
        182: 'Bellossom',
        183: 'Marill',
        184: 'Azumarill',
        185: 'Sudowoodo',
        186: 'Politoed',
        187: 'Hoppip',
        188: 'Skiploom',
        189: 'Jumpluff',
        190: 'Aipom',
        191: 'Sunkern',
        192: 'Sunflora',
        193: 'Yanma',
        194: 'Wooper',
        195: 'Quagsire',
        196: 'Espeon',
        197: 'Umbreon',
        198: 'Murkrow',
        199: 'Slowking',
        200: 'Misdreavus',
        201: 'Unown',
        202: 'Wobbuffet',
        203: 'Girafarig',
        204: 'Pineco',
        205: 'Forretress',
        206: 'Dunsparce',
        207: 'Gligar',
        208: 'Steelix',
        209: 'Snubbull',
        210: 'Granbull',
        211: 'Qwilfish',
        212: 'Scizor',
        213: 'Shuckle',
        214: 'Heracross',
        215: 'Sneasel',
        216: 'Teddiursa',
        217: 'Ursaring',
        218: 'Slugma',
        219: 'Magcargo',
        220: 'Swinub',
        221: 'Piloswine',
        222: 'Corsola',
        223: 'Remoraid',
        224: 'Octillery',
        225: 'Delibird',
        226: 'Mantine',
        227: 'Skarmory',
        228: 'Houndour',
        229: 'Houndoom',
        230: 'Kingdra',
        231: 'Phanpy',
        232: 'Donphan',
        233: 'Porygon2',
        234: 'Stantler',
        235: 'Smeargle',
        236: 'Tyrogue',
        237: 'Hitmontop',
        238: 'Smoochum',
        239: 'Elekid',
        240: 'Magby',
        241: 'Miltank',
        242: 'Blissey',
        243: 'Raikou',
        244: 'Entei',
        245: 'Suicune',
        246: 'Larvitar',
        247: 'Pupitar',
        248: 'Tyranitar',
        249: 'Lugia',
        250: 'Ho-Oh',
        251: 'Celebi',
        252: '?????',
        253: 'Glitch Egg',
        254: '?????',
        255: '?????',
    }
}
