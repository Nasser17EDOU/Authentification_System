/// <reference types="vite/client" />
/// <reference types="@emotion/react/types/css-prop" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}