// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Mobile navbar toggle (just a small demo)
  const toggleNav = () => {
    const nav = document.querySelector("nav");
    nav.style.display = nav.style.display === "block" ? "flex" : "block";
  };

  // Contact form submit (prevent default + show alert)
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
