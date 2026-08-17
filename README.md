# Tanuljunk Magyarul! 🌻

Interaktív, színes magyar nyelvtanuló oldal 7–10 éves, angol anyanyelvű gyerekeknek.

## Fájlok
- `index.html` — Főoldal
- `abc.html` — Magyar ábécé
- `numbers.html` — Számok + számolós játék
- `words.html` — Szavak (színek, állatok, család, étel, köszönések)
- `calendar.html` — Hónapok, évszakok, a hét napjai
- `css/style.css` — Az összes stílus egy helyen
- `js/script.js` — Interaktivitás (kártyák, kiejtés, kvíz)

## Képek helyett
Az oldal emoji-kat és kézzel rajzolt SVG díszítést használ kép helyett, hogy ne kelljen
semmilyen képfájlt feltölteni, és minden eszközön gyorsan és szépen jelenjen meg. Ha
később szeretnél saját (pl. Canva-ban készített) képeket hozzáadni, hozz létre egy
`images` mappát, tölts fel oda `.png` vagy `.jpg` fájlokat, és cseréld le a megfelelő
`<span class="tile-emoji">...</span>` részt egy `<img src="images/fajlnev.png" alt="...">`
sorra.

## Kiejtés
A szavak kiejtését a böngésző saját, beépített felolvasó funkciója adja (Web Speech API).
Nem minden eszközön van magyar hang telepítve — ha egy gyerek rákattint egy szóra és nem
hall semmit, ez teljesen normális, a leírt szó akkor is ott van.
