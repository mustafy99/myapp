// script404.js
document.addEventListener('DOMContentLoaded', function() {
    // إنشاء النجوم
    const starsContainer = document.querySelector('.stars-container');
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = Math.random();
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        starsContainer.appendChild(star);
    }

    // إنشاء النيازك
    const meteorsContainer = document.querySelector('.meteors-container');
    for (let i = 0; i < 5; i++) {
        const meteor = document.createElement('div');
        meteor.className = 'meteor';
        meteor.style.left = `${Math.random() * 100}%`;
        meteor.style.top = `${Math.random() * 100}%`;
        meteor.style.animationDelay = `${Math.random() * 10}s`;
        meteorsContainer.appendChild(meteor);
    }

    // إضافة CSS للنجوم والنيازك
    const style = document.createElement('style');
    style.textContent = `
        .star {
            position: absolute;
            background-color: white;
            border-radius: 50%;
            animation: twinkle ${Math.random() * 3 + 2}s infinite alternate;
        }
        
        @keyframes twinkle {
            0% { opacity: 0.3; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.5); }
        }
        
        .meteor {
            position: absolute;
            width: 150px;
            height: 2px;
            background: linear-gradient(90deg, rgba(255,255,255,0.8), transparent);
            transform: rotate(-45deg);
            animation: meteor ${Math.random() * 5 + 3}s linear infinite;
        }
        
        @keyframes meteor {
            0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translateX(-500px) translateY(500px) rotate(-45deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});