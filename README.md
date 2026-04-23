# OKT-Näyttö <> Ruokailijatiedot -seurantasovellus

Tämä on Reactilla ja Node.js:llä toteutettu sovelluksen prototyyppi jonka tarkoituksena
on auttaa koulun ruokaloita ja heidän henkilökuntaansa seuraamaan ja tilastoimaan päivittäisiä ruokailijamääriä.

## Ominaisuudet

* **Salasanaton kirjautuminen (Magic Link):** Käyttäjät voivat kirjautua sisään turvallisesti sähköpostiin lähetettävällä kertakäyttöisellä linkillä.
*  **Automaattinen tallennus:** Ruokamäärät voi syöttää nopeasti, tieto tallentuu taustalla automaattisesti 800ms viiveellä ilman erillistä tallennuspainiketta.
*  **Tapahtumaloki:** Järjestelmä pitää kirjaa siitä kuka on kirjautunut sisään, ja kuka muokkaa mitäkin ateriamääriä ja esittelee lokit käyttäen MUI:n DataGridillä toteutettua taulukkoa.


## Teknologiat
* **Frontend:** React, Vite, React Router, Material-UI (DataGrid), Hot Toast
* **Backend:** Node.js, Express, Mongoose, JsonWebToken, Resend
* **Tietokanta:** MongoDB Atlas
* **Palvelin:** Render

---

## Paikallinen kehitys

### 1. Esivaatimukset
* Node.js asennettuna
* MongoDB Atlas -tietokanta (tai lokaali versio)
* Resend.com -tili

### 2. .env

Tarvitset kaksi `.env` -tiedostoa.

**Frontend-kansioon:**

```VITE_API_URL=http://localhost:3001/api```

**Backend-kansioon:**

```
PORT=3001
MONGODB_URI=merkkijono_tahan
JWT_SECRET=eivarmaantarvitseselittää
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=tähän
```

### 3. Käynnistys

**Terminaali 1 (Backend):**

```bash
cd server
npm install
npm run dev
```

**Terminaali 2 (Frontend):**

```bash
cd Ruokailijatiedot
npm install
npm run dev
```

Sovellus on nyt auki osoitteessa http.//localhost:5173.
