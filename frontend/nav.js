document.addEventListener("DOMContentLoaded", function () {
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const nav = document.querySelector("nav");
    const body = document.body;

    if (mobileMenuToggle && nav) {
        const navLinks = nav.querySelectorAll("ul li a, .nav-links a");

        function toggleMenu() {
            const isOpen = nav.classList.toggle("menu-open");
            body.classList.toggle("menu-open", isOpen);
            mobileMenuToggle.setAttribute("aria-expanded", isOpen);
        }

        function closeMenu() {
            nav.classList.remove("menu-open");
            body.classList.remove("menu-open");
            mobileMenuToggle.setAttribute("aria-expanded", "false");
        }

        mobileMenuToggle.addEventListener("click", function (e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener("click", function (e) {
            if (nav.classList.contains("menu-open") && !nav.contains(e.target)) {
                closeMenu();
            }
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener("click", closeMenu);
        });
    }
});
