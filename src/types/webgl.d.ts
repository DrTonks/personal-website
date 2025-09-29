interface OES_texture_half_float {
  HALF_FLOAT_OES: number;
}

declare interface WebGLRenderingContext {
  getExtension(name: 'OES_texture_half_float'): OES_texture_half_float | null;
  getExtension(name: 'OES_texture_half_float_linear'): unknown;
}

declare interface WebGL2RenderingContext {
  HALF_FLOAT: number;
}
