const APP_ID = 'REDACTED_APP_ID_2'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let UID = Number(sessionStorage.getItem('UID'))
const USERNAME = sessionStorage.getItem('username') || 'You'

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}

const updateGrid = () => {
    const grid = document.getElementById('video-streams')
    const n = grid.querySelectorAll('.video-container').length
    const cols = n <= 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
}

let joinAndDisplayLocalStream = async () => {
    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try {
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch(error) {
        console.error(error)
        window.open('/', '_self')
    }

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let player = `<div class="video-container" id="user-container-${UID}">
                    <div class="username-wrapper"><span class="user-name">${USERNAME} (You)</span></div>
                    <div class="video-player" id="user-${UID}"></div>
                </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    updateGrid()

    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0], localTracks[1]])
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === 'video') {
        let existing = document.getElementById(`user-container-${user.uid}`)
        if (existing) existing.remove()

        let player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="username-wrapper"><span class="user-name">User ${user.uid}</span></div>
                        <div class="video-player" id="user-${user.uid}"></div>
                    </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        updateGrid()
        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
    updateGrid()
}

let leaveAndRemoveLocalStream = async () => {
    for (let i = 0; i < localTracks.length; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }
    await client.leave()
    window.open('/', '_self')
}

let toggleCamera = async (e) => {
    const btn = document.getElementById('camera-btn')
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        btn.classList.remove('muted')
        btn.querySelector('.ctrl-label').textContent = 'Video'
    } else {
        await localTracks[1].setMuted(true)
        btn.classList.add('muted')
        btn.querySelector('.ctrl-label').textContent = 'Off'
    }
}

let toggleMic = async (e) => {
    const btn = document.getElementById('mic-btn')
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        btn.classList.remove('muted')
        btn.querySelector('.ctrl-label').textContent = 'Mute'
    } else {
        await localTracks[0].setMuted(true)
        btn.classList.add('muted')
        btn.querySelector('.ctrl-label').textContent = 'Muted'
    }
}

joinAndDisplayLocalStream()
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
