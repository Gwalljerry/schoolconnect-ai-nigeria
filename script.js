// script.js
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navList = document.querySelector("nav ul");

  if (hamburger && navList) {
    hamburger.addEventListener("click", () => {
      navList.classList.toggle("active");
    });
  }

  // Contact form (same as before)
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      if (name && email) {
        alert("Thank you! We'll get back to you soon.");
        form.reset();
      } else {
        alert("Please fill in all required fields.");
      }
    });
  }
});
