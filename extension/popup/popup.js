
const body = document.body;

document.getElementById('getStarted').addEventListener('click', function() {
    this.innerHTML = 'Loading...';
    this.style.backgroundColor = body.classList.contains('dark-mode') ? '#34495e' : '#a777e3';
    this.style.color = 'white';
    setTimeout(() => {
        this.innerHTML = 'Ready!';
        this.style.backgroundColor = '#4CAF50';
    }, 1500);
});