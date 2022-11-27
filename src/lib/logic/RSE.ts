import { Data } from './Data'
export { RSE }

namespace RSE {
    const SECTOR_SIZE = 0x1000
    const AMOUNT_OF_SECTORS = 14
    const MAIN_SIZE = AMOUNT_OF_SECTORS * SECTOR_SIZE

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

        return new Save(version, [], [])
    }

    function determineVersion(data: string): string {
        const count = data.length / Data.RSE_HALF_RAW_SIZE
        for (let slot = 0; slot < count; slot++) {
            // if (!SAV3.IsAllMainSectorsPresent(data, slot, out var smallOffset))
            //     continue;
            // // Detect RS/E/FRLG
            // return GetVersionG3SAV(data[smallOffset..]);
        }

        throw 'Failed to determine version'
    }

    function areAllMainSectorsPresent(data: string, slot: 0 | 1): boolean {
        const start = MAIN_SIZE * slot
        const end = start + MAIN_SIZE
        let bitTrack = 0
        let firstSectorOffset = 0
        for (let offset = start; offset < end; offset += SECTOR_SIZE) {
            const dataSection = data.slice(offset)
            const id = Data.readInteger(data, 0xff4, 2)
            bitTrack |= 1 << id
            if (id == 0) firstSectorOffset = offset
        }

        return bitTrack == 0b0011_1111_1111_1111
    }
}
