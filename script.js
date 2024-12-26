// script.js
function confirmLogout() {
    const confirmed = confirm("ログアウトしますか?");
    if (confirmed) {
        window.location.href = "index.html";
    }
}

function toggleMenu(icon) {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
}

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // クラスを切り替えてアイコンの位置を変更
    themeToggle.classList.toggle('sun-active', isDarkMode);
}

// ページ読み込み時にダークモードの状態を復元
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // 初期アイコン設定
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.classList.toggle('sun-active', isDarkMode);
});

function searchPosts() {
    const input = document.getElementById('search').ariaValueMax.toLowerCase();
    const posts = document.querySelectorAll('.post');
    
    posts.forEach(post => {
        const title = post.querySelector('h3').innerText.toLowerCase();
        if(title.includes(input)) {
            post.style.display = ""; //該当する投稿は表示
        } else {
            post.style.display = 'none'; //それ以外は非表示
        }
    });
}

function searchPosts(criteria) {
    const postList = document.getElementById('post-list');
    const posts = Array.from(postList.getElementsByClassName('post'));
    
    posts.sort((a,b) => {
        // 日付と名前の並べ替え処理
        const dateA = new Date(a.querySelector('.post-details').innerText.split('|')[0]);
        const dateB = new Date(b.querySelector('.post-details').innerText.split('|')[0]);
        const nameA = a.querySelector('.post-details').innerText.split('|')[1].trim();
        const nameB = b.querySelector('.post-details').innerText.split('|')[1].trim();
        
        if (criteria === 'date') {
            return dateB - dateA; //新しいものが最初に来るようにする
        } else if (criteria === 'name') {
            return nameA.localCompare(nameB);
        }
    });
    
    //並べ替えたものをDOMに再度入れる
    posts.forEach(post => postList.appendChild(post));
}