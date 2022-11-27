export { Data }

namespace Data {
    export const RGBY_RAW_SIZE = 0x8000
    export const RGBY_BATTERY_SIZE = 0x802c
    export const GSC_RAW_UNIVERSAL_SIZE = 0x8000
    export const GSC_VIRTUAL_CONSOLE_UNIVERSAL_SIZE = 0x8010
    export const GSC_BATTERY_UNIVERSAL_SIZE = 0x802c
    export const GSC_EMULATOR_UNIVERSAL_SIZE = 0x8030
    export const GSC_RAW_JAPANESE_SIZE = 0x10000
    export const GSC_VIRTUAL_CONSOLE_JAPANESE_SIZE = 0x10010
    export const GSC_BATTERY_JAPANESE_SIZE = 0x1002c
    export const GSC_EMULATOR_JAPANESE_SIZE = 0x10030
    export const RSE_RAW_SIZE = 0x20000
    export const RSE_EMULATOR_SIZE = 0x20010
    export const RSE_HALF_RAW_SIZE = 0x10000
    export const DPPT_RAW_SIZE = 0x80000
    export const BWB2W2_SIZE = 0x80000
    export const BW_SIZE = 0x24000
    export const B2WS2_SIZE = 0x26000

    export const RGBY_SIZES = [RGBY_RAW_SIZE, RGBY_BATTERY_SIZE]
    export const GSC_SIZES = [
        GSC_RAW_UNIVERSAL_SIZE,
        GSC_VIRTUAL_CONSOLE_UNIVERSAL_SIZE,
        GSC_BATTERY_UNIVERSAL_SIZE,
        GSC_EMULATOR_UNIVERSAL_SIZE,
        GSC_RAW_JAPANESE_SIZE,
        GSC_VIRTUAL_CONSOLE_JAPANESE_SIZE,
        GSC_BATTERY_JAPANESE_SIZE,
        GSC_EMULATOR_JAPANESE_SIZE,
    ]
    export const RSE_SIZES = [RSE_RAW_SIZE, RSE_EMULATOR_SIZE, RSE_HALF_RAW_SIZE]

    export function readInteger(data: string, offset: number, size: number) {
        let integer = 0

        for (let i = 0; i < size; i++) {
            integer += data.charCodeAt(offset + i)
        }

        return integer
    }

    export function readText(data: String, offset: number, size: number, characterMap: Record<number, string>): string {
        let output = ''

        for (let i = 0; i < size; i++) {
            let code = data.charCodeAt(offset + i)
            if (code === 0x50) break
            output += characterMap[code]
        }

        return output
    }
}
