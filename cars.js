/* ==========================================================================
   BBW vehicle fleet — cars.js
   Mărci, modele și anii de producție (piața europeană), pentru verificarea
   eligibilității mașinii.

   Format:  'Model': [anul de început, anul de final, combustibili]
            anul de final = null → modelul se produce și în prezent
            combustibili (opțional) = doar pentru modelele care nu au
            variante pe benzină / motorină / GPL. Lipsește = orice combustibil.

   Anii sunt aproximativi (pot diferi cu un an între țări și facelift-uri).
   Site-ul acceptă automat și un an în plus după final, pentru mașinile
   înmatriculate în anul următor. Poți adăuga, corecta sau șterge modele aici.
   Mașinile care nu apar pot fi introduse cu „Altă marcă” / „Alt model”.
   ========================================================================== */
'use strict';

// Combustibili posibili pentru modelele electrice / hibride
const EV = ['Electric'];
const HYB = ['Hibrid'];
const HYB_EV = ['Hibrid', 'Electric'];

const CAR_CATALOG = {
  'Alfa Romeo': {
    '147': [2000, 2010], '156': [1997, 2007], '159': [2005, 2011], 'Giulia': [2016, null],
    'Giulietta': [2010, 2020], 'MiTo': [2008, 2018], 'Stelvio': [2017, null], 'Tonale': [2022, null]
  },
  'Audi': {
    'A1': [2010, null], 'A3': [1996, null], 'A4': [1994, 2025], 'A5': [2007, null], 'A6': [1994, null],
    'A7': [2010, null], 'A8': [1994, null], 'e-tron': [2018, 2024, EV], 'Q2': [2016, null], 'Q3': [2011, null],
    'Q4 e-tron': [2021, null, EV], 'Q5': [2008, null], 'Q7': [2005, null], 'Q8': [2018, null]
  },
  'BMW': {
    'i3': [2013, 2022, EV], 'i4': [2021, null, EV], 'iX': [2021, null, EV], 'iX3': [2020, null, EV],
    'Seria 1': [2004, null], 'Seria 2': [2014, null], 'Seria 3': [1975, null], 'Seria 4': [2013, null],
    'Seria 5': [1972, null], 'Seria 7': [1977, null], 'X1': [2009, null], 'X2': [2018, null],
    'X3': [2003, null], 'X4': [2014, null], 'X5': [1999, null], 'X6': [2008, null]
  },
  'BYD': {
    'Atto 3': [2022, null, EV], 'Dolphin': [2021, null, EV], 'Han': [2020, null, EV], 'Seal': [2022, null, EV],
    'Seal U': [2023, null, HYB_EV], 'Tang': [2018, null, EV]
  },
  'Chevrolet': {
    'Aveo': [2006, 2015], 'Captiva': [2006, 2015], 'Cruze': [2009, 2015], 'Epica': [2006, 2011],
    'Lacetti': [2004, 2011], 'Orlando': [2011, 2015], 'Spark': [2005, 2015], 'Trax': [2013, 2015]
  },
  'Citroën': {
    'Berlingo': [1996, null], 'C-Elysée': [2012, 2022], 'C1': [2005, 2022], 'C3': [2002, null],
    'C3 Aircross': [2017, null], 'C4': [2004, null], 'C4 Cactus': [2014, 2020], 'C4 Picasso': [2006, 2018],
    'C5': [2001, 2017], 'C5 Aircross': [2018, null], 'C5 X': [2021, null], 'ë-C4': [2020, null, EV]
  },
  'Cupra': {
    'Ateca': [2018, null], 'Born': [2021, null, EV], 'Formentor': [2020, null], 'Leon': [2020, null]
  },
  'Dacia': {
    'Bigster': [2025, null], 'Dokker': [2012, 2021], 'Duster': [2010, null], 'Jogger': [2021, null],
    'Lodgy': [2012, 2022], 'Logan': [2004, null], 'Logan MCV': [2006, 2020], 'Sandero': [2008, null],
    'Sandero Stepway': [2009, null], 'Spring': [2021, null, EV]
  },
  'DS': {
    'DS 3': [2010, null], 'DS 4': [2011, null], 'DS 7': [2017, null], 'DS 9': [2020, null]
  },
  'Fiat': {
    '500': [2007, null], '500L': [2012, 2022], '500X': [2014, 2024], 'Bravo': [2007, 2014],
    'Doblo': [2000, null], 'Freemont': [2011, 2016], 'Linea': [2007, 2015], 'Panda': [2003, null],
    'Punto': [1993, 2018], 'Tipo': [2015, null]
  },
  'Ford': {
    'B-Max': [2012, 2017], 'C-Max': [2003, 2019], 'EcoSport': [2014, 2022], 'Fiesta': [1976, 2023],
    'Focus': [1998, 2025], 'Fusion': [2002, 2012], 'Galaxy': [1995, 2023], 'Grand C-Max': [2010, 2019],
    'Ka': [1996, 2019], 'Kuga': [2008, null], 'Mondeo': [1993, 2022], 'Mustang Mach-E': [2020, null, EV],
    'Puma': [2019, null], 'S-Max': [2006, 2023]
  },
  'Honda': {
    'Accord': [1976, 2015], 'Civic': [1972, null], 'CR-V': [1995, null], 'e:Ny1': [2023, null, EV],
    'HR-V': [1999, null], 'Jazz': [2001, null], 'ZR-V': [2023, null]
  },
  'Hyundai': {
    'Accent': [2000, 2012], 'Bayon': [2021, null], 'Elantra': [2000, 2016], 'Getz': [2002, 2011],
    'i10': [2007, null], 'i20': [2008, null], 'i30': [2007, null], 'i40': [2011, 2019],
    'Ioniq': [2016, 2022, HYB_EV], 'Ioniq 5': [2021, null, EV], 'Ioniq 6': [2022, null, EV], 'ix20': [2010, 2019],
    'ix35': [2009, 2015], 'Kona': [2017, null], 'Santa Fe': [2000, null], 'Tucson': [2004, null]
  },
  'Jeep': {
    'Avenger': [2022, null], 'Cherokee': [2000, 2023], 'Compass': [2006, null],
    'Grand Cherokee': [1993, null], 'Renegade': [2014, null]
  },
  'Kia': {
    'Carens': [1999, 2019], 'Ceed': [2006, null], 'Cerato': [2003, 2009], 'EV3': [2024, null, EV],
    'EV6': [2021, null, EV], 'EV9': [2023, null, EV], 'Niro': [2016, null, HYB_EV], 'Optima': [2010, 2020],
    'Picanto': [2004, null], 'ProCeed': [2007, null], 'Rio': [2000, 2023], 'Sorento': [2002, null],
    'Soul': [2008, null], 'Sportage': [1993, null], 'Stinger': [2017, 2023], 'Stonic': [2017, null],
    'Venga': [2009, 2019], 'XCeed': [2019, null]
  },
  'Lancia': {
    'Delta': [2008, 2014], 'Ypsilon': [2003, null]
  },
  'Lexus': {
    'CT': [2011, 2022], 'ES': [2018, null], 'GS': [1993, 2020], 'IS': [1999, null], 'LBX': [2023, null],
    'LS': [1989, null], 'NX': [2014, null], 'RX': [1998, null], 'UX': [2018, null]
  },
  'Mazda': {
    'CX-3': [2015, 2022], 'CX-30': [2019, null], 'CX-5': [2012, null], 'CX-60': [2022, null],
    'Mazda2': [2003, null], 'Mazda3': [2003, null], 'Mazda6': [2002, 2024], 'MX-30': [2020, null, HYB_EV]
  },
  'Mercedes-Benz': {
    'CLA': [2013, null], 'Clasa A': [1997, null], 'Clasa B': [2005, null], 'Clasa C': [1993, null],
    'Clasa E': [1993, null], 'Clasa S': [1972, null], 'Clasa V': [1996, null], 'CLS': [2004, 2023],
    'EQA': [2021, null, EV], 'EQB': [2021, null, EV], 'EQC': [2019, 2023, EV], 'EQE': [2022, null, EV], 'EQS': [2021, null, EV],
    'GLA': [2014, null], 'GLB': [2019, null], 'GLC': [2015, null], 'GLE': [2015, null], 'GLS': [2016, null],
    'Vito': [1996, null]
  },
  'MG': {
    'HS': [2019, null], 'Marvel R': [2021, 2023, EV], 'MG3': [2013, null], 'MG4': [2022, null, EV],
    'MG5': [2020, null, EV], 'ZS': [2017, null]
  },
  'Mini': {
    'Clubman': [2007, 2024], 'Cooper': [2001, null], 'Countryman': [2010, null]
  },
  'Mitsubishi': {
    'ASX': [2010, null], 'Colt': [2002, null], 'Eclipse Cross': [2017, null], 'Lancer': [2003, 2017],
    'Outlander': [2001, null], 'Space Star': [2012, 2024]
  },
  'Nissan': {
    'Almera': [1995, 2006], 'Ariya': [2022, null, EV], 'Juke': [2010, null], 'Leaf': [2010, null, EV],
    'Micra': [1982, null], 'Note': [2006, 2017], 'Primera': [1990, 2008], 'Pulsar': [2014, 2018],
    'Qashqai': [2007, null], 'X-Trail': [2001, null]
  },
  'Opel': {
    'Adam': [2013, 2019], 'Agila': [2000, 2014], 'Astra': [1991, null], 'Combo': [1994, null],
    'Corsa': [1982, null], 'Crossland': [2017, 2024], 'Grandland': [2017, null], 'Insignia': [2008, 2022],
    'Meriva': [2003, 2017], 'Mokka': [2012, null], 'Vectra': [1988, 2008], 'Zafira': [1999, 2019]
  },
  'Peugeot': {
    '107': [2005, 2014], '108': [2014, 2021], '206': [1998, 2012], '207': [2006, 2014],
    '208': [2012, null], '301': [2012, 2022], '307': [2001, 2008], '308': [2007, null],
    '407': [2004, 2011], '408': [2022, null], '508': [2010, null], '2008': [2013, null],
    '3008': [2009, null], '5008': [2009, null], 'Partner': [1996, 2018], 'Rifter': [2018, null]
  },
  'Renault': {
    'Arkana': [2019, null], 'Austral': [2022, null], 'Captur': [2013, null], 'Clio': [1990, null],
    'Espace': [1984, null], 'Fluence': [2009, 2016], 'Grand Scenic': [2004, 2022], 'Kadjar': [2015, 2022],
    'Kangoo': [1997, null], 'Koleos': [2008, 2023], 'Laguna': [1994, 2015], 'Megane': [1995, 2024],
    'Megane E-Tech': [2022, null, EV], 'Scenic': [1996, null], 'Symbol': [2008, 2013], 'Talisman': [2015, 2022],
    'Thalia': [1999, 2008], 'Zoe': [2012, 2024, EV]
  },
  'Seat': {
    'Alhambra': [1996, 2020], 'Altea': [2004, 2015], 'Arona': [2017, null], 'Ateca': [2016, null],
    'Exeo': [2008, 2013], 'Ibiza': [1984, null], 'Leon': [1999, null], 'Tarraco': [2018, null],
    'Toledo': [1991, 2019]
  },
  'Skoda': {
    'Citigo': [2011, 2020], 'Elroq': [2024, null, EV], 'Enyaq': [2020, null, EV], 'Fabia': [1999, null],
    'Kamiq': [2019, null], 'Karoq': [2017, null], 'Kodiaq': [2016, null], 'Octavia': [1996, null],
    'Rapid': [2012, 2019], 'Roomster': [2006, 2015], 'Scala': [2019, null], 'Superb': [2001, null],
    'Yeti': [2009, 2017]
  },
  'Smart': {
    '#1': [2022, null, EV], '#3': [2023, null, EV], 'ForFour': [2004, 2019]
  },
  'Subaru': {
    'Forester': [1997, null], 'Impreza': [1992, null], 'Legacy': [1989, 2017], 'Outback': [1994, null],
    'XV': [2011, 2023]
  },
  'Suzuki': {
    'Across': [2020, null, HYB], 'Baleno': [2016, 2020], 'Ignis': [2000, null], 'S-Cross': [2013, null],
    'Splash': [2008, 2015], 'Swace': [2020, null, HYB], 'Swift': [2004, null], 'SX4': [2006, 2014],
    'Vitara': [2015, null]
  },
  'Tesla': {
    'Model 3': [2017, null, EV], 'Model S': [2012, null, EV], 'Model X': [2015, null, EV], 'Model Y': [2020, null, EV]
  },
  'Toyota': {
    'Auris': [2006, 2019], 'Avensis': [1997, 2018], 'Aygo': [2005, 2022], 'Aygo X': [2022, null],
    'bZ4X': [2022, null, EV], 'C-HR': [2016, null, ['Benzină', 'Benzină + GPL', 'Hibrid']], 'Camry': [2001, null], 'Corolla': [1966, null],
    'Corolla Cross': [2022, null, HYB], 'Highlander': [2001, null], 'Land Cruiser': [1951, null],
    'Prius': [1997, null, HYB], 'Prius+': [2011, 2021, HYB], 'Proace City Verso': [2019, null], 'RAV4': [1994, null],
    'Verso': [2004, 2018], 'Yaris': [1999, null], 'Yaris Cross': [2021, null]
  },
  'Volkswagen': {
    'Arteon': [2017, 2024], 'Bora': [1998, 2005], 'Caddy': [1996, null], 'Golf': [1974, null],
    'ID.3': [2019, null, EV], 'ID.4': [2020, null, EV], 'ID.5': [2021, null, EV], 'ID.7': [2023, null, EV],
    'Jetta': [2005, 2018], 'Passat': [1973, null], 'Polo': [1975, null], 'Sharan': [1995, 2022],
    'T-Cross': [2019, null], 'T-Roc': [2017, null], 'Taigo': [2021, null], 'Tiguan': [2007, null],
    'Touareg': [2002, null], 'Touran': [2003, null], 'Up!': [2011, 2023]
  },
  'Volvo': {
    'C40': [2021, null, EV], 'EX30': [2023, null, EV], 'S40': [1995, 2012], 'S60': [2000, null], 'S80': [1998, 2016],
    'S90': [2016, null], 'V40': [1995, 2019], 'V50': [2004, 2012], 'V60': [2010, null], 'V70': [1996, 2016],
    'V90': [2016, null], 'XC40': [2017, null], 'XC60': [2008, null], 'XC90': [2002, null]
  }
};
