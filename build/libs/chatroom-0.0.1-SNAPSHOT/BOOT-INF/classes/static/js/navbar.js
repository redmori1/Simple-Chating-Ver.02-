document.addEventListener("DOMContentLoaded", function() {
    let isDarkModeSession = sessionStorage.getItem("isDarkMode");
    let isDarkMode = null;
    if (isDarkModeSession == null) {
        isDarkMode = false;
    }
    if (isDarkModeSession == 'true'){
        isDarkMode = true;
        ToggleDarkMode(isDarkMode);
    }else if(isDarkModeSession == 'false'){
        isDarkMode = false;
        ToggleDarkMode(isDarkMode);
    }
    document.getElementById("toggle-button").onclick = function() {
        isDarkMode = !isDarkMode; // 모드 토글
        sessionStorage.setItem("isDarkMode", isDarkMode);
        ToggleDarkMode(isDarkMode);
    };

    function ToggleDarkMode(isDarkMode){
        const navbar = document.getElementById("navbar");
        const togglebutton = document.getElementById("toggle-button");
        const title = document.getElementById("title");
        var mainbox = null
        if(document.getElementById("main-box")){
            mainbox = document.getElementById("main-box");
        }else{
            mainbox = document.getElementById("main-box2");
        }
        const dropdown = document.getElementById("dropdown");
        const element = document.getElementById("element");

        if (isDarkMode) {
            element.style.backgroundColor = "black";
            element.style.color = "white";
            navbar.classList.remove("navbar-light", "bg-light");
            navbar.classList.add("navbar-dark", "bg-dark");
            title.style.border = "0.5px solid white";
            mainbox.classList.add("bg-dark");
            mainbox.style.border = "0.5px solid white";
            dropdown.classList.add("bg-dark");
            dropdown.style.border = "0.5px solid white";
            togglebutton.innerText = "라이트 모드";
        } else {
            element.style.backgroundColor = "white";
            element.style.color= "black";
            navbar.classList.remove("navbar-dark", "bg-dark");
            navbar.classList.add("navbar-light", "bg-light");
            title.style.border = "0.5px solid black";
            mainbox.classList.remove("bg-dark");
            mainbox.style.border = "0.5px solid black";
            dropdown.classList.remove("bg-dark");
            dropdown.style.border = "0.5px solid gray";
            togglebutton.innerText = "다크 모드";
        }
    }
});
