import * as dnsPacket from 'dns-packet';
import * as dgram from 'dgram';
import { calcExpiry } from './utils/common';

const server = dgram.createSocket('udp4');
let externalPort = 53;
let externalAddress = '1.1.1.1'; // upstream server to resolve DNS quesries

// caching the DNS responses
const cache = new Map<string, { expiry: number; data: any }>();

server.on('listening', () => {
  console.log('DNS Forwarder listening on port 5051');
});

server.on('message', (msg, rinfo) => {
  console.log(`Received query from ${rinfo.address}:${rinfo.port}`);

  // decoding the query
  const query = dnsPacket.decode(msg);
  const quesiton = query.questions![0];

  if (quesiton) {
    const cached = cache.get(quesiton.name);
    const now = Date.now();

    if (cached && cached.expiry > now) {
      console.log('Found cached response');
      const response = dnsPacket.encode({
        ...cached.data,
        id: query.id,
        questions: query.questions,
      });
      server.send(response, rinfo.port, rinfo.address, (err) => {
        if (err) {
          console.error(err);
        }
      });
      return;
    }
  }

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
    // decode the response
    const decodedResponse = dnsPacket.decode(response);
    const answers = decodedResponse.answers || [];

    // Cache each answer
    answers.forEach((answer) => {
      if ('ttl' in answer) {
        const expiry = calcExpiry(answer.ttl!);
        cache.set(answer.name, { expiry, data: decodedResponse });
      }
    });
    server.send(response, rinfo.port, rinfo.address, (err) => {
      if (err) {
        console.error(err);
      }
      forwarder.close();
    });
  });
});

server.bind(5055, '0.0.0.0');
