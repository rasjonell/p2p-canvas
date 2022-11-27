<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import * as P2P from '../services/P2P';
  import { CustomEventPayload, eventPayload } from '../services/store';

  let msg = '';
  let receivedMessage = '';

  let startEnabled = true;
  let sendEnabled = false;
  let closeEnabled = false;

  const onHangUp = () => {
    startEnabled = true;
    sendEnabled = false;
    closeEnabled = false;
  };

  onMount(() => {
    P2P.initiate({
      onHangUp,
      onDataReceived,
      onReady: (isReceiver: boolean) => {
        sendEnabled = isReceiver;
        closeEnabled = isReceiver;
        startEnabled = !isReceiver;
      },
    });
  });

  onDestroy(onHangUp);

  const onDataReceived: P2P.InitiatorOptions['onDataReceived'] = (data) => {
    receivedMessage = data as string;
    eventPayload.set(JSON.parse(data) as CustomEventPayload);
  };

  const start = () => {
    P2P.start({
      onReady: () => {
        sendEnabled = true;
        closeEnabled = true;
        startEnabled = false;
      },
      onDataReceived,
    });
  };

  const send = () => {
    P2P.sendData(msg);
    msg = '';
  };
</script>

<div>
  <button disabled={!startEnabled} on:click={start}>Initiate Connection</button>
  <button disabled={!closeEnabled} on:click={onHangUp}>Close</button>
  <!-- <div>
    <input bind:value={msg} type="text" placeholder="Message" />
    <button on:click={send} disabled={!sendEnabled}>Send</button>
  </div> -->
  <pre>{receivedMessage}</pre>
</div>
