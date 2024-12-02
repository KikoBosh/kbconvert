declare module 'png-to-ico' {
  function pngToIco(input: Buffer): Promise<Buffer>;
  export = pngToIco;
} 