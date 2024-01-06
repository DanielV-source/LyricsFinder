var name = '';
var mainArtist = '';
var artists = '';
var cover = '';
var url = 'https://api.lyrics.ovh/v1/';
var lyrics = null;
var lfWindow = null;
var lfInfo = null;

// Function that gets the current song in Spotify
function getSong() {
    if(document.querySelector('[data-testid="context-item-link"]') == null) return;
    let tempName = document.querySelector('[data-testid="context-item-link"]').innerText;
    let tempMainArtist = document.querySelector('[data-testid="context-item-info-artist"]').innerText;
    let tempArtists = document.querySelector('[data-testid="context-item-info-subtitles"]').innerText;
    let tempCover = document.querySelector('[data-testid="cover-art-image"]').src;
    
    if(this.name != tempName) {
        this.name = tempName;
        this.mainArtist = tempMainArtist;
        this.artists = tempArtists;
        this.cover = tempCover;
        let tempUrl = this.url + normalize(this.mainArtist) + "/" + normalize(this.name);

        fetch(tempUrl);

        setTimeout(function () {
            updateDivInfo();
        }, 1000);
    }
}

// Function that updates the div information
function updateDivInfo() {
    document.querySelector('#lf-album-cover').innerHTML = "<img id='lf-album-cover-img' src='"+this.cover+"' alt='"+this.name + " - " + this.artists + " cover' title='"+this.name + " - " + this.artists + " cover'/>";
    document.querySelector('#lf-song').innerHTML = "<p>"+this.name+"</p>";
    document.querySelector('#lf-artist').innerHTML = "<p>"+this.artists+"</p>";
    // Wait for the song to load
    setTimeout(() => {
        // Heart button
        let heart = document.querySelector('[data-testid="now-playing-widget"]').children[2];
        let lfHeart = document.querySelector('#lf-heart');
        if(heart) {
            lfHeart.innerHTML = heart.outerHTML;
            lfHeart.children[0].classList.remove("control-button-heart");
            lfHeart.children[0].classList.add("lf-control-button-heart");
            lfHeart.onclick = () => {
                heart.click();
                setTimeout(() => {
                    lfHeart.innerHTML = heart.outerHTML;
                }, 500);
            };
        }else lfHeart.innerHTML = "";

        // Remove from list button
        let remove = document.querySelector('[data-testid="now-playing-widget"]').children[3];
        let lfRemove = document.querySelector('#lf-remove');
        if(remove) {
            lfRemove.innerHTML = remove.outerHTML;
            lfRemove.children[0].classList.remove("control-button-feedback");
            lfRemove.children[0].classList.add("lf-control-button-feedback");
            lfRemove.onclick = () => {
                remove.click();
                setTimeout(() => {
                    lfRemove.innerHTML = remove.outerHTML;
                }, 500);
            };
        }else lfRemove.innerHTML = "";
    }, 500);

    if(this.lfWindow) {
        this.lfWindow.scroll({
            top: 0
        });
    }

    let lyricsContainer = document.querySelector('#lf-lyrics-container');

    if(!lyricsContainer) 
        return;

    lfInfo = document.querySelector('#lf-info');
    if(this.lyrics != null) {
        if(lfInfo.classList.contains('full-info'))
            lfInfo.classList.remove('full-info');
        lyricsContainer.innerHTML = "<p>" + this.lyrics +"</p><br />";
    }else{
        if(!lfInfo.classList.contains('full-info'))
            lfInfo.classList.add('full-info');
        lyricsContainer.innerHTML = "<p>No lyrics available!</p><br /><br /><br />";
    }

    // Copyright advertising
    lyricsContainer.innerHTML += "<p id='lf-copy'>Copyright &copy; 2024 LyricsFinder by <a href='http://www.twitter.com/darkness_dani' target='_blank'>Daniel Vicente Ramos</a></p>";

}

// Function that fetches the lyrics
function fetch(url) {
    chrome.runtime.sendMessage({ action: "get_content", curl: url  }, function (response) {
        let d = response.content.replaceAll('\\r\\n', '#').replaceAll("\\n\\n\\n", "<br/>").replaceAll('\\n', '<br/>');
        if(d.search("lyrics") > 0) {
            if(JSON.parse(d).hasOwnProperty("lyrics")) {
                let remFirstLine = '{"lyrics":"'+d.substring(d.search("#")+1, d.length);
                data = JSON.parse(remFirstLine);
                this.lyrics = data.lyrics;
            }else this.lyrics = null;
        }else this.lyrics = null;
    });
}

function normalize(str) {
    return str.replaceAll("-", "").replaceAll(",", "").replaceAll("  ", " ").replaceAll(" ", "%20");
}

