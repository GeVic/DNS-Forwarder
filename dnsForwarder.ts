import * as dnsPacket from 'dns-packet';
import * as dgram from 'dgram';

const server = dgram.createSocket('udp4');
const fwd = dgram.createSocket('udp4');
let externalPort = 53;
let externalAddress = '1.1.1.1'; // upstream server to resolve DNS quesries

server.on('listening', () => {
  console.log('DNS Forwarder listening on port 5051');
});

server.on('message', (msg, rinfo) => {
  console.log(`Received query from ${rinfo.address}:${rinfo.port}`);

  // create forwarder server
  const forwarder = dgram.createSocket('udp4');

  // send the message to the external DNS server
  forwarder.send(msg, externalPort, externalAddress, (err) => {
    if (err) {
      console.error(err);
      forwarder.close();
    }
  });

  // listen for response from external DNS server
  forwarder.on('message', (response) => {
    console.log(`Received response from ${externalAddress}:${externalPort}`);
    server.send(response, rinfo.port, rinfo.address, (err) => {
      if (err) {
        console.error(err);
      }
      forwarder.close();
    });
  });
});

server.bind(5051, 'localhost');
