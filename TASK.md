# TASK — Sprint 1: Runner MVP
_Dla: Claude Code na Connected_
_Data: 06.05.2026_
_Priorytet: wysoki — to jest punkt startowy całego projektu_

---

## Cel zadania
Zbudować działający prototyp runnera Stormusia na GitHub Pages.
Po wykonaniu tego zadania Przemek otwiera link i gra działającą grę.

## Repozytorium
1. Utwórz repo na GitHub: `stormet-game` (publiczne, dla GitHub Pages)
2. Zainicjuj z plikiem README.md
3. Sklonuj na Connected do `/home/przemek/labcloud/stormet-game/`
4. Skonfiguruj GitHub Pages: Settings → Pages → Branch: main → / (root)

## Co zbudować — krok po kroku

### Krok 1: index.html (punkt wejścia)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Stormuś — Stormet Game</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
  <script src="src/config.js" type="module"></script>
</body>
</html>
```

### Krok 2: src/config.js
- Załaduj sceny: BootScene, MenuScene, RunnerScene, ResultScene
- Rozdzielczość: 480×800 (mobile-first) lub 800×480 (landscape)
- Renderer: AUTO (WebGL z fallbackiem Canvas)
- Physics: Arcade

### Krok 3: RunnerScene.js — to jest serce MVP
Zaimplementuj:

**Tło i tory**
- 3 pionowe tory (lewo / środek / prawo)
- Tło: ciemne miasto (prosty gradient lub jednolity kolor #1a1a2e)
- Linie torów jako cienkie prostokąty

**Stormuś (placeholder)**
- Phaser Graphics: pomarańczowy prostokąt 40×60px z tekstem "STORMUŚ"
- Stale przesuwa się w górę ekranu (illuzja biegu) LUB środowisko przesuwa się w dół
- Fizyka Arcade: collider z przeszkodami

**Sterowanie**
```javascript
// Klawiatura
cursors.left  → moveLeft()
cursors.right → moveRight()
cursors.up / spacja → jump()
cursors.down  → slide()

// Touch (podstawowy)
swipe left/right → moveLeft/Right()
tap → jump()
```

**Generowanie złomu**
- Timer co 800–1200ms (losowy) generuje ScrapItem na losowym torze
- ScrapItem: kolorowy prostokąt (A=zielony, B=żółty, C=czerwony) z etykietą
- ScrapItem przesuwa się w dół ekranu (lub Stormuś w górę — zdecyduj i trzymaj się jednej konwencji)
- Overlap Stormuś + ScrapItem → zebranie, dodanie do worka

**Worek (UI)**
- Lewy górny róg: "Worek: A:0 B:0 C:0"
- Timer rundy: prawy górny róg, odlicza od 60s
- Po 60s lub dotarciu do mety → ResultScene

**Zagrożenia (tylko jedno na MVP)**
- Przeszkoda: szary prostokąt "GRUZ" — pojawia się jak złom
- Kolizja Stormusia z GRUZ → reset pozycji + kara 2s stun

### Krok 4: ResultScene.js
- Pokaż: ile A, ile B, ile C, łączny wynik (A×100 + B×60 - C×20)
- Przycisk "NASTĘPNA RUNDA" → z powrotem do RunnerScene
- Przycisk "MENU" → MenuScene

### Krok 5: MenuScene.js
- Tytuł "STORMUŚ" duży tekst
- Podtytuł "Zbieraj złom dla Stormetu!"
- Przycisk START

### Krok 6: Deploy
```bash
git add .
git commit -m "feat: Sprint 1 — runner MVP z placeholder sprites"
git push origin main
```
Sprawdź że GitHub Pages pokazuje grę pod linkiem.

---

## Kryteria ukończenia (Definition of Done)

- [ ] Link GitHub Pages działa i ładuje grę
- [ ] Stormuś porusza się po 3 torach (klawiatura)
- [ ] Złom (A/B/C) pojawia się i można go zebrać
- [ ] Worek zlicza zebrane elementy
- [ ] Timer 60s kończy rundę
- [ ] ResultScene pokazuje wynik
- [ ] CLAUDE.md zaktualizowany o "Ostatnio zrobione"
- [ ] Email raport do najdychor.p@gmail.com z linkiem do gry

---

## Nie rób teraz
- Oczyszczalnia (Sprint 2)
- Prawdziwe grafiki (post-MVP)
- Audio
- Leaderboard
- Touch swipe (tylko podstawowy tap)

---

## Po zakończeniu
Wyślij email na najdychor.p@gmail.com z:
- Linkiem do GitHub Pages
- Linkiem do repo
- Krótkim raportem co działa, co pominąłeś i dlaczego
