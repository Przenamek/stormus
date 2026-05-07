# TASK — Sprint 2: Oczyszczalnia MVP
_Dla: Antigravity_
_Data: 07.05.2026_
_Priorytet: wysoki — domknięcie pętli Runner → Oczyszczalnia → Wynik_

---

## Cel zadania
Zbudować CleanerScene (oczyszczalnię) uruchamianą po każdej rundzie runnera, z mechaniką Overcooked: Stormuś chodzi po planszy, podnosi złom z taśmy, oczyszcza w maszynach, spawa w grudę i wydaje do skupu.

## Kontekst — co już istnieje, czego nie ruszać
- Sprint 1 jest gotowy i działa na GitHub Pages
- RunnerScene kończy się po 60s i przechodzi do ResultScene
- **Zmiana**: po 60s runner przechodzi do CleanerScene (nie ResultScene)
- ResultScene zostaje — ale CleanerScene do niej przechodzi po swoich 60s
- Nie modyfikuj RunnerScene poza zmianą przejścia na CleanerScene
- Placeholder sprites zostają (kolorowe prostokąty/koła) — bez grafik

---

## Plansza — układ przestrzenny

Plansza: **880×880px**, siatka **8×8** pól po **110×110px** każde.
Indeksowanie: kolumna 0–7 (od lewej), rząd 0–7 (od góry).

### Taśma wejściowa (brązowe pola)
Biegnie w kształcie litery L:
- **Lewa krawędź**: kolumna 0, rzędy 0–7 (8 pól, kierunek: z góry na dół)
- **Dolna krawędź**: kolumna 1–7, rząd 7 (7 pól, kierunek: od lewej do prawej)

Złom wjeżdża na pole [0,0] (lewy górny róg) i jedzie w dół → w prawo → wypada za polem [7,7] (prawy dolny róg). Taśma porusza się zawsze, niezależnie od działań gracza.

### Urządzenia (stałe pozycje)
| Urządzenie | Pole (kol, rząd) | Kolor placeholder | Co robi |
|---|---|---|---|
| Oczyszczacz opon/gumy | [1, 0] | Czarny | Usuwa gumę ze złomu |
| Oczyszczacz betonu | [7, 2] | Biały | Usuwa beton ze złomu |
| Oczyszczacz drewna | [7, 3] | Żółty | Usuwa drewno ze złomu |
| Spawarka | [3, 3] | Czerwony | Łączy 3× czysty złom → 1× gruda |

### Inne elementy
| Element | Pole (kol, rząd) | Kolor placeholder | Opis |
|---|---|---|---|
| Wydawka (skup) | [7, 0] | Niebieski | Tu Stormuś wydaje gotową grudę |
| Zwykłe pole | [6, 0] | Brązowy | Blat — można odłożyć element |
| Blaty (odkładanie) | [3,1],[4,1],[4,2],[4,3] | Brązowy | Można odłożyć element tymczasowo |

### Stormuś
- Start: pole [1, 4] (środek planszy, szary obszar)
- Reprezentacja: białe koło, średnica 80px, wycentrowane w polu
- Trzymany element: mały kwadrat 24×24px przyklejony do koła (prawy górny róg koła)
- Kolor trzymanego elementu = kolor typu złomu

---

## Typy złomu na taśmie

| Typ | Kolor placeholder | Co z nim zrobić |
|---|---|---|
| Czysty złom | Zielony | Wrzuć do spawarki (potrzeba 3 sztuk) |
| Złom z gumą | Ciemnoszary | Oczyszczacz opon → czysty złom |
| Złom z betonem | Jasnoszary | Oczyszczacz betonu → czysty złom |
| Złom z drewnem | Pomarańczowy | Oczyszczacz drewna → czysty złom |
| Gruda (gotowa) | Złoty | Wydaj do wydawki |

Kolejność na taśmie: **losowa**. Nowy element pojawia się na polu [0,0] co **3 sekundy** (na starcie). Tempo przyspiesza co 20 sekund (-0.3s, minimum 1.5s między elementami).

---

## Mechanika urządzeń

### Czasy pracy
- Oczyszczacz opon/betonu/drewna: **4 sekundy**
- Spawarka: **6 sekund** (wymaga dokładnie 3 elementów czystego złomu)

### Pasek postępu
Nad każdym urządzeniem: zielony pasek postępu (110×10px) wypełniający się podczas pracy.

### Stany urządzenia
1. **Idle** — czeka na element (normalna obwódka)
2. **Pracuje** — pasek postępu rośnie (animacja pulsowania)
3. **Gotowe** — pasek pełny, miga zielono — czeka na odebranie
4. **Zepsute** — czerwone tło, X na środku, blokada przez **4 sekundy**

### Kiedy urządzenie się psuje
- Wrzucenie złego typu do oczyszczarki (np. złom z drewnem do oczyszczacza gumy)
- Wrzucenie nieoczyszczonego złomu do spawarki
- Psuje się natychmiast przy błędnym wrzuceniu, blokada 4s, potem wraca do Idle

