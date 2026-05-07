# Stormuś Game — kontekst projektu dla CC
_Projekt: gra przeglądarkowa branded dla Stormet Sp. z o.o._
_Ostatnia aktualizacja: 06.05.2026_

---

## Cel projektu
Przeglądarkowa gra 2D dla Stormet — firma skupu złomu z Krakowa.
Mechanika: Endless Runner (Subway Surfers) + runda Oczyszczalni (Overcooked).
Postać: Stormuś — robot-zbieracz złomu.
Cel marketingowy: ruch na stormet.pl, budowanie wizerunku eko.

## Stack technologiczny
- **Silnik**: Phaser 3 (vanilla JS, bez bundlerów)
- **Język**: JavaScript ES6+
- **Deploy**: GitHub Pages (automatyczny po każdym push do main)
- **Repo**: https://github.com/[UZUPEŁNIĆ]/stormet-game
- **Praca lokalna**: Antigravity na komputerze Przemka → git push → GitHub Pages
- **Serwer Connected**: NIE używamy na MVP (post-MVP: leaderboard, SMS)
- **Assets MVP**: placeholder sprites (prostokąty Phaser Graphics API, bez zewnętrznych plików)

## Struktura repo
```
stormet-game/
├── index.html          ← punkt wejścia, ładuje Phaser 3 z CDN
├── src/
│   ├── config.js       ← konfiguracja Phaser (width, height, sceny)
│   ├── scenes/
│   │   ├── BootScene.js      ← preload assets
│   │   ├── MenuScene.js      ← ekran startowy
│   │   ├── RunnerScene.js    ← główna mechanika runnera
│   │   ├── CleanerScene.js   ← oczyszczalnia (Overcooked-style)
│   │   └── ResultScene.js    ← ekran wyniku
│   └── objects/
│       ├── Stormus.js        ← klasa postaci
│       ├── ScrapItem.js      ← klasa elementu złomu (klasa A/B/C)
│       └── Machine.js        ← klasa urządzenia w oczyszczalni
├── assets/
│   ├── sprites/        ← placeholder PNG lub wygenerowane AI
│   ├── audio/          ← darmowe z kenney.nl
│   └── ui/             ← ikony, przyciski
└── CLAUDE.md           ← ten plik (aktualizuj po każdej sesji!)
```

## Aktualna faza
**Sprint 2 — Oczyszczalnia MVP**

## Do zrobienia w Sprint 1
- [x] Boilerplate Phaser 3 działający na GitHub Pages
- [x] RunnerScene: Stormuś biegnie, 3 tory
- [x] Sterowanie: klawiatura (strzałki + spacja) + podstawowy touch
- [x] Generowanie złomu (klasy A/B/C) na torach
- [x] Kolekcjonowanie: licznik złomu w worku
- [x] Ekran wyniku (prosty ResultScene)
- [x] Commit + push + GitHub Pages live

## Ostatnio zrobione
- **Sprint 1 (06.05.2026)**:
  - Zbudowano całą podstawową strukturę gry MVP w Phaser 3.
  - Zaimplementowano `index.html` z importem Phasera z CDN.
  - Skonfigurowano maszynę stanów gry z podziałem na `BootScene`, `MenuScene`, `RunnerScene` i `ResultScene`.
  - Stworzono grywalny prototyp `RunnerScene` w którym postać "Stormuś" porusza się po 3 torach, zbierając obiekty "ScrapItem" (złom klas A, B, C) oraz unikając przeszkód (GRUZ).
  - Wdrożono punktację bazującą na typach obiektów oraz timer ograniczający czas rundy do 60s.
- **Sprint 2 (07.05.2026)**:
  - Zaimplementowano `CleanerScene` z mechaniką "Overcooked".
  - Stworzono klasę `Machine.js` obsługującą różne typy urządzeń (Opony, Beton, Drewno, Spawarka).
  - Wdrożono siatkę 8x8 (880x880px) z taśmociągiem w kształcie litery L.
  - Dodano interakcje: podnoszenie/odkładanie złomu, przetwarzanie w maszynach, spawanie grud i wydawanie do skupu.
  - Zaktualizowano `ResultScene` o wyświetlanie wyników z obu faz gry oraz system gwiazdek.
  - Domknięto pętlę gry: Runner -> Oczyszczalnia -> Wynik.

---

## Kluczowe mechaniki — skrót

### Runner
- 3 tory (lewo / środek / prawo)
- Sterowanie: L/P = zmiana toru, Spacja = skok, Dół = slajd
- Złom: klasa A (100pkt), klasa B (60pkt), klasa C (−20pkt lub pułapka)
- Speed boost: dwukrotny tap, ładuje się ze złomem A
- Zagrożenia: gruzy, beczki Sabotażystów, fałszywy złom C

### Oczyszczalnia (po każdym runnerze)
- Taśma wejściowa przynosi zanieczyszczony złom z worka
- Gracz: weź element → wrzuć do urządzenia → odbierz → wyślij na wagę
- Urządzenia: oddzielacz opon (3s), piła (2s), kruszarka (4s), spawarnia (5s, 3×→1×)
- Zagrożenie: przegrzanie urządzenia → konieczność schłodzenia
- Limit czasu → nieobsłużone elementy = odrzut i kara

### System punktacji końcowej
- Waga przelicza klasy złomu
- Klasa A: 100%, B: 60%, C: 0% lub kara
- Wynik wyświetla "zarobek" i "ślad ekologiczny"

---

## Zasady kodu (obowiązkowe)
1. Vanilla JS + Phaser 3 CDN — bez npm, bez bundlerów na MVP
2. Każda scena w osobnym pliku w `src/scenes/`
3. Żadnych sekretów / kluczy API w kodzie
4. Placeholder sprites = kolorowe prostokąty z tekstem (Phaser Graphics API) — bez zewnętrznych plików obrazków na Sprint 1
5. Po każdej sesji: `git add . && git commit -m "opis co zrobiono" && git push`
6. GitHub Pages deploy automatyczny po pushu — sprawdź link po każdym pushu
7. Po każdym sprincie: zaktualizuj sekcje "Aktualna faza" i "Ostatnio zrobione" w tym pliku

## Jak uruchomić lokalnie
```bash
# Phaser 3 przez CDN — wystarczy lokalny serwer HTTP
# Opcja 1:
npx serve .
# Opcja 2:
python3 -m http.server 8080
# Otwórz: http://localhost:8080
# UWAGA: nie otwieraj index.html bezpośrednio w przeglądarce (file://) — moduły JS nie działają
```

## GitHub Pages
- Branch: `main` (lub `gh-pages` jeśli skonfigurowany)
- URL: https://[UZUPEŁNIĆ].github.io/stormet-game
- Deploy: automatyczny po każdym pushu do main

---

## Kontekst biznesowy
- Klient: Stormet Sp. z o.o. — skup złomu i metali kolorowych, Kraków
- Kierownik projektu: Przemek (AI2B) — Claude w tym projekcie
- Wykonawca kodu: Claude Code na Connected (labcloud.dev)
- Grupa docelowa: 15–30 lat, przeglądarka, mobile-friendly
- Cel marketingowy: ruch na stormet.pl → post-MVP: SMS zapis, leaderboard

## Post-MVP (nie implementuj teraz)
- Prawdziwe grafiki i animacje Stormusia
- Audio (Kenney.nl assets)
- Leaderboard (backend na Connected)
- SMS hook (Stormet SMS plugin)
- Daily challenge (seed dzienny)
- Mobile touch controls pełne
- Dodatkowe poziomy i środowiska
