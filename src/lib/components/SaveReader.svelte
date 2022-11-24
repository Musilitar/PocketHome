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
    <p>Game = {save.game.code}--{save.game.version}</p>
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
</style>
