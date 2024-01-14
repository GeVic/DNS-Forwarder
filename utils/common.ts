const calcExpiry = (ttl: number) => {
  // Calculate expiry time based on the TTL
  const now = Date.now();
  const ttlMilliseconds = ttl * 1000;
  const expiryTime = now + ttlMilliseconds;

  return expiryTime;
};

export { calcExpiry };
