const card = document.querySelector(".js-cardImage");
const cardContainer = document.querySelector(".js-card");

cardContainer.addEventListener("mousemove", (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * -30;
  const rotateY = ((x - centerX) / centerX) * 30;

  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

cardContainer.addEventListener("mouseleave", () => {
  card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
});
