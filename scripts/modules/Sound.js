/**
 * Kod pochodzi z mojego innego projektu.
 * Był realizowany w bardzo specyficznym środowisku, które wymusiło użycie tylko i wyłącznie statycznych metod.
 * Stąd taka, a nie inna struktura kodu.
 * @author Jakub Jaruszewski
 */
class Sound {
  static playIcon = "assets/playerIcons/play.svg"
  static fullVolumeIcon = "assets/playerIcons/fullVolume.svg"
  static zeroVolumeIcon = "assets/playerIcons/zeroVolume.svg"
  static pauseIcon = "assets/playerIcons/pause.svg"
  static mutedIcon = "assets/playerIcons/mute.svg"
  static errorIcon = "assets/playerIcons/error.svg"
  static loadingIcon = "assets/playerIcons/loading.svg"
  static structAudio(elem) {
    let container = document.createElement("div");
    container.classList.add("audioContainer", "blocked");
    container.innerHTML = `<div class="playContainer center"><img lazy-load-ignore name="playToggle" tabindex="0" class="imageIcon spinning" src="${Sound.loadingIcon}"></div>` +
    `<div class="progressContainer"><div class="onTop"><progress name="playbackProgress" value="0" max="1000"></progress></div><div class="onTop"><input name="playbackSlider" type="range" min="0" max="1000" value="0"></div></div>` +
    `<div class="timeContainer center"><div class="timer"><span name="timeElapsed">0:00</span>/<span name="timeTotal">0:00</span></div></div>` +
    `<div name="volumeContainer" class="volumeContainer hidden"><div class="volumeToggleContainer center"><img lazy-load-ignore name="volumeToggle" tabindex="0" class="imageIcon" src="${Sound.fullVolumeIcon}"></div><div name="volumeSliderContainer" class="voulmeSliderContainer center"><input name="volumeSlider" type="range" value="100" min="0" max="100"></div></div>`;
    elem.replaceWith(container);
    elem.setAttribute("name", "audioElement");
    container.prepend(elem)
    Sound.prepareAudio(container, elem);
  }
  static prepareAudio(elem) {
    if (elem.hasAttribute("player-prep")) return;
    elem.setAttribute("player-prep", "");
    let audioElement = elem.querySelector(`[name="audioElement"]`);
    let id = audioElement.getAttribute("identifier");
    if (audioElement.readyState >= 1) {
      if (id) Sound.identifiers[id] = audioElement;
      Sound.process(elem, audioElement);
    } else audioElement.addEventListener("loadedmetadata", e => {
      if (id) Sound.identifiers[id] = audioElement;
      Sound.process(elem, audioElement);
    }, {
      once: true
    });
    audioElement.addEventListener("error", e => {
      let playToggle = elem.querySelector(`[name="playToggle"]`);
      playToggle.classList.remove("spinning");
      playToggle.src = Sound.errorIcon;
      elem.style.borderColor = "red";
      elem.classList.add("blocked");
      if (!audioElement.paused) audioElement.pause();
      console.error("ERROR PLAYING AUDIO:", e);
    }, {
      once: true
    });
  }
  static dateObj = new Date();
  static getTime(fraction, duration) {
    let miliseconds = duration * fraction;
    Sound.dateObj.setTime(miliseconds);
    let seconds = Sound.dateObj.getSeconds();
    seconds = seconds < 10 ? "0" + seconds.toString() : seconds.toString();
    let minutes = Sound.dateObj.getMinutes().toString();
    return minutes + ":" + seconds;
  }
  static process(elem, audioElement) {
    let playToggle = elem.querySelector(`[name="playToggle"]`);
    let playbackProgress = elem.querySelector(`[name="playbackProgress"]`);
    let playbackSlider = elem.querySelector(`[name="playbackSlider"]`);
    let timeTotal = elem.querySelector(`[name="timeTotal"]`);
    let timeElapsed = elem.querySelector(`[name="timeElapsed"]`);
    let volumeContainer = elem.querySelector(`[name="volumeContainer"]`);
    let volumeToggle = elem.querySelector(`[name="volumeToggle"]`);
    //let volumeSliderContainer = elem.querySelector(`[name="volumeSliderContainer"]`);
    let volumeSlider = elem.querySelector(`[name="volumeSlider"]`);

    //set total time
    let duration = parseInt(audioElement.duration * 1000);
    timeTotal.innerText = Sound.getTime(1, duration);



    //loading icon
    let isLoading = true;
    if (audioElement.readyState < 4) {
      audioElement.addEventListener("canplay", e => {
        playToggle.classList.remove("spinning");
        elem.classList.remove("blocked");
        playToggle.src = audioElement.paused ? Sound.playIcon : Sound.pauseIcon;
        isLoading = false;
      });
    } else {
      playToggle.classList.remove("spinning");
      elem.classList.remove("blocked");
      playToggle.src = audioElement.paused ? Sound.playIcon : Sound.pauseIcon;
      isLoading = false;
    }
    //Dragblock variable
    let isDragBlocked = false;

    //play and pause
    audioElement.addEventListener("play", e => {
      if (!isLoading) playToggle.src = Sound.pauseIcon;
    });
    audioElement.addEventListener("pause", e => {
      if (!isLoading) playToggle.src = Sound.playIcon;
    });

    //timeupdate
    audioElement.addEventListener("timeupdate", e => {
      if (!isDragBlocked) {
        let progVal = parseInt(((audioElement.currentTime * 1000) / duration) * 1000);
        if (playbackSlider.value != progVal) {
          playbackProgress.value = progVal;
          playbackSlider.value = progVal;
        } 
      }
      const time = Sound.getTime(playbackSlider.value / 1000, duration);
      if (timeElapsed.innerText != time) {
        timeElapsed.innerText = Sound.getTime(playbackSlider.value / 1000, duration);
      }
    });

    //volume change
    let mutedOpacity = 0.4;
    audioElement.addEventListener("volumechange", e => {
      volumeSlider.value = parseInt(audioElement.volume * 100);
      if (audioElement.muted) {
        volumeToggle.src = Sound.mutedIcon;
        volumeSlider.style.opacity = mutedOpacity;
        volumeToggle.style.opacity = mutedOpacity;
      } else if (volumeSlider.value == 0) {
        volumeToggle.src = Sound.zeroVolumeIcon;
        volumeSlider.style.opacity = "";
        volumeToggle.style.opacity = "";
      } else {
        volumeToggle.src = Sound.fullVolumeIcon;
        volumeSlider.style.opacity = "";
        volumeToggle.style.opacity = "";
      }
    });
    //playToggle
    playToggle.addEventListener("click", e => {
      if (audioElement.ended) audioElement.currentTime = 0;
      if (audioElement.paused) audioElement.play();
      else audioElement.pause();
    });

    //progressBar
    let didTouchProgress = false;
    playbackSlider.addEventListener("mousedown", e => {
      if (!didTouchProgress) isDragBlocked = true;
    });
    playbackSlider.addEventListener("touchstart", e => {
      didTouchProgress = true;
      isDragBlocked = true;
    });
    playbackSlider.addEventListener("mouseup", e => {
      if (!didTouchProgress) isDragBlocked = false;
    });
    playbackSlider.addEventListener("touchend", e => {
      didTouchProgress = false;
      isDragBlocked = false;
    });
    playbackSlider.addEventListener("touchcancel", e => {
      didTouchProgress = false;
      isDragBlocked = false;
    });
    playbackSlider.addEventListener("change", e => {
      let desiredTime = (playbackSlider.value / 1000) * duration;
      audioElement.currentTime = desiredTime / 1000;
      e.stopPropagation();
    });
    playbackSlider.addEventListener("input", e => {
      playbackProgress.value = playbackSlider.value;
      if (isDragBlocked) {
        let fraction = playbackSlider.value / 1000;
        timeElapsed.innerText = Sound.getTime(fraction, duration);
      }
      e.stopPropagation();
    });

    //Volume slider
    volumeSlider.addEventListener("input", e => {
      audioElement.volume = volumeSlider.value / 100;
      if (volumeSlider.value > 0 && audioElement.muted) audioElement.muted = false;
      e.stopPropagation();
    });

    //volumeContainer
    let touchBlock = false;
    let didTouch = false;
    let isVolHover = false;
    let touchTimeout = null;
    let holdTime = 500;
    volumeToggle.addEventListener("contextmenu", e => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
    volumeToggle.addEventListener("touchstart", e => {
      didTouch = true;
      touchTimeout = setTimeout(() => {
        audioElement.muted = !audioElement.muted
        touchTimeout = null;
      }, holdTime);
      if (!isVolHover) touchBlock = true;
      e.preventDefault();
      return false;
    });
    volumeToggle.addEventListener("touchend", e => {
      if (touchTimeout !== null) {
        clearTimeout(touchTimeout);
        volumeContainer.classList.toggle("hidden");
        touchTimeout = null;
      }
    });
    volumeContainer.addEventListener("touchcancel", e => {
      if (touchTimeout !== null) {
        clearTimeout(touchTimeout);
        volumeContainer.classList.toggle("hidden");
        touchTimeout = null;
      }
    });
    volumeContainer.addEventListener("mouseenter", e => {
      isVolHover = true;
      if (!didTouch) {
        volumeContainer.classList.remove("hidden");
      }
    });
    volumeToggle.addEventListener("mousedown", e => {  
      if (e.button !== 0) return;
      if (touchBlock) {
        didTouch = false;
        return touchBlock = false;
      }
      if (!didTouch) audioElement.muted = !audioElement.muted;
      didTouch = false;
    });
    volumeContainer.addEventListener("mouseleave", e => {
      isVolHover = false;
      volumeContainer.classList.add("hidden");
    });
  }
  static watchAudios(elem) {
    Sound.audioWatch.disconnect();
    Sound.audioWatch.observe(elem, {
      childList: true,
      subtree: true
    });
  }
  static checkForAudios(elem) {
    let nodes = elem.querySelectorAll(`audio[audioPlayer]`);
    for (let node of nodes) Sound.structAudio(node);
  }
  static audioWatch = new MutationObserver(ml => {
    for (let m of ml) {
      for (let node of m.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName == "AUDIO" && node.hasAttribute("audioPlayer")) {
          Sound.structAudio(node);
        }
      }
    }
  })
}