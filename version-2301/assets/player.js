import { H as Hls } from "./hls-vendor-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".player-shell").forEach(function (shell) {
    var video = shell.querySelector("video");
    var stream = shell.getAttribute("data-stream");
    var playButtons = shell.querySelectorAll("[data-play]");
    var muteButton = shell.querySelector("[data-mute]");
    var fullscreenButton = shell.querySelector("[data-fullscreen]");
    var instance = null;

    if (!video || !stream) {
      return;
    }

    if (Hls && Hls.isSupported()) {
      instance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      instance.loadSource(stream);
      instance.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    }

    function updateState() {
      shell.classList.toggle("is-playing", !video.paused);
      playButtons.forEach(function (button) {
        button.textContent = video.paused ? "播放" : "暂停";
      });
      if (muteButton) {
        muteButton.textContent = video.muted ? "取消静音" : "静音";
      }
    }

    function togglePlay() {
      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    }

    playButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        togglePlay();
      });
    });

    video.addEventListener("click", togglePlay);
    video.addEventListener("play", updateState);
    video.addEventListener("pause", updateState);

    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        updateState();
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          shell.requestFullscreen().catch(function () {});
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (instance) {
        instance.destroy();
      }
    });

    updateState();
  });
});