### Spawarka — specjalna logika
- Przyjmuje elementy **jeden po jednym** (3 razy spacja przy urządzeniu)
- Licznik nad spawarką: "1/3", "2/3", "3/3"
- Przy "3/3" automatycznie startuje proces 6s
- Można wrzucić tylko czysty złom — inaczej psucie

---

## Sterowanie

| Klawisz | Akcja |
|---|---|
| WASD lub strzałki | Ruch Stormusia (jedno pole na raz) |
| ALT + kierunek | Skok o 2 pola w danym kierunku |
| SPACJA | Interakcja kontekstowa (zależna od pozycji i stanu) |

### Logika interakcji (SPACJA)
Priorytet sprawdzania sąsiedniego pola (pole przed Stormusiem lub na którym stoi):

1. **Stoi przy taśmie + nic nie trzyma + element na taśmie** → podnosi element, taśma jedzie dalej
2. **Trzyma element + stoi przy urządzeniu Idle** → wrzuca element do urządzenia (walidacja typu!)
3. **Stoi przy urządzeniu Gotowe** → odbiera gotowy element (niezależnie czy coś trzyma — odkłada obecny na blat jeśli jest miejsce)
4. **Trzyma grudę + stoi przy wydawce** → wydaje grudę, +1 do licznika wsadów, punkty
5. **Trzyma element + stoi przy blacie + blat pusty** → odkłada element na blat
6. **Nic nie trzyma + stoi przy blacie + blat zajęty** → podnosi z blatu

### Kierunek Stormusia
Stormuś "patrzy" w kierunku ostatniego ruchu. Interakcja dotyczy pola w kierunku patrzenia.

---

## UI podczas oczyszczalni

### Górny pasek (pełna szerokość, 40px wysokości)
```
[Czas: 60s]    [Wsady: 0/8]    [Punkty: 0]
```

### Licznik w spawarce
Tekst nad spawarką: "0/3" → "1/3" → "2/3" → "3/3 ▶"

### Pasek postępu urządzenia
Zielony prostokąt 100×8px nad urządzeniem, wypełnia się proporcjonalnie do czasu pracy.

### Trzymany element
Mały kwadrat 24×24px przyklejony do koła Stormusia (prawy górny róg), kolor = typ złomu.

---

## System punktacji oczyszczalni

| Zdarzenie | Punkty |
|---|---|
| Gruda wydana do skupu | +200 pkt |
| Element stracony (spadł z taśmy) | 0 pkt (na MVP — brak kary) |
| Urządzenie zepsute | 0 pkt (na MVP — tylko blokada czasowa) |

### Gwiazdki po rundzie
- 1 gwiazdka: ≥ 8 wsadów
- 2 gwiazdki: ≥ 10 wsadów
- 3 gwiazdki: ≥ 12 wsadów

---

## Przejście między scenami

```
RunnerScene (60s) → CleanerScene (60s) → ResultScene
```

### Co przekazać do CleanerScene
Na MVP: ignorujemy worek z runnera, taśma generuje losowy złom.
(Post-MVP: typy złomu na taśmie = to co Stormuś zebrał w runnerze)

### Co przekazać do ResultScene
```javascript
{
  runnerScore: X,      // wynik z runnera
  cleanerScore: Y,     // wynik z oczyszczalni
  wsady: N,            // ile grudów wydanych
  stars: 1|2|3         // gwiazdki
}
```

### ResultScene — zaktualizuj
Pokaż oba wyniki: runner + oczyszczalnia, gwiazdki (1/2/3), łączny wynik, przycisk NASTĘPNA RUNDA i MENU.

---

## Kryteria ukończenia (Definition of Done)

- [ ] CleanerScene ładuje się po zakończeniu RunnerScene
- [ ] Plansza 880×880 z siatką 8×8 widoczna
- [ ] Taśma biegnie L-kształtem i przesuwa elementy
- [ ] Stormuś chodzi po szarym obszarze (WASD/strzałki)
- [ ] ALT+kierunek = skok o 2 pola
- [ ] SPACJA = interakcja kontekstowa (podnoszenie, wrzucanie, odbieranie, wydawanie)
- [ ] Trzymany element widoczny jako kwadrat 24px przy kole
- [ ] 4 urządzenia działają (pasek postępu, stany: idle/pracuje/gotowe/zepsute)
- [ ] Spawarka zlicza 3 elementy przed spawaniem
- [ ] Wydawka przyjmuje grudę i zlicza wsady
- [ ] Timer 60s kończy CleanerScene
- [ ] ResultScene pokazuje wynik runner + oczyszczalnia + gwiazdki
- [ ] CLAUDE.md zaktualizowany
- [ ] git commit + push + GitHub Pages działa

---

## Czego nie robić
- Nie dodawaj grafik — zostają placeholder prostokąty/koła
- Nie implementuj połączenia worka runnera z taśmą (post-MVP)
- Nie dodawaj kar punktowych za straty (post-MVP)
- Nie dodawaj audio
- Nie implementuj generatora planszy — plansza jest hardcoded na Sprint 2
- Nie dodawaj touch/swipe controls (post-MVP)
- Nie zmieniaj RunnerScene poza linią przejścia do CleanerScene
