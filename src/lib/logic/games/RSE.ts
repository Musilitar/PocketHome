import { Data } from '../Data'
export { RSE }

namespace RSE {
    const FRLG_VERSION = 'FireRed/LeafGrean'
    const RS_VERSION = 'Ruby/Sapphire'
    const E_VERSION = 'Emerald'

    const SECTION_SIZE = 0x1000
    const AMOUNT_OF_SECTIONS = 14
    const MAIN_SIZE = AMOUNT_OF_SECTIONS * SECTION_SIZE

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
        const currentBlockSectionMap = buildCurrentBlockSectionMap(data)
        const team = readTeam(data, version, currentBlockSectionMap)

        return new Save(version, team, [])
    }

    function determineVersion(data: string): string {
        for (let block = 0; block < 2; block++) {
            const firstSectionOffset = findValidFirstSectionOffset(data, block)

            if (firstSectionOffset !== undefined) {
                return findVersion(data.slice(firstSectionOffset))
            }
        }

        throw 'Failed to determine version'
    }

    function findValidFirstSectionOffset(data: string, block: number): number | undefined {
        const start = MAIN_SIZE * block
        const end = start + MAIN_SIZE
        const completeSectionCounter = 0b0011_1111_1111_1111
        let sectionCounter = 0
        let firstSectionOffset = 0

        for (let offset = start; offset < end; offset += SECTION_SIZE) {
            const section = data.slice(offset)
            const id = Data.readInteger(section, 0xff4, 2)
            sectionCounter |= 1 << id
            if (id === 0) firstSectionOffset = offset
        }

        if (sectionCounter == completeSectionCounter) return firstSectionOffset

        return undefined
    }

    function findVersion(data: string): string {
        const gameCode = Data.readInteger(data, 0xac, 4)
        switch (gameCode) {
            case 0:
                return RS_VERSION
            case 1:
                return FRLG_VERSION
            default:
                return E_VERSION
        }
    }

    function buildCurrentBlockSectionMap(data: string): Record<number, number> {
        const block0SectionMap = buildSectionMapForBlock(data, 0)
        const block1SectionMap = buildSectionMapForBlock(data, 1)
        const block0SaveIndex = findSaveIndex(data, block0SectionMap)
        const block1SaveIndex = findSaveIndex(data, block1SectionMap)

        return block0SaveIndex > block1SaveIndex ? block0SectionMap : block1SectionMap
    }

    function findSaveIndex(data: string, sectionMap: Record<number, number>): number | undefined {
        const lastSectionOffset = sectionMap[AMOUNT_OF_SECTIONS - 1]

        if (lastSectionOffset !== undefined) {
            return Data.readInteger(data.slice(lastSectionOffset), 0xffc, 4)
        }

        return undefined
    }

    function buildSectionMapForBlock(data: string, block: number): Record<number, number> {
        const start = MAIN_SIZE * block
        const end = start + MAIN_SIZE
        const map: Record<number, number> = {}

        for (let offset = start; offset < end; offset += SECTION_SIZE) {
            const section = data.slice(offset)
            const id = Data.readInteger(section, 0xff4, 2)

            map[id] = offset
        }

        return map
    }

    function readTeam(data: string, version: string, sectionMap: Record<number, number>): Pokemon[] {
        if (version === RS_VERSION || version === E_VERSION) {
            const teamOffset = sectionMap[1] + 0x238
            const teamSize = readTeamSize(data, version, sectionMap)

            return readPokemonList(data, teamOffset, teamSize)
        }

        throw 'Failed to read team'
    }

    function readTeamSize(data: string, version: string, sectionMap: Record<number, number>): number {
        if (version === RS_VERSION || version === E_VERSION) {
            const teamSizeOffset = sectionMap[1] + 0x234

            return Data.readInteger(data, teamSizeOffset, 4)
        }

        throw 'Failed to read team size'
    }

    function readPokemonList(data: string, offset: number, capacity: number): Pokemon[] {
        const pokemon: Pokemon[] = []

        return pokemon
    }
}
