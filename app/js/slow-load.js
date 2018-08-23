let slowLoadDiv = document.createElement("div");
slowLoadDiv.setAttribute("id", "slow-load");
const slowLoad = window.setTimeout(function () {
    const insertPoint = document.getElementById("gallery");
    const slowLoadContent = document.createElement("div");
    const slowLoadClose = document.createElement("span");
    const slowLoadText = document.createElement("p");

    slowLoadContent.setAttribute("id", "slow-load-content");
    slowLoadClose.setAttribute("id", "slow-load-close");
    slowLoadText.setAttribute("id", "slow-load-text");

    slowLoadClose.innerText = "\u00d7"; // Multiplication sign
    slowLoadText.innerText = "The page is taking a while to load";

    insertPoint.appendChild(slowLoadDiv);
    slowLoadDiv.appendChild(slowLoadContent);
    slowLoadContent.appendChild(slowLoadClose);
    slowLoadContent.appendChild(slowLoadText);

    slowLoadClose.addEventListener("click", function () {
        slowLoadDiv.parentNode.removeChild(slowLoadDiv);
        slowLoadDiv = null;
    });
}, 100);

window.addEventListener("load", function () {
    window.clearTimeout(slowLoad);
    if (slowLoadDiv !== null && slowLoadDiv.parentNode !== null) {
        slowLoadDiv.parentNode.removeChild(slowLoadDiv);
    }
}, false);