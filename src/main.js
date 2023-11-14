import {gsap} from "gsap"
import {ScrollTrigger} from "gsap/ScrollTrigger"
import barba from "@barba/core";
import Lenis from '@studio-freight/lenis'

gsap.registerPlugin(ScrollTrigger);

class PageTransition {
  constructor() {
    this.footer = document.querySelector(".section_sticky-footer");
    this.ScrollTrigger = ScrollTrigger;
  }
  splitText(element) {
    if (!element) {
      console.error(`Element not found`);
      return;
    }

    element.style.whiteSpace = "pre-wrap";
    element.style.overflow = "hidden";

    // split each letter into a span
    const splitText = element.innerText.split("");
    element.innerHTML = "";
    splitText.forEach((letter) => {
      const span = document.createElement("span");
      span.innerText = letter;
      // span.style.display = "inline-block";
      element.appendChild(span);
    });

    return element;
  }
  animationLeave(current) {
    const tl = gsap.timeline();
    tl.to(
      current.querySelectorAll([
        ".header .language_list .language_item",
        ".header .language_list .language_item a",
        ".header .logo",
        ".header .nav_btn-text span",
        ".header .vertical-separator",
        ".header .nav-btn",
      ]),
      {
        y: -50,
        opacity: 0,
        ease: "power2.inOut",
        // duration: 0,
        // clearProps: "all",
      }
    ).to(
      gsap.utils.toArray(
        current.querySelectorAll([
          ".hero_component .hero_header h1 span",
          ".hero_component .hero_footer a",
        ])
      ),
      {
        y: -50,
        duration: 0,
        ease: "power2.inOut",
        opacity: 0,
        // clearProps: "all",
      }
    )
    return tl;
  }
  animationEnter(next) {
    const tl = gsap.timeline();
    this.splitText(next.querySelector(".hero_component .hero_header h1"));
    next.querySelectorAll(".header .nav_btn-text").forEach((el) => {
      this.splitText(el);
    });
    tl.from(
      next.querySelectorAll([
        ".header .language_list .language_item",
        ".header .language_list .language_item a",
        ".header .logo",
        ".header .nav_btn-text span",
        ".header .vertical-separator",
        ".header .nav-btn",
      ]),
      {
        top: -50,
        duration: 1,
        opacity: 0,
        stagger: 0.05,
        ease: "power2.inOut",
        // clearProps: "all",
      }
    ).from(
      gsap.utils.toArray(
        next.querySelectorAll([
          ".hero_component .hero_header h1 span",
          ".hero_component .hero_footer a",
        ])
      ),
      {
        top: -100,
        duration: 1,
        stagger: 0.05,
        ease: "power2.inOut",
        // clearProps: "all",
      },
      "-=1.5"
    );
    return tl;
  }
  barbaInit() {
    barba.hooks.after((data) => {
      if (this.lenis) {
        this.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
      this.footer = document.querySelector(".section_sticky-footer");
      ScrollTrigger.getAll().forEach((t) => t.kill());
      this.init();
      ScrollTrigger.refresh();
    });
    barba.init({
      debug: true,
      logLevel: "error",
      transitions: [
        {
          once: ({ next }) => {
            console.log("once created test");
            this.animationEnter(next.container);
          },
          leave: ({ current }) => {
            console.log("leave with ", current);
            return this.animationLeave(current.container);
          },
          beforeEnter: ({ current }) => {
            console.log("before enter with ", current);
            current.container.style.opacity = 0;
          },
          enter: ({ next }) => {
            console.log("enter with ", next);
            this.animationEnter(next.container);
          },
        },
      ],
    });
  }
  getScrollPosition(id) {
    const st = ScrollTrigger.create({ trigger: id });
    const stEnd = st.top;
    st.kill();
    return stEnd;
  }
  footerAnimation() {
    const tl = gsap.timeline();
    const movingText = this.footer.querySelectorAll(["header h1", "header p"]);
    movingText.forEach((el) => {
      this.splitText(el);
    });
    tl.to(this.footer, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      ease: "expo.inOut",
      duration: 1,
      scrollTrigger: {
        trigger: this.footer,
        scrub: true,
        start: "top 70%",
        end: "50% 70%",
        pin: false,
        markers: false, 
      },
    });
  }
  initLenis() {
    if (!this.lenis) {
        this.lenis = new Lenis();

        // Use Gsap ScrollTrigger.update on Lenis scroll event
        this.lenis.on('scroll', ScrollTrigger.update);

        // Use Gsap ticker to call lenis.raf with smoothed time
        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });

        // Set up lag smoothing for Gsap ticker
        gsap.ticker.lagSmoothing(0);

        // Start the animation loop using requestAnimationFrame
        
        requestAnimationFrame(this.raf.bind(this));
    }
  } 
  raf(time) {
    this.lenis.raf(time);
    requestAnimationFrame(this.raf.bind(this));
  }
  moveText() {
    const textTl = gsap.timeline();
    const movingText = this.footer.querySelectorAll("header > *");
    movingText.forEach((el) => {
      this.splitText(el);
    });

    textTl
      .to(movingText[0].querySelectorAll("span"), {
        duration: 0.5,
        stagger: 0.01,
        top: movingText[0].offsetHeight,
        ease: "power2.inOut",
      })
      .to(
        movingText[1].querySelectorAll("span"),
        {
          duration: 0.5,
          stagger: 0.01,
          top: movingText[1].offsetHeight,
          ease: "power2.inOut",
          onComplete: () => {
            barba.go(this.footer.dataset.href);
          },
        },
        "-=.5"
      );
  }
  init() {
    this.footerAnimation();
    this.initLenis();
    const manager = new Hammer.Manager(this.footer);
    // Create a recognizer
    const Tap = new Hammer.Tap({
      taps: 1
    });
    
    // Add the recognizer to the manager
    manager.add(Tap);
    
    manager.on('tap', (e)=> {
        this.lenis.scrollTo(this.footer, {
          duration: 1,
        });
          this.moveText();
    
    });
  }
}

let page = new PageTransition();
page.init();
page.barbaInit();
