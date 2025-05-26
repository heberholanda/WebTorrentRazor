const client = new WebTorrent()

const webRtcTrackers = [
    'wss://tracker.openwebtorrent.com',
    'wss://tracker.btorrent.xyz',
    'wss://tracker.fastcast.nz',
    'wss://tracker.sloppyta.co:443/announce',
    'wss://tracker.novage.com.ua:443/announce',
    'wss://signal.tinyviz.com:443/announce'
]

const $body = document.body
const $progressBar = document.querySelector('#progressBar')
const $numPeers = document.querySelector('#numPeers')
const $downloaded = document.querySelector('#downloaded')
const $total = document.querySelector('#total')
const $remaining = document.querySelector('#remaining')
const $uploadSpeed = document.querySelector('#uploadSpeed')
const $downloadSpeed = document.querySelector('#downloadSpeed')
const $torrentLink = document.querySelector('#torrentLink')

document.querySelector('#torrentForm').addEventListener('submit', function (e) {
    e.preventDefault()
    const torrentId = document.querySelector('input[name=torrentId]').value.trim()
    log('Adding ' + torrentId)

    const extracted = extractWsTrackersFromMagnet(torrentId)
    const announce = extracted.length > 0
        ? [...new Set([...extracted, ...webRtcTrackers])]
        : webRtcTrackers

    client.add(torrentId, { announce }, onTorrent)
})

function extractWsTrackersFromMagnet(uri) {
    const matches = uri.match(/tr=([^&]+)/g) || []
    const trackers = matches.map(tr => decodeURIComponent(tr.slice(3)))
    const wssOnly = trackers.filter(t => t.startsWith('wss://'))
    return [...new Set(wssOnly)]
}

function onTorrent(torrent) {
    $torrentLink.href = torrent.magnetURI
    $torrentLink.textContent = torrent.name

    const file = torrent.files.find(f => f.name.endsWith('.mp4'))
    if (!file) {
        log('No .mp4 file found in torrent.')
        return
    }

    file.getBlobURL((err, url) => {
        if (err) return log('Erro ao gerar URL do vídeo: ' + err.message)

        const video = document.createElement('video')
        video.src = url
        video.controls = true
        video.autoplay = true
        video.width = 800

        const container = document.getElementById('video-container')
        container.innerHTML = ''
        container.appendChild(video)

        log('🎬 Vídeo carregado com getBlobURL().')
    })

    torrent.on('done', onDone)
    setInterval(onProgress, 500)
    onProgress()

    function onProgress() {
        $numPeers.textContent = torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers')

        const percent = Math.round(torrent.progress * 100 * 100) / 100
        $progressBar.style.width = percent + '%'

        $downloaded.textContent = prettyBytes(torrent.downloaded)
        $total.textContent = prettyBytes(torrent.length)

        let remaining
        if (torrent.done) {
            remaining = 'Done.'
        } else {
            remaining = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize()
            remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining.'
        }
        $remaining.textContent = remaining

        $downloadSpeed.textContent = prettyBytes(torrent.downloadSpeed) + '/s'
        $uploadSpeed.textContent = prettyBytes(torrent.uploadSpeed) + '/s'
    }

    function onDone() {
        $body.classList.add('is-seed')
        onProgress()
    }
}

function log(str) {
    const p = document.createElement('p')
    p.innerHTML = str
    document.querySelector('.log')?.appendChild(p)
}

function prettyBytes(num) {
    const units = ['B', 'kB', 'MB', 'GB', 'TB']
    const neg = num < 0
    if (neg) num = -num
    if (num < 1) return (neg ? '-' : '') + num + ' B'
    const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    const unit = units[exponent]
    num = Number((num / Math.pow(1000, exponent)).toFixed(2))
    return (neg ? '-' : '') + num + ' ' + unit
}
