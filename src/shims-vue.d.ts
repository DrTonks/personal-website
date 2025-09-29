declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // Use conservative types to avoid eslint/type complaints in declaration file
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

// keep existing vanta decls if present
declare module 'vanta/dist/vanta.waves.min';