function createWindow() {
    // Creating the div
    let div = document.createElement('div');
    div.id = 'lf-window';
    div.className = 'lf-window inv';
    div.style.position = 'absolute';
    div.style.zIndex = '999';
    div.style.backgroundColor = 'rgba(18,18,18,0.95)';
    div.style.minWidth = '35em';
    div.style.maxWidth = '35em';
    div.style.height = '100%';
    div.style.border = '5px solid rgba(0, 0, 0, 0.8)';
    div.style.borderRadius = '0px 15px 15px 0px';
    div.style.paddingBottom = '0.5em';
    div.style.overflow = 'hidden';
    div.style.overflowY = 'auto';
    div.style.scrollbarWidth = 'thin';
    div.innerHTML = "<span id='lf-info'>"+
                        "<div class='lf-info-separator'>"+
                            "<span id='lf-album-cover' class='album-cover'></span>"+
                            "<div id='lf-info-artist'>"+
                                "<span class='song' id='lf-song'></span>"+
                                "<span id='lf-artist' class='artist'></span>"+
                                "<span id='lf-heart' class='heart'></span>" +
                                "<span id='lf-remove' class='remove'></span>" +
                            "</div>"+
                        "</div>"+
                        "<span id='lf-separator'></span>"+
                    "</span>"+
                    "<br/>"+
                    "<span id='lf-lyrics-container'></span>";
    document.body.appendChild(div);

    // Creating the button in the player controls
    let btn = document.createElement('button');
    btn.className = 'lf-btn';
    btn.onclick = () => {
        let nowPlaying = document.querySelector('[data-testid="now-playing-widget"]');
        this.lfWindow = document.querySelector('#lf-window');
        if(lfWindow.classList.contains('inv')) {
            lfWindow.classList.remove('inv');
            lfWindow.classList.add('show');
            nowPlaying.style.display = 'none';
        }else{
            lfWindow.classList.remove('show');
            lfWindow.classList.add('inv');
            nowPlaying.style.display = 'flex';
        }
    };
    btn.style.backgroundColor = 'transparent';
    btn.style.width = '22.5px';
    btn.style.height = '25px';
    btn.style.boxShadow = 'none';
    btn.style.borderStyle = 'none';
    btn.style.marginTop = '4.5px';
    btn.style.marginLeft = '5px';
    btn.innerHTML = '<svg viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:serif="http://www.serif.com/" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Icon"> <path d="M18.003,23.922l-0.001,0c-1.105,0 -2.002,0.897 -2.002,2.002c-0,1.105 0.897,2.002 2.002,2.002c1.104,-0 2.001,-0.897 2.001,-2.002l0,-7.122c0,-0 6.001,-0.75 6.001,-0.75l0.003,3.867c-1.105,-0 -2.002,0.897 -2.002,2.002c0,1.104 0.897,2.001 2.002,2.001c1.105,0 2.002,-0.897 2.002,-2.001l-0.006,-7.003c0,-0.286 -0.123,-0.559 -0.338,-0.749c-0.215,-0.19 -0.501,-0.278 -0.786,-0.242l-8,1c-0.5,0.062 -0.876,0.488 -0.876,0.992l0,6.003Z"></path> <path d="M18.003,23.922l-0.001,0c-1.105,0 -2.002,0.897 -2.002,2.002c-0,1.105 0.897,2.002 2.002,2.002c1.104,-0 2.001,-0.897 2.001,-2.002l0,-7.122c0,-0 6.001,-0.75 6.001,-0.75l0.003,3.867c-1.105,-0 -2.002,0.897 -2.002,2.002c0,1.104 0.897,2.001 2.002,2.001c1.105,0 2.002,-0.897 2.002,-2.001l-0.006,-7.003c0,-0.286 -0.123,-0.559 -0.338,-0.749c-0.215,-0.19 -0.501,-0.278 -0.786,-0.242l-8,1c-0.5,0.062 -0.876,0.488 -0.876,0.992l0,6.003Z"></path> <path d="M27,12.994l0.009,-6.035c-0,-0.53 -0.211,-1.039 -0.586,-1.414c-0.375,-0.375 -0.884,-0.586 -1.414,-0.586c-4.185,0 -13.824,0 -18.009,0c-0.53,0 -1.039,0.211 -1.414,0.586c-0.375,0.375 -0.586,0.884 -0.586,1.414c0,4.184 0,13.817 0,18c-0,0.531 0.211,1.04 0.586,1.415c0.375,0.375 0.884,0.585 1.414,0.585l6,0.039" style="fill:none;stroke:#ffffff;stroke-width:2px;"></path> <path d="M9.004,10l13.983,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-13.983,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path> <path d="M9.004,13.994l13.983,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-13.983,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path> <path d="M9.004,18l5.981,0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-5.981,0c-0.552,-0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path> <path d="M9.004,22.006l5.981,-0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-5.981,-0c-0.552,-0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path> </g> </g></svg>';
    setTimeout(function () {
        let playerControls = document.querySelector('.player-controls__right');
        if(playerControls) {
            playerControls.appendChild(btn);
        }
    }, 1500);
}

