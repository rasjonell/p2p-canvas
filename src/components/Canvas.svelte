<script lang="ts">
  import { onMount } from 'svelte';

  let cord = { x: 0, y: 0 };
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  onMount(() => {
    if (!canvas) return;

    ctx = canvas.getContext('2d');
  });

  function reposition(event: MouseEvent) {
    const boundingRect = canvas.getBoundingClientRect();

    console.log(event.clientX, event.offsetX);

    cord = {
      x: event.offsetX,
      y: event.offsetY,
    };
  }

  function startDrawing(event: MouseEvent) {
    canvas.addEventListener('mousemove', draw);
    reposition(event);
  }

  function draw(event: MouseEvent) {
    if (!ctx) return;

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.moveTo(cord.x, cord.y);
    reposition(event);
    ctx.lineTo(cord.x, cord.y);

    ctx.stroke();
  }

  function stopDrawing() {
    canvas.removeEventListener('mousemove', draw);
  }
</script>

<canvas
  width="800"
  height="600"
  bind:this={canvas}
  on:mouseup={stopDrawing}
  on:mousedown={startDrawing}
/>

<style>
  canvas {
    border: 5px solid black;
  }
</style>
