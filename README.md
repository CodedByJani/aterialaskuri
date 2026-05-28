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
## Ominaisuudet
* **Viikkonäkymä:** Näyttää viikon kerrallaan ja käyttäjä voi muokata lounastietoja
* **Suodatus:** näytä vain lounaat
* **Navigointi viikoittain:** edellinen / seuraava viikko
* **Historia:** vanhojen tietojen tarkastelu startDate - endDate suodatuksella

## E2E testaus

### Ladattavat riippuvuudet
* npm install -D @playwright/test
* npx playwright install

Tee `.env.test` backend kansioon

```
MONGODB_URI_TEST=mongodb+srv://USERNAME:PASSWORD@aterialaskuri.s82igfi.mongodb.net/aterialaskuri_test?retryWrites=true&w=majority&appName=aterialaskuri

JWT_SECRET=eitarvitseselittää
PORT=3001
FRONTEND_URL=http://localhost:5173
```
### Tärkeää
* Älä IKINÄ committaa oikeita tunnuksia
* Käytä erillistä testidatabasea
```
aterialaskuri_test
```
* ÄLÄ käytä production databasea testeissä
* Testidatabase voidaan tyhjentää vapaasti E2E-testien aikana
### E2E test scripts
e2e kansio `package.json`:
```
"scripts": {
    "test": "playwright test"
}
```
### Backend test scripts
backend kansio `package.json`:
```
"scripts": {
    "start:test": "cross-env NODE_ENV=test node index.js"
}
```
### Miten käynnistää
cd aterialaskuri/server
* backendissä npm run start:test

cd aterialaskuri/ruokailijatiedot
* frontendissä npm run dev

cd aterialaskuri/e2e
* npx playwright test

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

Sovellus on nyt auki osoitteessa http://localhost:5173.

## Tunnetut ongelmat

* Inputtia testaaviissa e2e testeiissä syötetty numero häviää joskus välittömästi .fill('') jälkeen ja joskus menee läpi
* E2E-testit vaativat sekä frontendin että backendin käynnissä

## Jatkokehitysideat

* esedu.fi alidomainin (esim. mail.esedu.fi) DNS-tietueet (SPF, DKIM, DMARC) Resend-palveluun
* Vanhan datan varmuuskopiointi
* Olemassa olevan datan haku jos mahdollista niin suoraan exelistä