<script lang="ts">
  import { onMount } from 'svelte';

  import * as P2P from '../services/P2P';
  import { eventPayload } from '../services/store';

  let cord = { x: 0, y: 0 };
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  onMount(() => {
    if (!canvas) return;

    ctx = canvas.getContext('2d');
  });

  function reposition(event: MouseEvent) {
    cord = {
      x: event.offsetX,
      y: event.offsetY,
    };
  }

  function startDrawing(event: MouseEvent) {
    P2P.sendData(JSON.stringify({ event: 'started' }));
    canvas.addEventListener('mousemove', draw);
    reposition(event);
  }

  function draw(event: MouseEvent) {
    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = '#000000';

    const strokeParams = {
      event: 'draw',
      data: {
        to: null,
        from: [cord.x, cord.y],
      },
    };

    ctx.moveTo(cord.x, cord.y);
    reposition(event);
    ctx.lineTo(cord.x, cord.y);
    ctx.stroke();

    strokeParams.data.to = [cord.x, cord.y];
    P2P.sendData(JSON.stringify(strokeParams));
  }

  function stopDrawing() {
    P2P.sendData(JSON.stringify({ event: 'finished' }));
    canvas.removeEventListener('mousemove', draw);
  }

  eventPayload.subscribe((value) => {
    if (!(ctx && value.data)) return;

    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';

    ctx.moveTo(...value.data.from);
    ctx.lineTo(...value.data.to);
    ctx.stroke();
  });
</script>

<canvas
  width="600"
  height="600"
  bind:this={canvas}
  on:mouseup={stopDrawing}
  on:mousedown={startDrawing}
/>

<style>
  canvas {
    border: 5px solid #ff3e00;
  }
</style>
