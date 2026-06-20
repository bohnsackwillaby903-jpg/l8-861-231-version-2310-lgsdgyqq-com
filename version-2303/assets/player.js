(function () {
    function bindPlayer(panel) {
        var video = panel.querySelector('video');
        var button = panel.querySelector('.play-button');
        if (!video || !button) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var hls = null;

        function load() {
            if (!stream) {
                return;
            }
            if (video.getAttribute('data-ready') !== '1') {
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                }
                video.setAttribute('data-ready', '1');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        button.addEventListener('click', load);
        video.addEventListener('click', function () {
            if (video.paused) {
                load();
            }
        });
        video.addEventListener('play', function () {
            panel.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            panel.classList.remove('is-playing');
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(bindPlayer);
})();
