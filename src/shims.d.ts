// Ambient type declarations for static asset imports used by the runtime
// components (e.g. `import iconPng from '../public/icon.png'`). These imports
// are resolved to URLs by the consumer's Vite build; this shim only gives them
// a type so `vue-tsc` doesn't report "Cannot find module '*.png'".
//
// Not an entry point and imported by nothing, so it is not emitted to `dist`.

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}
