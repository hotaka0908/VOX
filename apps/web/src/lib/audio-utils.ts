export function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function resampleBuffer(buffer: Float32Array, inputRate: number, outputRate: number): Float32Array {
  if (outputRate === inputRate) {
    return buffer;
  }
  const ratio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const originalIndex = i * ratio;
    const index1 = Math.floor(originalIndex);
    const index2 = Math.min(index1 + 1, buffer.length - 1);
    const weight = originalIndex - index1;
    
    // Linear interpolation
    result[i] = buffer[index1] * (1 - weight) + buffer[index2] * weight;
  }
  return result;
}

export function convertInt16ToFloat32(int16Buffer: ArrayBuffer): Float32Array {
  const int16View = new Int16Array(int16Buffer);
  const float32 = new Float32Array(int16View.length);
  for (let i = 0; i < int16View.length; i++) {
    const int = int16View[i];
    float32[i] = int < 0 ? int / 0x8000 : int / 0x7fff;
  }
  return float32;
}
