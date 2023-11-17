export function toBufferBE(
  num: bigint | number,
  size: number | undefined = undefined,
) {
  const hex = num.toString(16);
  const byteLength = Math.max(size || 0, Math.ceil(hex.length / 2));
  return Buffer.from(hex.padStart(byteLength * 2, '0'), 'hex');
}

export function toBufferLE(
  num: bigint | number,
  size: number | undefined = undefined,
) {
  return toBufferBE(num, size).reverse();
}

export function getTimestamp() {
  return Math.trunc(Date.now() / 1000);
}
