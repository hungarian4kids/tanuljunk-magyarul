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
Az `abc.html` oldal saját, ebbe a repóba feltöltött hangfelvételeket használ (nem külső
oldalról linkelve — az megbízhatatlannak bizonyult ékezetes fájlneveknél). Ehhez létre kell
hozni egy `audio/abc/` mappát a repo gyökerében, és abba kell feltölteni mind a 44 betűnév
mp3 fájlt (pl. `a.mp3`, `á.mp3`, `bé.mp3`, `csé.mp3` stb. — pontosan úgy elnevezve, ahogy
nálad vannak).

A repo gyökerében van egy `.nojekyll` nevű, szándékosan üres fájl is — ez kikapcsolja a
GitHub Pages beépített Jekyll feldolgozását, ami ékezetes fájlneveknél (pl. `á.mp3`) hibásan
tud viselkedni. Ezt a fájlt ne töröld.

A GitHub-on a legegyszerűbb módja a feltöltésnek: nyisd meg közvetlenül ezt a címet a
böngésződben (cseréld ki a saját felhasználóneved/repo neved szerint), és a fájlok pont a
jó helyre kerülnek feltöltéskor:

`https://github.com/[felhasználóneved]/[repo-neved]/upload/main/audio/abc`

Azokon az oldalakon, ahol nincs hangfelvétel (számok, szavak, hónapok), az oldal
továbbra is a böngésző saját, beépített felolvasó funkcióját használja (Web Speech API)
tartalék megoldásként. Nem minden eszközön van magyar hang telepítve — ha egy gyerek
rákattint egy szóra és nem hall semmit, ez teljesen normális, a leírt szó akkor is ott van.
