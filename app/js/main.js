const arrow = document.querySelector('.arrow');
const clickZone = document.querySelector('.info-js__clickzone');

clickZone.addEventListener(
  'click',
  (ev) => {
    const rect = clickZone.getBoundingClientRect();
    const xCoord = Math.round(ev.clientX - rect.left);

    let x = 0;

    if (xCoord <= 75) {
      x = -10;
    } else if (xCoord > 75 && xCoord <= 264) {
      x = 139;
    } else if (xCoord > 264 && xCoord <= 575) {
      x = 367;
    } else {
      x = 755;
    }

    arrow.style.left = x;
  },
  false,
);
