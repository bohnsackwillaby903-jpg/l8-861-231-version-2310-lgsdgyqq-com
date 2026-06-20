function bootMoviePlayer(videoSource) {
    const video = document.querySelector('[data-player]');
    const cover = document.querySelector('[data-player-cover]');
    const button = document.querySelector('[data-play-button]');
    let hlsInstance = null;
    let prepared = false;

    if (!video || !videoSource) {
        return;
    }

    const prepare = function () {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSource;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoSource);
            hlsInstance.attachMedia(video);
        } else {
            video.src = videoSource;
        }
    };

    const play = function () {
        prepare();

        if (cover) {
            cover.classList.add('hidden');
        }

        const result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {});
        }
    };

    if (cover) {
        cover.addEventListener('click', play);
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            play();
        });
    }

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
