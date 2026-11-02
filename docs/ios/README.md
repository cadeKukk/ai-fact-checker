# Native iOS app

The former Swift project has been rebuilt around the current web app. Open `AI Fact Checker.xcodeproj`, select **AI Fact Checker**, and run on an iPhone or iPad simulator. Minimum deployment target: **iOS 17**. Development was validated with Xcode 26.6.

Previews: [iPhone Learn](iphone-learn.png), [iPad Learn](ipad-learn.png), [iPhone Compare](iphone-compare.png).

## What is implemented

- The five web sections: Learn, Companies, Fact Check, Compare, Sources.
- Outfit typography, the web color palette, hairline cards, mobile bottom navigation, and an adaptive iPad sidebar.
- All 9 introductory lessons and 7 advanced lessons, with persistent progress and the advanced-course completion gate.
- Native 10-question quizzes drawn from the same 46 illustrated terms, alternating question types, explanation cards, streak bonuses, and lifetime statistics.
- 23 companies, 85 systems including historical entries, 62 fact-check answers, 86 terms, benchmarks, and 204 deduplicated sources from the current local web catalog.
- Search, company/category/source/confidence filters, glossary chains, model/benchmark popups, source links, native sharing, and model comparison with the web scoring formulas and awards.
- An optional feedback form connected to the existing website endpoint. There are no service keys in the app. The form sends only after the user presses Send, and retains its contents after a network failure.
- Bundled app icon, font licenses, privacy manifest, and an in-app privacy explanation.

## Architecture

Navigation, page layouts, reference content, walkthrough controls, quizzes, progress, search, and comparison are **SwiftUI**. The complex educational illustrations reuse the web app's React/SVG/canvas implementations in small, local `WKWebView` panels inside native lesson screens. No screen loads the hosted web app. The 62 illustrations are bundled, isolated from network access by a content security policy, use an ephemeral WebKit data store, and require no server.

The native walkthrough and simple diagrams use SwiftUI. Platform navigation controls, SF Symbols, and some narrow-screen arrangements differ from the website. The bundled illustrations preserve the web's detailed visual behavior.

`AppStore` owns navigation and local state. `catalog.json` is decoded into strongly typed models. Sources use their URL as SwiftUI identity because the web catalog contains reused source IDs. Course progress, statistics, and comparison selections are saved in app-scoped UserDefaults. iOS and website progress are independent; no account or synchronization service was added.

The existing bundle identifier (`none.AI-Fact-Checker`) and development team were preserved. No deployment, signing-account changes, or App Store upload was performed.

## Refreshing shared content

From the repository root, using the dependencies already installed in `web/`:

```sh
node scripts/sync-ios-content.cjs
node scripts/build-ios-visuals.cjs
```

The first script evaluates the actual TypeScript data modules and exports their resolved values, including attached citations and verification notes. It validates record identities and the practice visual mapping. The second uses the existing TypeScript, Next-bundled webpack, and Tailwind packages to generate the offline illustrations. Generated intermediate files go in ignored `.ios-generated/`; distributable resources are checked into the iOS source folder. A normal Xcode build does not need Node or network access.

The Outfit font is bundled with its OFL license. `scripts/render-ios-icon.swift` rasterizes the web's shield vector into an opaque 1024px App Store icon. JavaScript dependency licenses are bundled in `ThirdParty-LICENSES.txt`.

## Validation

```sh
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
xcodebuild -project 'AI Fact Checker.xcodeproj' -scheme 'AI Fact Checker' \
  -configuration Debug -sdk iphonesimulator -derivedDataPath .ios-build \
  CODE_SIGNING_ALLOWED=NO ARCHS=arm64 build
node scripts/test-ios-core.cjs
xcrun swift -module-cache-path /tmp/aifc-visual-module-cache scripts/verify-ios-visuals.swift
```

Final validation: Debug simulator and unsigned Release device builds passed; 5,927 core assertions passed; all 62 illustrations passed WebKit loading, UTF-8, and width checks. The app was inspected on iPhone 17 / iOS 26.5, iPhone 16e / iOS 18.5, and iPad Pro 11-inch / iOS 26.5 simulators.

The core regression runner compiles the real Swift data, store, scoring, and quiz code. It compares every model against the actual web scoring functions, then checks 100 randomized quizzes, duplicate-tap protection, streaks, persistent state, course gating, and validated deep links. The WebKit runner loads every one of the 62 shipped illustrations at 350pt width and checks for JavaScript failures and horizontal overflow. It does not contact external websites.

Feedback delivery has not been exercised against the live endpoint, to avoid sending a test message to the developer. The app surfaces server configuration and offline errors. Before release, test a real submission with your configured backend.

## Deep links

The app registers the custom URL scheme `aifactchecker`. Examples:

```text
aifactchecker://learn?lesson=5
aifactchecker://learn/advanced?lesson=2
aifactchecker://learn/practice
aifactchecker://companies/moonshot/kimik3
aifactchecker://compare?models=kimik3,gpt56sol,claudeopus5
```

Debug builds also accept `--route <aifactchecker URL>` as a launch argument for reproducible simulator checks. This hook is excluded from Release builds.

Advanced links respect the course lock. Invalid lesson indices are clamped; unknown and duplicate model IDs are ignored. Share buttons use the existing public website URLs. Universal Links require a domain association file and signing entitlements and are not configured.

## Before App Store submission

1. Confirm your final bundle identifier before distributing the first signed build; select your Apple Developer team and archive for a physical iOS device.
2. Run the full flow on real iPhone and iPad hardware, including VoiceOver, accessibility text sizes, rotation, offline use, feedback failure/success, and performance with long lessons.
3. Publish a public privacy-policy URL and support URL, and complete App Store Connect's privacy answers, age rating, metadata, and screenshots. The app's manifest describes its app-scoped UserDefaults use and optional feedback content. Review the hosting/email providers' practices for the final privacy disclosures.
4. Review the dated AI catalog for accuracy and source quality before release. This rebuild copies the supplied web content; it is not a new factual audit of all AI claims.
5. Test the signed build through TestFlight and submit it for review. App Review approval is a separate step.

Apple references: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App privacy details](https://developer.apple.com/app-store/app-privacy-details/), and [required-reason API declarations](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype).
