const CFG_CONNECTION = {iceServers: [{urls: ['stun:stun.l.google.com:19302']}]};

const peers = [];

function uid() {
  return Number(Math.random()*100000000000000000).toString(36);
}

async function host() {
  const peer = new RTCPeerConnection(CFG_CONNECTION);
  const channel = peer.createDataChannel('data-level-counter');
  const ping = peer.createDataChannel('ping');

  ping.addEventListener('message', event => console.log('SUCCESS, connection established !'));

  // attach channel on peer
  peer.channel = channel;

  channel.addEventListener('open', event => {
    console.log(`channel ${channel.label} is ready`, event)
  });

  // dispatch message to other peers
  channel.addEventListener('message', event => {
    console.log('Got :', event.data);

    peers.forEach(other => {
      if (other === peer) return;

      other.channel.send(event.data);
    });
  });

  peer.addEventListener('icecandidate', event => {
    if (event.candidate) return;

    console.log('Invitation message :');
    console.log(JSON.stringify(peer.localDescription));

    confirmHandshake().catch(console.error)
  });

  // start handshake
  const description = await peer.createOffer();
  await peer.setLocalDescription(description);

  async function confirmHandshake() {
    let answer = null;
    do {
      answer = prompt('Put answer response :')
    }
    while (!answer);

    try {
      await peer.setRemoteDescription(JSON.parse(answer));

      peers.push(peer);

      ping.send('ping');
    } catch (error) {
      console.error(error);

      ping.close();
      channel.close();
      peer.close();
    }
  }
}

async function join(offer) {
  const peer = new RTCPeerConnection(CFG_CONNECTION);
  let channel, ping;

  peer.addEventListener('datachannel', event => {
    switch (event.channel.label) {
      case 'data-level-counter':
        peer.channel = channel = event.channel;

        channel.addEventListener('open', event => {
          console.log(`channel ${channel.label} is ready`, event)
        });

        // dispatch message to other peers
        channel.addEventListener('message', event => {
          console.log('Got :', event.data);

          peers.forEach(other => {
            if (other === peer) return;

            other.channel && other.channel.send(event.data);
          });
        });

        break;
      case 'ping':
        ping = event.channel;
        ping.addEventListener('message', event => {
          console.log('SUCCESS, connection established !');

          ping.send('pong');
        });
        break;
    }
  });

  peer.addEventListener('icecandidate', event => {
    if (event.candidate) return;

    console.log('Answer response :');
    console.log(JSON.stringify(peer.localDescription));
  });

  try {
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const description = await peer.createAnswer();
    await peer.setLocalDescription(description);

    peers.push(peer);
  } catch (error) {
    console.error(error);

    ping && ping.close();
    channel && channel.close();
    peer.close();
  }
}

function sendMessage(str) {
  console.log('You :', str);
  peers.forEach(peer => peer.channel.send(str));
}