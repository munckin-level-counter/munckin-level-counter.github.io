class P2P {
  static get defaults() {
    return {
      displayOffer: P2P.defaultDisplayOffer,
      getOffer: P2P.defaultGetOffer,
      displayAnswer: P2P.defaultDisplayOffer,
      getAnswer: P2P.defaultGetOffer,
    }
  }

  static get defaultDisplayOffer() {
    return description => alert(JSON.stringify(description));
  }

  static get defaultGetOffer() {
    const offer = prompt('offer');

    return new RTCSessionDescription(JSON.parse(offer));
  }

  constructor({ displayOffer=P2P.defaultDisplayOffer, getAnswer=P2P.defaultGetOffer,
                getOffer=P2P.defaultGetOffer, displayAnswer=P2P.defaultDisplayOffer }={}) {
    this.peer = null;
    this.messagesHandlers = new Map();

    this.displayOffer = displayOffer;
    this.getAnswer = getAnswer;
    this.getOffer = getOffer;
    this.displayAnswer = displayAnswer;
  }

  /**
   * @returns {Promise<{peer: RTCPeerConnection, channel: RTCDataChannel}>}
   */
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

    this._handleChannel(peer);
    peer.channels.set('data', peer.createDataChannel('data'));

    peer.addEventListener('icecandidate', e => e.candidate || handshake().catch(console.error));

    state = 1; const offer = await peer.createOffer();
    state = 2; await peer.setLocalDescription(offer);

    await handshake();

    this.peer = peer;
    return {peer, channel: peer.channels.get('data')};
  }

  /**
   * @returns {Promise<{peer: RTCPeerConnection, channel: RTCDataChannel}>}
   */
  async join() {
    const peer = new RTCPeerConnection({iceServers: [{urls: []}]});
    peer.channels = new Map();

    let state = 0;

    async function handshake() {
      if (state > 0 || state < 6) return;

      state = 5; await this.displayAnswer(peer.localDescription);
      state = 6; console.log('OK all set');
    }

    this._handleChannel(peer);

    peer.addEventListener('icecandidate', e => e.candidate || handshake().catch(console.error));

    state = 1; const offer = await this.getOffer();
    state = 2; await peer.setRemoteDescription(offer);
    state = 3; const answer = await peer.createAnswer();
    state = 4; await peer.setLocalDescription(answer);

    await handshake();

    const channel = await new Promise(resolve => {
      if (peer.channels.has('data')) {
        return resolve(peer.channels.get('data'));
      }

      function checkDataChannel(event) {
        if (event.channel.label !== 'data') return;

        peer.removeEventListener('datachannel', checkDataChannel);
        return resolve(event.channel);
      }

      peer.addEventListener('datachannel', checkDataChannel);
    });

    this.peer = peer;
    return {peer, channel};
  }

  _handleChannel(peer) {
    peer.addEventListener('datachannel', event => peer.channels.set(event.channel.label, event.channel));

    peer.addEventListener('datachannel', event => {
      const channel = event.channel;

      peer.channels.set(channel.label, channel);
      channel.addEventListener('message', event => {
        const message = event.data;

        this.messagesHandlers.has(channel.label) || this.messagesHandlers.set(channel.label, []);
        for (const callback of this.messagesHandlers.get(channel.label)) {
          try {
            callback(message, {channel, event, peer});
          } catch (e) {
            console.error(e);
          }
        }
      });
    });
  }

  send(message, channel = 'data') {
    this.peer.channels.get(channel).send(message);
  }

  /**
   * register a message handler on channel
   * @param {string} channel
   * @param {function} callback - take on argument : message, {channel, peer, event}
   */
  receive(channel, callback) {
    this.messagesHandlers.has(channel) || this.messagesHandlers.set(channel, []);

    this.messagesHandlers.get(channel).push(callback);
  }
}
