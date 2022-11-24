<script lang="ts">
    import SaveReader from './lib/components/SaveReader.svelte'
</script>

<main>
    <SaveReader />
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        min-width: 100%;
        min-height: 100%;
        padding: 40px;
        background-color: var(--black);
    }
</style>
