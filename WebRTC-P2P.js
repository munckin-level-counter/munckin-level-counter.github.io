class WebRTCp2p {
  constructor(displayOffer, getAnswer, getOffer, displayAnswer) {
    this.peers = new Set();

    this.displayOffer = displayOffer;
    this.getAnswer = getAnswer;
    this.getOffer = getOffer;
    this.displayAnswer = displayAnswer;
  }

  async invite() {
    const peer = new RTCPeerConnection({iceServers: [{urls: []}]});
    peer.channels = new Map();

    let state = 0;

    async function handshake() {
      if (state > 0 || state < 6) return;

      state = 3; await this.displayOffer(peer.localDescription);
      state = 4; const answer = await this.getAnswer();
      state = 5; await peer.setRemoteDescription(answer);
      state = 6; console.log('OK all set');
    }

    peer.addEventListener('datachannel', event => peer.channels.set(event.channel.label, event.channel));
    peer.channels.set('data', peer.createDataChannel('data'));

    peer.addEventListener('icecandidate', e => e.candidate || handshake().catch(console.error));

    state = 1; const offer = await peer.createOffer();
    state = 2; await peer.setLocalDescription(offer);

    await handshake();

    this.peers.add(peer);

    return peer;
  }

  async join() {
    const peer = new RTCPeerConnection({iceServers: [{urls: []}]});
    peer.channels = new Map();

    let state = 0;

    async function handshake() {
      if (state > 0 || state < 6) return;

      state = 5; await this.displayAnswer(peer.localDescription);
      state = 6; console.log('OK all set');
    }

    peer.addEventListener('datachannel', event => peer.channels.set(event.channel.label, event.channel));

    peer.addEventListener('icecandidate', e => e.candidate || handshake().catch(console.error));

    state = 1; const offer = await this.getOffer();
    state = 2; await peer.setRemoteDescription(offer);
    state = 3; const answer = await peer.createAnswer();
    state = 4; await peer.setLocalDescription(answer);

    await handshake();

    this.peers.add(peer);

    return peer;
  }

  /**
   * broadcast message to all peers
   */
  send(message, channel = 'data') {
    this.peers.forEach(peer => peer.channels.get(channel).send(message))
  }
}
