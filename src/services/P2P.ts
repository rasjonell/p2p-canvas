export interface InitiatorOptions {
  onHangUp: () => void;
  onReady: (isReceiver: boolean) => void;
  onDataReceived: (data: MessageEvent['data']) => void;
}

const channel = new BroadcastChannel('p2p');

let sendChannel: RTCDataChannel | undefined;
let receiveChannel: RTCDataChannel | undefined;
let peerConnection: RTCPeerConnection | undefined;

export function initiate({ onReady, onHangUp, onDataReceived }: InitiatorOptions) {
  channel.onmessage = (e: MessageEvent) => {
    switch (e.data.type) {
      case 'offer':
        handleOffer(e.data as RTCSessionDescriptionInit, onReady, onDataReceived);
        break;
      case 'answer':
        handleAnswer(e.data as RTCSessionDescriptionInit);
        break;
      case 'candidate':
        handleCandidate(e.data as RTCIceCandidate);
        break;
      case 'ready':
        if (peerConnection) {
          console.warn('Connection is already initialized.');
        }

        onReady(false);
        break;
      case 'bye':
        if (peerConnection) {
          hangUp(onHangUp);
        }
        break;
      default:
        console.warn('unhandled', e);
        break;
    }
  };

  channel.postMessage({
    type: 'ready',
  });
}

function createPeerConnection() {
  peerConnection = new RTCPeerConnection();
  peerConnection.onicecandidate = (e) => {
    const message = {
      candidate: null,
      type: 'candidate',
      sdpMid: undefined,
      sdpMLineIndex: undefined,
    };

    if (e.candidate) {
      message.sdpMid = e.candidate.sdpMid;
      message.candidate = e.candidate.candidate;
      message.sdpMLineIndex = e.candidate.sdpMLineIndex;
    }

    channel.postMessage(message);
  };
}

export async function start({ onReady, onDataReceived }: Omit<InitiatorOptions, 'onHangUp'>) {
  createPeerConnection();

  sendChannel = peerConnection.createDataChannel('p2p-canvas');

  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;
  sendChannel.onmessage = onSendChannelMessageCallback(onDataReceived);

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  channel.postMessage({
    type: 'offer',
    sdp: offer.sdp,
  });

  onReady(false);
}

export function close(onHangUp: () => void) {
  hangUp(onHangUp);
  channel.postMessage({ type: 'bye' });
}

function hangUp(onHangUp: () => void) {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = undefined;
  }

  sendChannel = undefined;
  receiveChannel = undefined;

  onHangUp();
}

async function handleOffer(
  offer: RTCSessionDescriptionInit,
  onReady: InitiatorOptions['onReady'],
  onDataReceived: InitiatorOptions['onDataReceived'],
) {
  if (peerConnection) {
    console.warn('Peer Connection already exists');
    return;
  }

  createPeerConnection();
  peerConnection.ondatachannel = receiveChannelCallback(onReady, onDataReceived);
  await peerConnection.setRemoteDescription(offer);

  const answer = await peerConnection.createAnswer();
  channel.postMessage({
    type: 'answer',
    sdp: answer.sdp,
  });
  await peerConnection.setLocalDescription(answer);
}

async function handleAnswer(answer: RTCSessionDescriptionInit) {
  if (!peerConnection) {
    console.warn('Peer Connection does not exist');
    return;
  }

  peerConnection.setRemoteDescription(answer);
}

async function handleCandidate(candidate: RTCIceCandidate) {
  if (!peerConnection) {
    console.warn('Peer Connection does not exist');
    return;
  }

  peerConnection.addIceCandidate(candidate.candidate ? candidate : null);
}

export async function sendData(data: string) {
  const channel = sendChannel || receiveChannel;

  channel.send(data);
}

function receiveChannelCallback(
  onReady: InitiatorOptions['onReady'],
  onDataReceived: InitiatorOptions['onDataReceived'],
) {
  return (event: RTCDataChannelEvent) => {
    receiveChannel = event.channel;
    receiveChannel.onopen = onReceiveChannelStateChange(onReady);
    receiveChannel.onclose = onReceiveChannelStateChange(onReady);
    receiveChannel.onmessage = onReceiveChannelMessageCallback(onDataReceived);
  };
}

function onSendChannelMessageCallback(onDataReceived: InitiatorOptions['onDataReceived']) {
  return (e: MessageEvent) => {
    onDataReceived(e.data);
  };
}

function onReceiveChannelMessageCallback(onDataReceived: InitiatorOptions['onDataReceived']) {
  return (e: MessageEvent) => {
    onDataReceived(e.data);
  };
}

function onSendChannelStateChange() {
  const readyState = sendChannel.readyState;
}

function onReceiveChannelStateChange(onReady: InitiatorOptions['onReady']) {
  return () => {
    const readyState = receiveChannel.readyState;
    console.log('Receive Channel state is:', readyState);

    if (readyState === 'open') {
      onReady(true);
    }
  };
}
