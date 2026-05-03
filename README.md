# MyChat

![Python](https://img.shields.io/badge/python-%3E%3D3.12-blue)
![Django](https://img.shields.io/badge/Django-6.x-green)
![License: ISC](https://img.shields.io/badge/License-ISC-yellow)

A group video calling web app. Enter a room name and your display name — the server mints an Agora RTC token and drops you straight into a live video room. Supports dynamic multi-participant grid layout with mic and camera controls.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Reference](#api-reference)
- [Room Controls](#room-controls)
- [Video Grid Layout](#video-grid-layout)
- [Scripts](#scripts)

---

## Architecture

```
┌─────────────┐     ┌──────────────┐
│   Browser   │────▶│  Django API  │
│  (Lobby)    │     │  /get_token/ │
└─────────────┘     └──────┬───────┘
       │                   │ Agora RTC token + UID
       │                   ▼
       │            ┌──────────────┐
       └───────────▶│  Agora RTC   │
    Join room       │  (video/mic) │
                    └──────┬───────┘
                           │ streams
                    ┌──────▼───────┐
                    │  Other peers │
                    └──────────────┘
```

**Request flow:**
1. User submits lobby form with room name and display name.
2. Browser fetches `GET /get_token/?channel=<ROOM>` — server returns a signed Agora token and a UID.
3. Credentials are stored in `sessionStorage` and the browser navigates to `/room/`.
4. `streams.js` joins the Agora channel, publishes local mic + camera, and subscribes to remote participants.
5. Grid layout recalculates dynamically on every join and leave.

---

## Tech Stack

| Concern | Library |
|---------|---------|
| Runtime | Python 3.12 |
| Framework | Django 6 |
| Database | SQLite (dev) |
| Video / Audio | Agora RTC SDK 4.24 |
| Token generation | agora-token-builder |
| Frontend | Vanilla JS + CSS Grid |

---

## Getting Started

### Prerequisites

- Python 3.12+
- `python3.12-venv` (`sudo apt install python3.12-venv` on Ubuntu)
- An [Agora](https://console.agora.io) account with an App ID and App Certificate

### Installation

1. **Clone and create a virtual environment**

   ```bash
   git clone <repo-url>
   cd Chat-App
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**

   ```bash
   pip install django agora-token-builder
   ```

3. **Configure Agora credentials**

   Open `base/views.py` and set your App ID and App Certificate:

   ```python
   appId = 'YOUR_AGORA_APP_ID'
   appCertificate = 'YOUR_AGORA_APP_CERTIFICATE'
   ```

   Also set `APP_ID` in `static/js/streams.js`:

   ```js
   const APP_ID = 'YOUR_AGORA_APP_ID'
   ```

4. **Apply migrations**

   ```bash
   python manage.py migrate
   ```

5. **Start the server**

   ```bash
   python manage.py runserver
   ```

   Open `http://127.0.0.1:8000/` in your browser.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Lobby page |
| `GET` | `/room/` | Room page |
| `GET` | `/get_token/` | Mint Agora RTC token |

### Get Token

```bash
curl "http://localhost:8000/get_token/?channel=MYROOM"
```

**Response `200`**
```json
{
  "token": "<agora-rtc-token>",
  "uid": 42
}
```

Token is valid for 24 hours. A random UID between 1–255 is assigned per request.

---

## Room Controls

| Button | Action | Muted state |
|--------|--------|-------------|
| Mic | Toggle microphone | Red tint + border |
| Video | Toggle camera | Red tint + border |
| Leave | End call, return to lobby | — |

Controls use inline SVG icons. Muted state is indicated by a `.muted` CSS class — no background images required.

---

## Video Grid Layout

Grid columns adjust automatically as participants join or leave:

| Participants | Columns |
|---|---|
| 1 | 1 |
| 2 – 4 | 2 |
| 5 – 9 | 3 |
| 10+ | 4 |

Local user tile shows `<your name> (You)`. Remote tiles show `User <uid>`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `python manage.py runserver` | Start development server on port 8000 |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py collectstatic` | Collect static files for production |
