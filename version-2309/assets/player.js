(function () {
    function initPlayer(shell) {
        var video = shell.querySelector('.movie-player');
        var overlay = shell.querySelector('.play-overlay');
        var status = shell.querySelector('.player-status');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src');
        var hls = null;
        var initialized = false;

        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function showOverlay() {
            if (overlay && video.paused) {
                overlay.classList.remove('is-hidden');
            }
        }

        function initialize() {
            if (initialized || !source) {
                return;
            }
            initialized = true;
            setStatus('正在加载视频...');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    setStatus('');
                }, { once: true });
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('');
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络加载异常，正在重试...');
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('解码异常，正在恢复...');
                        hls.recoverMediaError();
                    } else {
                        setStatus('视频加载失败，请刷新后重试。');
                        hls.destroy();
                    }
                });
                return;
            }
            setStatus('当前浏览器暂不支持播放。');
        }

        function play() {
            initialize();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    setStatus('请再次点击播放按钮开始播放。');
                });
            }
        }

        initialize();
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('play', hideOverlay);
        video.addEventListener('pause', showOverlay);
        video.addEventListener('ended', showOverlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(initPlayer);
    });
})();
