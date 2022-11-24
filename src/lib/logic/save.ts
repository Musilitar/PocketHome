export { Save, parseSave }

class Save {
    constructor(public game: Game) {}
}

class SaveSize {
    public static readonly RGBYRaw = 0x8000
    public static readonly RGBYBattery = 0x802c
    public static readonly GSCRawUniversal = 0x8000
    public static readonly GSCVirtualConsoleUniversal = 0x8010
    public static readonly GSCBatteryUniversal = 0x802c
    public static readonly GSCEmulatorUniversal = 0x8030
    public static readonly GSCRawJapanase = 0x10000
    public static readonly GSCVirtualConsoleJapanese = 0x10010
    public static readonly GSCBatteryJapanese = 0x1002c
    public static readonly GSCEmulatorJapanese = 0x10030
    public static readonly RSERaw = 0x20000
    public static readonly RSEEmulator = 0x20010
    public static readonly RSERawHalf = 0x10000
    public static readonly DPPtRaw = 0x80000
    public static readonly BWB2W2Raw = 0x80000
    public static readonly BW = 0x24000
    public static readonly B2W2 = 0x26000

    public static get RGBY(): number[] {
        return [this.RGBYRaw, this.RGBYBattery]
    }

    public static get GSC(): number[] {
        return [
            this.GSCRawUniversal,
            this.GSCVirtualConsoleUniversal,
            this.GSCBatteryUniversal,
            this.GSCEmulatorUniversal,
            this.GSCRawJapanase,
            this.GSCVirtualConsoleJapanese,
            this.GSCBatteryJapanese,
            this.GSCEmulatorJapanese,
        ]
    }

    public static get RSE(): number[] {
        return [this.RSERaw, this.RSEEmulator, this.RSERawHalf]
    }
}

class Game {
    constructor(public code: string, public version: string) {}
}

function parseSave(data: string, size: number): Save {
    const game = determineGame(data, size)

    return new Save(game)
}

function determineGame(data: string, size: number): Game {
    if (SaveSize.GSC.includes(size)) {
        if (isRGBYGSCPokemonList(data, 0x288a, 20) && isRGBYGSCPokemonList(data, 0x2d6c, 20)) return new Game('GS', 'U')
        if (isRGBYGSCPokemonList(data, 0x2865, 20) && isRGBYGSCPokemonList(data, 0x2d10, 20)) return new Game('C', 'U')
        if (isRGBYGSCPokemonList(data, 0x286a, 20) && isRGBYGSCPokemonList(data, 0x2d15, 20))
            return new Game('C', '251')
        if (isRGBYGSCPokemonList(data, 0x2d10, 30) && isRGBYGSCPokemonList(data, 0x283e, 30)) return new Game('GS', 'J')
        if (isRGBYGSCPokemonList(data, 0x2d10, 30) && isRGBYGSCPokemonList(data, 0x281a, 30)) return new Game('C', 'J')
    }

    throw 'Cannot determine game'
}

function isRGBYGSCPokemonList(data: string, offset: number, expectedLength: number) {
    const actualLength = data.charCodeAt(offset)
    const terminator = data.charCodeAt(offset + actualLength + 1)
    console.log(expectedLength, actualLength, terminator)
    return actualLength <= expectedLength && terminator == 0xff
}

function readText(data: String, offset: number, size: number): string {
    let output = ''

    for (let i = 0; i < size; i++) {
        let code = data.charCodeAt(offset + i)
        if (code === 0x50) break
        output += readCharacter(code)
    }

    return output
}

function readCharacter(hex: number): string {
    return characterMap[hex]
}

const characterMap: Record<number, string> = {
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
