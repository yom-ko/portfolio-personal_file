const arrow = document.querySelector('.arrow');
const clickZone = document.querySelector('.info-js__clickzone');

// Add event listener to the clickable zone just above the scale
clickZone.addEventListener(
  'click',
  (ev) => {
    const rect = clickZone.getBoundingClientRect();
    const clickCoordX = Math.round(ev.clientX - rect.left);
    let x;

    // Determine in which half of each interval a click happened
    if (clickCoordX <= 75) {
      x = -10;
    } else if (clickCoordX > 75 && clickCoordX <= 264) {
      x = 139;
    } else if (clickCoordX > 264 && clickCoordX <= 575) {
      x = 367;
    } else {
      x = 755;
    }

    // Move arrow pointer
    arrow.style.left = x;
  },
  false,
);
