document.addEventListener("DOMContentLoaded", function () {

  function isEmpty(str) {
    if (str.trim() == "") return true;
    return false;
  }
  const scrollAnchors = new SmoothScroll('a[href*="#"]', {
    speed: 300
  });
  async function f() {
    return Promise.resolve(1);
  }
});

window.onload = () => {
  // document.querySelector("#preloader").classList.remove("active");
  const sectionId = window.location.hash;
  if (sectionId) {
    let V = 0.01;
    let w = window.pageYOffset, // производим прокрутку
      hash = sectionId.replace(/[^#]*(.*)/, "$1"), // к id элемента, к которому нужно перейти
      t = document.querySelector(`${sectionId}`).getBoundingClientRect().top, // отступ от окна браузера до id
      start = null;
    requestAnimationFrame(step); // подробнее про функцию анимации [developer.mozilla.org]
    function step(time) {
      if (start === null) start = time;
      let progress = time - start,
        r =
          t < 0
            ? Math.max(w - progress / V, w + t)
            : Math.min(w + progress / V, w + t);
      window.scrollTo(0, r);
      if (r != w + t) {
        requestAnimationFrame(step);
      } else {
        location.hash = hash; // URL с хэшем
      }
    }
  }
};
