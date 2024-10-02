<script>
    window.addEventListener('scroll', function() {
        const section = document.getElementById('sobre');
        const sectionPosition = section.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.5; // Cambiar el valor para ajustar la sensibilidad

        if (sectionPosition < screenPosition) {
            section.classList.add('appear'); // Añadir clase para mostrar la sección
        }
    });
</script>
