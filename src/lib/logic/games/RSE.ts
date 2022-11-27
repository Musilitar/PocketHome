import { Data } from '../Data'
export { RSE }

namespace RSE {
    const FRLG_VERSION = 'FireRed/LeafGrean'
    const RS_VERSION = 'Ruby/Sapphire'
    const E_VERSION = 'Emerald'

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
        const count = Math.round(data.length / Data.RSE_HALF_RAW_SIZE)
        for (let slot = 0; slot < count; slot++) {
            const firstSectorOffset = findFirstSectorOffset(data, slot)

            if (firstSectorOffset !== undefined) {
                return findVersion(data.slice(firstSectorOffset))
            }
        }

        throw 'Failed to determine version'
    }

    function findFirstSectorOffset(data: string, slot: number): number | undefined {
        const start = MAIN_SIZE * slot
        const end = start + MAIN_SIZE
        const completeSectorCounter = 0b0011_1111_1111_1111
        let sectorCounter = 0
        let firstSectorOffset = 0

        for (let offset = start; offset < end; offset += SECTOR_SIZE) {
            const section = data.slice(offset)
            const a = 0xff4
            const id = Data.readInteger(section, 0xff4, 2)
            sectorCounter |= 1 << id
            if (id == 0) firstSectorOffset = offset
        }

        if (sectorCounter == completeSectorCounter) return firstSectorOffset

        return undefined
    }

    function findVersion(data: string): string {
        const marker = Data.readInteger(data, 0xac, 4)
        switch (marker) {
            case 1:
                return FRLG_VERSION
            case 0:
                return RS_VERSION
            default:
                // If any data exists after 0x890 it must be Emerald
                for (let i = 0x890; i < 0xf2c; i += 8) {
                    if (Data.readInteger(data, i, 8) !== 0) return E_VERSION
                }

                return RS_VERSION
        }
    }
}
