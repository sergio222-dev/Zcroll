"use strict";

const bezier = require('bezier-easing');

class ZcrollFactory {
  constructor () {
    this.selectors = [];
    this.currentZcroller = null;
    this.bezier = [.87,0,.87,1.01];
    this.frames = 60;
  }

  createZcroller () {
    this.currentZcroller = new Zcroll();

    return this;
  }

  setBezier (bezier) {
    if ( ! this.currentZcroller) {
      console.log("No se creo un Zcroller previamente");
      return false;
    }
    this.bezier = bezier;
    return this;
  }

  setFrames (frames) {
    if ( ! this.currentZcroller) {
      console.log("No se creo un Zcroller previamente");
      return false;
    }
    this.frames = frames;
    return this;
  }

  applyZcroll (selector) {
    let nodeList = document.querySelectorAll(selector);
    if ( ! nodeList ) {
      console.log("ningun nodo encontrado en applyZcroll");
      return false;
    }

    //
    this.currentZcroller.bezier = this.bezier;
    this.currentZcroller.frames = this.frames;

    nodeList.forEach(n => {
      n.addEventListener('click', this.currentZcroller.smoothScroll());
    });

    this.selectors.push({selector: selector, Zcroller: this.currentZcroller});

    this.resetsProp();
  }

  resetsProp () {
    this.currentZcroller = null;
    this.frames = 60;
    this.bezier = [.87,0,.87,1.01];
  }

  destroyAll() {
    this.selectors.forEach(s => {
      let nodeList = document.querySelectorAll(s.selector);
      if ( ! nodeList) return;
      nodeList.forEach(n => {
        n.removeEventListener('click', s.Zcroller.smoothScroll());
      })
    });
    this.selectors = [];
  }

}

class Zcroll {
    constructor () {
      this.frames = null;
      this.bezier = null;
      this.easer = null;
    }

    smoothScroll () {

      let context = this;
      context.easer = bezier(context.bezier[0], context.bezier[1], context.bezier[2], context.bezier[3]);

      return function(e) {
        e.preventDefault();

        if ( ! e.target.attributes.href) return;

        let selector = e.target.attributes.href.value;

        let element = document.querySelector(selector);
        let offsetY = element.offsetTop;

        if (offsetY > document.documentElement.clientHeight) {
          console.log((offsetY - document.documentElement.clientHeight) + element.offsetHeight)
          offsetY = (offsetY - document.documentElement.clientHeight) + element.offsetHeight;
        }

        let currentPosition = window.scrollY;
        let offsetScroll = offsetY - currentPosition;

        let frame = 1 / context.frames;
        let route = [];

        for (let i = 0; i <= context.frames; i += 1) {
          let acuracy = (1/context.frames)*i;
          let p = context.easer(acuracy) * offsetScroll;
          p = Math.round(p);
          p = currentPosition + p;
          p = (p < 0) ? 0 : p;
          route.push(p);
        }

        window.requestAnimationFrame(context.animateScroll(route))
      }
    }

    animateScroll(routes) {
        let currentFrame = 0;
        return function animationProcess () {

          console.log(routes[currentFrame]);
          window.scrollTo(0,routes[currentFrame]);
          currentFrame++;

          if (currentFrame > routes.length-1)
            return

          window.requestAnimationFrame(animationProcess);

        }
    }

}

module.exports = new ZcrollFactory();