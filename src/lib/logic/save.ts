import { Data } from './Data'
import { GSC } from './GSC'
import { RSE } from './RSE'

export { Save }

namespace Save {
    export function parseSave(data: string, size: number): GSC.Save | RSE.Save {
        if (Data.GSC_SIZES.includes(size)) {
            GSC.parseSave(data)
        }
        if (Data.RSE_SIZES.includes(size)) {
            RSE.parseSave(data)
        }

        throw 'Failed to determine game'
    }
}
