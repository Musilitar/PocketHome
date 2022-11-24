<script lang="ts">
    import { Save, parseSave } from '../logic/save'

    let save: Save

    function onDrop(event: DragEvent & { currentTarget: EventTarget & HTMLLabelElement }): void {
        readSave(event.dataTransfer.files[0])
    }

    function onChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }): void {
        readSave(event.currentTarget.files[0])
    }

    function readSave(file: File): void {
        const reader = new FileReader()
        reader.onload = (event) => {
            save = parseSave(event.target.result as string, file.size)
        }
        reader.readAsBinaryString(file)
    }
</script>

<label
    for="saveInput"
    on:drop|preventDefault|stopPropagation={onDrop}
    on:dragenter|preventDefault|stopPropagation={() => {}}
    on:dragover|preventDefault|stopPropagation={() => {}}>SELECT OR DROP SAVE</label>
<input id="saveInput" type="file" accept=".sav" on:change={onChange} />

{#if save !== undefined}
    <ul>
        <li>
            <p><i>Game</i></p>
            <p>{save.game.code}--{save.game.version}</p>
        </li>
        <li>
            <p><i>Team</i></p>
            <ol>
                {#each save.team as pokemon}
                    <li>{pokemon.species} - {pokemon.name}</li>
                {/each}
            </ol>
        </li>
        <li>
            <p><i>Boxes</i></p>
            <ol>
                {#each save.boxes as box}
                    <li>
                        <p><i>{box.name}</i></p>
                        <ol>
                            {#each box.pokemon as pokemon}
                                <li>{pokemon.species} - {pokemon.name}</li>
                            {/each}
                        </ol>
                    </li>
                {/each}
            </ol>
        </li>
    </ul>
{/if}

<style>
    label {
        padding: 20px;
        border: 2px solid var(--yellow);
        border-radius: 8px;
    }

    input {
        opacity: 0;
    }

    ul > li:nth-child(n + 2) {
        margin-top: 20px;
    }

    ol > li {
        margin-left: 20px;
    }
</style>
