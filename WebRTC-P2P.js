const CFG_CONNECTION = {
  iceServers: [
    {urls: ['stun:stun2.l.google.com:19302']},
    {urls: ['stun:stun.stunprotocol.org:3478']},
  ]
};

const peers = [];

function uid() {
  return Number(Math.random() * 100000000000000000).toString(36);
}

async function host({displayInvitation=console.log, provideResponse=Promise.reject(new Error('provideResponse not provided'))}={}) {
  const peer = new RTCPeerConnection(CFG_CONNECTION);
  window.peer = peer;

  const channel = peer.createDataChannel('default');
  const ping = peer.createDataChannel('ping');

  peer.channels = new Map([
    [channel.label, channel],
    [ping.label, ping],
  ]);

  ping.addEventListener('message', event => console.log('SUCCESS, connection established !'));

  channel.addEventListener('open', event => {
    console.log(`channel ${channel.label} is ready`, event)
  });

  // dispatch message to other peers
  channel.addEventListener('message', event => {
    console.log('Got :', event.data);

    peers.forEach(other => {
      if (other === peer) return;

      const otherChan = other.channels.get(channel.label);

      otherChan && otherChan.send(event.data);
    });
  });

  peer.addEventListener('icecandidate', event => {
    if (event.candidate) return;

    console.log('Invitation message :');
    console.log(JSON.stringify(peer.localDescription));
    
    Promise.resolve(displayInvitation(peer.localDescription))
      .then(confirmHandshake)
      .catch(console.error);
  });

  // start handshake
  const description = await peer.createOffer();
  await peer.setLocalDescription(description);

  async function confirmHandshake() {
    try {
      const answer = await provideResponse();
      await peer.setRemoteDescription(answer);

      peers.push(peer);

      ping.send('ping');
    } catch (error) {
      console.error(error);

      for (const channel of peer.channels.values()) {
        channel.close()
      }

      return peer.close();
    }
  }
}

async function join(offer, sendResponse) {
  const peer = new RTCPeerConnection(CFG_CONNECTION);
  window.peer = peer;
  peer.channels = new Map();

  peer.addEventListener('datachannel', event => {
    const channel = event.channel;
    peer.channels.set(channel.label, channel);

    switch (event.channel.label) {
      case 'default':
        channel.addEventListener('open', event => {
          console.log(`channel ${channel.label} is ready`, event)
        });

        // dispatch message to other peers
        channel.addEventListener('message', event => {
          console.log('Got :', event.data);

          peers.forEach(other => {
            if (other === peer) return;

            const otherChan = other.channels.get(channel.label);

            otherChan && otherChan.send(event.data);
          });
        });

        break;
      case 'ping':
        channel.addEventListener('message', event => {
          console.log('SUCCESS, connection established !');

          channel.send('pong');
        });
        break;
    }
  });

  peer.addEventListener('icecandidate', event => {
    if (event.candidate) return;

    console.log('Answer response :');
    console.log(JSON.stringify(peer.localDescription));
  
    sendResponse(peer.localDescription);
  });

  try {
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const description = await peer.createAnswer();
    await peer.setLocalDescription(description);

    peers.push(peer);
  } catch (error) {
    console.error(error);

    for (const channel of peer.channels.values()) {
      channel.close()
    }

    peer.close();
  }
}

function sendMessage(str) {
  console.log('You :', str);
  peers.forEach(peer => peer.channel.send(str));
}
