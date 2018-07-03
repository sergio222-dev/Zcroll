# Zcroll
Scroll animado soportado en todos los navegadores (aparentemente).
## Instalacion:

### modulo npm

`npm install git+https://github.com/sanson222/Zcroll.git`

### web

`<script src="/lib/bundle.js"></script>`

#### este script usa:
* [bezier-easing](https://github.com/gre/bezier-easing)

## Como usarlo?
`
Zcroll.createZcroller().setBezier([.39,.78,.87,-0.34]).setFrames(60).applyZcroll('#toLink');
Zcroll.createZcroller().setBezier([0,0,1,1]).setFrames(60).applyZcroll('#me');`