// Function that move the scrollbar position according to the current position of the song
function currentPos() {
    let finded = document.querySelector('[data-testid="playback-progressbar"] > label> input[type=range]');

    if(finded && this.lyrics != null && this.mainArtist != null) {
        let cPercentage = parseFloat(finded.value / finded.max);

        // Scroll to reach the actual progress at the middle of the song
        if((cPercentage > 0.5))
            cPercentage+=0.35;

        if(this.lfWindow) {
            let maxHeight = parseFloat(this.lfWindow.offsetHeight)+475;
            if(lfWindow) {
                this.lfWindow.scroll({
                    // Default scroll speed
                    top: parseInt((cPercentage * 0.75) * maxHeight),
                    behavior: "smooth"
                });
            }
        }
    }
}

// Injecting custom CSS into the page
const customCss = document.createElement("style");
customCss.textContent = `
    .lf-control-button-feedback {
        -webkit-box-align: center;
        -webkit-box-pack: center;
        display: flex;
        justify-content: center;
    }
    .lf-control-button-heart[aria-checked=true] {
        color: #1ed760;
    }

    ::-webkit-scrollbar {
        width: 12px;
    }

    ::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); 
        border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5); 
    }

    .lf-info-separator {
        display: -ms-flex;
        display: -webkit-flex;
        display: flex;
    }
    
    #lf-info-artist {
        margin-top: 1.25em !important;
        margin-left: 1em !important;
    }

    #lf-heart {
        left: 28em !important;
        top: 1.75em !important;
        position: absolute;
    }

    #lf-remove {
        left: 30em !important;
        top: 2.25em !important;
        position: absolute;
    }

    #lf-separator {
        border-top: 2.5px solid rgba(237, 237, 237, 0.5); 
        width: 98%; 
        position: absolute; 
        margin-right: 5px; 
        padding-top: 10px; 
        padding-bottom: 10px;
        z-index: 1001 !important;
    }

    #lf-info {
        padding-left: 5px !important;
        padding-top: 5px !important;
        margin-right: 15px !important;
        position:fixed; 
        background-color: rgba(0,0,0,1);
        width: 33.65em;
        z-index: 1000 !important;
        border-radius: 0px;
        transform: translateY(0%);
        opacity: 1;
    }

    .full-info {
        width: 34.65em !important;
        border-radius: 0px 15px 0px 0px;
        border-right: 5px solid rgba(0, 0, 0, 0.8);
    }

    #lf-lyrics-container {
        position: absolute;
        padding-left: 5px !important;
        padding-top: 70px !important;
        top: 145px !important;
        width: 35em !important;
        padding-bottom: 25px !important;
    }

    #lf-album-cover-img {
        width: 75px !important;
        height: 75px !important;
        border-radius: 5px !important;
    }

    .lf-window.show{
        animation-name: expand;
        animation-duration: 1s;
    }

    .lf-window.inv {
        animation-name: shrink;
        animation-duration: 0.75s;
        transform: translateX(-100%);
    }

    .lf-window.show > #lf-info {
        animation-name: open;
        animation-duration: 2s;
    }

    @keyframes open {
        0%   {transform: translateY(-100%);opacity: 0}
        10%  {transform: translateY(-90%);opacity: 1;}
        100% {transform: translateY(0%);opacity: 1;}
    }

    @keyframes expand {
        0%   {transform: translateX(-100%);opacity: 0}
        10%  {transform: translateX(-90%);opacity: 1;}
        100% {transform: translateX(0%);opacity: 1}
    }

    @keyframes shrink {
        0%   {transform: translateX(0%);opacity: 1}
        60%  {transform: translateX(-90%);opacity: 1;}
        100% {transform: translateX(-100%);opacity: 0}
    }

    .lf-btn {
        opacity: 0.6;
    }
    
    .lf-btn:hover {
        opacity: 1;
    }
    #lf-song {
        color: white;
    }
    #lf-artist {
        font-size: small;
    }
    #lf-copy {
        font-size: small;
        text-align: center;
        width: 100%;
    }
`;

if(document.head) {
    document.head.appendChild(customCss);
    createWindow();
    setInterval(function() {getSong();}, 500);
    setInterval(function() {currentPos();}, 50);
}