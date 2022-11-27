<script lang="ts">
  import Canvas from './components/Canvas.svelte';
  import Channel from './components/Channel.svelte';
</script>

<main>
  <h1>P2P Canvas</h1>
  <Channel />
  <div class="canvas-container">
    <Canvas />
  </div>
</main>

<style>
  main {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }

  h1 {
    font-size: 4em;
    font-weight: 100;
    color: #ff3e00;
    margin: 0.5em auto;
    text-transform: uppercase;
  }

  .canvas-container {
    object-fit: contain;
  }
</style>
