const client = new WebTorrent()

client.on('error', function (err) {
    console.error('ERROR: ' + err.message)
})

document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault() // Prevent page refresh

    const torrentId = document.querySelector('form input[name=torrentId]').value
    log('Adding ' + torrentId)
    client.add(torrentId, onTorrent)
})

function onTorrent(torrent) {
    log('Got torrent metadata!')
    log(
        'Torrent info hash: ' + torrent.infoHash + ' ' +
        '<a href="' + torrent.magnetURI + '" target="_blank">[Magnet URI]</a> ' +
        '<a href="' + torrent.torrentFileBlobURL + '" target="_blank" download="' + torrent.name + '.torrent">[Download .torrent]</a>'
    )

    // Print out progress every 5 seconds
    const interval = setInterval(function () {
        log('Progress: ' + (torrent.progress * 100).toFixed(1) + '%')
    }, 5000)

    torrent.on('done', function () {
        log('Progress: 100%')
        clearInterval(interval)
    })

    // Render all files into to the page
torrent.files.forEach(function (file) {
  if (file.name.endsWith('.mp4')) {
    log('🎥 Injetando vídeo: ' + file.name)

    file.getBlobURL((err, url) => {
      if (err) return log('Erro ao gerar blob: ' + err.message)

      const video = document.createElement('video')
      video.src = url
      video.controls = true
      video.autoplay = true
      video.width = 800

      const container = document.getElementById('video-container')
      container.innerHTML = '' // limpa anterior
      container.appendChild(video)
    })
  } else {
    file.getBlobURL(function (err, url) {
      if (err) return log(err.message)
      log('File done.')
      log('<a href="' + url + '" download>' + 'Download full file: ' + file.name + '</a>')
    })
  }
})


}

function log(str) {
    const p = document.createElement('p')
    p.innerHTML = str
    document.querySelector('.log').appendChild(p)
}