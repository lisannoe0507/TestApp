# Side Quest

Een Tinder-achtige app die willekeurige evenementen, cursussen, restaurants en
locaties aanbeveelt op basis van jouw voorkeuren voor afstand, groepsgrootte
en prijs. Swipe rechts om op te slaan, links om over te slaan.

Gebouwd met [Expo](https://expo.dev) (React Native), zodat één codebase naar
zowel de Apple App Store als Google Play / Samsung Galaxy Store gepubliceerd
kan worden.

## Lokaal draaien

```bash
npm install
npm start          # opent Expo Dev Tools, scan de QR met Expo Go
npm run ios        # alleen op macOS
npm run android
npm run web
```

## Data

De app draait nu op voorbeelddata (`src/data/quests.ts`). Wil je live
aanbevelingen op basis van echte lokale plekken? Koppel een van deze API's:

- Google Places API — console.cloud.google.com
- Ticketmaster Discovery API — developer.ticketmaster.com
- Eventbrite API — eventbrite.com/platform/api

Vervang de inhoud van `src/data/quests.ts` (of `AppContext`'s `deck`-logica)
door een API-call die dezelfde `Quest[]`-vorm teruggeeft; de rest van de app
hoeft niet aangepast te worden.

## Publiceren naar de app stores

Dit project gebruikt [EAS Build](https://docs.expo.dev/build/introduction/)
om installeerbare builds te maken zonder dat je zelf Xcode/Android Studio
hoeft te configureren.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios       # vereist een Apple Developer account (€99/jaar)
eas build --platform android   # levert een .aab op voor Google Play / Samsung
```

- **Apple App Store**: meld je aan voor het Apple Developer Program
  (developer.apple.com/programs), en dien de `.ipa`/build in via
  `eas submit --platform ios` of App Store Connect.
- **Google Play / Samsung Galaxy Store**: eenmalig €25 (Play) resp. gratis
  (Samsung Seller Portal), upload de `.aab` via play.google.com/console of
  seller.samsung.com.

Vergeet niet vóór publicatie een eigen app-icoon en splash screen in
`assets/` te plaatsen, en `app.json` (naam, bundle id, versie) na te lopen.
