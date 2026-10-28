# BBW vehicle fleet — site de recrutare șoferi Bolt / Uber

**Versiunea live:** https://vladutbabau.github.io/bbw-vehicle-fleet/

Site static (HTML + CSS + JavaScript vanilla), fără framework-uri și fără backend.

## Structura proiectului

```
bbw-fleet/
├── index.html   → structura paginii (toate secțiunile + politica de confidențialitate în fereastră modală)
├── style.css    → design, culori, animații, responsive (mobile-first)
├── script.js    → configurare, meniu, formulare, verificare mașină, WhatsApp, FAQ, animații
├── cars.js      → lista de mărci și modele pentru verificarea mașinii
└── README.md    → acest fișier
```

Secțiuni: Header sticky · Hero · Bandă animată · Avantaje · Cum funcționează · Formular de înscriere · Contact · Întrebări frecvente · CTA final · Footer · Buton WhatsApp flotant.

## Rulare locală

- Cel mai simplu: dublu-click pe `index.html` (se deschide în browser).
- Recomandat (ca pe un server real): în folderul proiectului rulează
  `python3 -m http.server 8000` și deschide `http://localhost:8000`.

## Ce modifici și unde

### Numele flotei, telefon, WhatsApp, e-mail
Totul se modifică în **`script.js`**, în obiectul `CONFIG` de la început:

```js
fleetName: 'BBW vehicle fleet',
phoneDisplay: '0752 266 727',   // cum apare pe site
phoneTel: '+40752266727',       // pentru apel (tel:)
whatsapp: '40752266727',        // DOAR cifre, cu prefixul 40, fără + sau spații
email: 'babauvlad@gmail.com',
```

JavaScript actualizează automat toate butoanele și textele marcate cu `data-contact`, `data-contact-label` și `data-fleet-name`.
Textele din `index.html` conțin aceleași valori ca rezervă (dacă JS e dezactivat) — dacă schimbi datele, schimbă-le ideal și acolo.
Titlul paginii, meta description și Open Graph din `<head>` se modifică direct în `index.html`.

### Mărci și modele (verificarea mașinii)
În `cars.js`, fiecare marcă are modelele ei, cu anii de producție: `'Corolla': [1966, null]`
(primul an, ultimul an; `null` = se produce și acum). Anul fabricației din formular arată doar anii posibili pentru modelul ales.
Adaugă, corectează sau șterge modele direct acolo.
Mașinile care lipsesc pot fi introduse de șofer cu „Altă marcă” / „Alt model”.
Cerințele (vechime, uși, locuri etc.) se modifică în `CONFIG.vehicleRules` din `script.js`.

### Orașele
În `index.html`, în `<select id="f-city">`, adaugă sau elimină opțiuni `<option value="Oraș">Oraș</option>`.

### Condiții comerciale (comisioane, bonusuri, mașini disponibile)
Nu apar pe site până nu le confirmi. Adaugă-le în `CONFIG.offers`:

```js
offers: [
  { title: 'Comision flotă', text: 'X% — detalii la discuție.' }
]
```

### Culori
În `style.css`, în blocul `:root` de la început:
- `--accent` / `--accent-hover` → culoarea principală (acum galben-verzui `#c8f45a`)
- `--bg`, `--surface` → nuanțele de fundal
- `--wa` → verdele butoanelor WhatsApp

### Imagini
- Hero: acum folosește o ilustrație animată (hartă cu traseu), care nu depinde de nicio imagine externă.
  Pentru o fotografie: pune fișierul în `images/hero.jpg` și setează `heroImage: 'images/hero.jpg'` în `CONFIG`.
  Dacă imaginea nu se încarcă, site-ul revine automat la ilustrație.
  Surse gratuite cu licență potrivită: Unsplash, Pexels (verifică licența fiecărei fotografii).
- Favicon: în `index.html`, înlocuiește linia `<link rel="icon" ...>` cu `<link rel="icon" href="favicon.png">`.
- Imagine pentru distribuirea pe rețele sociale: decomentează `og:image` și `og:url` din `<head>` după ce ai domeniul.

## Cum funcționează formularul (fără backend)

1. Utilizatorul completează formularul; câmpurile sunt validate în browser.
2. Apasă „Continuă” și vede mesajul generat.
3. Apasă „Trimite înscrierea pe WhatsApp” → se deschide WhatsApp cu mesajul precompletat (codificat cu `encodeURIComponent`).
4. **Înscrierea ajunge la tine doar după ce persoana apasă „Trimite” în WhatsApp.**

Site-ul nu salvează nimic (nici în localStorage) și nu trimite date în fundal. Nu afișează „trimis cu succes”, pentru că site-ul nu poate ști dacă mesajul a fost trimis efectiv în WhatsApp.

Limitări: înscrierile nu se adună automat într-o listă; depinzi de WhatsApp instalat pe dispozitivul candidatului (pe calculator se deschide WhatsApp Web); poți pierde candidați care deschid WhatsApp dar nu mai apasă „Trimite”.

### Dacă vrei ca înscrierile să ajungă automat pe e-mail sau într-o bază de date

Variante realiste, de la simplu la complex:
- **Serviciu de formulare** (ex. Formspree, Web3Forms, Getform): creezi cont, primești un endpoint, iar formularul trimite datele prin `fetch` și le primești pe e-mail. Ai nevoie de endpoint-ul real din contul tău — nu e configurat în cod.
- **Google Forms / Google Sheets** prin Google Apps Script: înscrierile ajung într-un tabel.
- **Backend propriu** (Node.js/PHP + bază de date) pe hosting: control total, dar necesită dezvoltare și întreținere.

În toate cazurile, actualizează politica de confidențialitate (serviciul folosit devine destinatar al datelor), iar mesajul de succes poate fi afișat abia după confirmarea primită de la server.

## Înainte de publicare — obligatoriu

- Completează în footer și în politica de confidențialitate: denumirea operatorului, CUI, nr. Reg. Com., adresa sediului, perioada de păstrare a datelor (caută `[DE COMPLETAT]`, `[CUI]` etc. în `index.html`).
- Verifică textul politicii de confidențialitate, ideal cu un specialist în protecția datelor. Modelul inclus nu înlocuiește obligațiile legale.
- Dacă adaugi Google Analytics, Facebook Pixel etc., ai nevoie de banner de cookie-uri și de actualizarea politicii.
- Fonturile vin de la Google Fonts; pentru zero transfer către terți, le poți descărca și găzdui local.

## Publicare
Orice hosting static: Netlify, Vercel, Cloudflare Pages, GitHub Pages sau hostingul tău (urci cele trei fișiere în `public_html`).
