// inter-ui ships CSS/font side-effects with no type declarations; under TS7's
// 'bundler' module resolution a bare side-effect import needs an ambient module.
declare module 'inter-ui'
