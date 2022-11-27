import { Data } from './Data'
import { GSC } from './games/GSC'
import { RSE } from './games/RSE'

export { Save }

namespace Save {
    export function parseSave(data: string, size: number): GSC.Save | RSE.Save {
        if (Data.GSC_SIZES.includes(size)) {
            return GSC.parseSave(data)
        }
        if (Data.RSE_SIZES.includes(size)) {
            return RSE.parseSave(data)
        }

        throw 'Failed to determine game'
    }
}
