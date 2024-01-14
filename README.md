### DNS Forwarder

Simple implementation of DNS forwarder.

#### Features

- Forwards DNS `queries`` to upstream server
- Caches the `response` from upstream server and invdalidates the same based on `ttl`

#### How to run

- Build using Dockerfile
  - `docker build -t dns-forwarder .`
- Run the image [make sure to do the mapping with `UDP` and not `TCP`]
  - `docker run -p 5055:5055/udp -d dns-forwarder`
