# Gold Trail camera recognition and geological evidence

The camera workspace includes an experimental, local contrast scanner. It proposes light and dark linear image features, draws masks on the exact analysed frame, and lets the user freeze, select and record a cue. Local photos use the same workflow. Images are not uploaded. Imported photos are saved locally when the user chooses Save photo or attaches a cue to field notes. Camera capture is explicit; closing, hiding or leaving the page stops its tracks and clears the analysed image.

## Photo GPS, map pins and exports

JPEG, PNG and WebP EXIF GPS is read locally on import. No location is inferred when metadata is absent, malformed or declares an unsupported datum. The user can pinpoint a location on the map, enter latitude/longitude, restore the original embedded GPS, or explicitly assign the current phone position. The source and reported accuracy travel with saved photo records and observation exports. A manual pin retains unknown accuracy; the current phone position is not assigned automatically to an older photo.

Saving a located photo stores the image in IndexedDB with GPS embedded in its image metadata, and places a photo marker on the main map. Download photo exports an actual geotagged file, rather than just an observation JSON. JPEG/PNG keep their format; other browser-decodable formats with an assigned location use a JPEG copy. JPEG scan bytes and unrelated EXIF values retain their bytes. New GPS entries use CIPA EXIF latitude/longitude references, WGS-84, a processing-method tag and a positioning-error tag only when accuracy is supplied. User-assigned positions are marked MANUAL. The format is documented in the [CIPA EXIF specification](https://www.cipa.jp/std/documents/e/DC-X008-Translation-2019-E.pdf).

Saved photos reopen from the library or a map marker, including offline after the app has been cached. Photo bytes remain in this browser; downloading creates a separate file. Attaching a photo cue to notes saves the referenced image first so its photo ID remains usable.

## Geological accuracy

The contrast scanner remains part of the app. It is a visual inspection aid, with no validated geological classification. Its outputs must retain `unconfirmed` status. A bright strip is not classified as quartz; a dark strip is not classified as black sand or a crevice. Neither result establishes gold, sediment origin, grain size, depth or recoverability. The thresholds and ranking are engineering choices, not calibrated probabilities or prospectivity scores.

The optional geology button freezes the displayed camera frame and queries GSNSW surface rock units at its captured phone coordinate or an attached photo location. It records the query URL, rounded query coordinate, location source, reported accuracy, retrieval time and returned attributes. It explicitly retains unknown map positional accuracy. The point query neither covers the full location uncertainty area nor identifies the location/material of an object seen through the camera. It never transfers a mapped lithology to a highlighted image region. A photo without a location requires embedded GPS or a user-assigned point before lookup becomes available.

[NSW Seamless Geology](https://www.resources.nsw.gov.au/geological-survey/projects/nsw-seamless-geology-project) combines geological mapping at different scales. [Utah Geological Survey's mineral-identification guide](https://geology.utah.gov/map-pub/survey-notes/glad-you-asked/how-do-geologists-identify-minerals/) explains the physical properties used in identification and the limitations of colour. These references are linked in the camera evidence panel.

Saved cues include their image-coordinate box, capture source and time, geological status and any explicitly loaded map context. Photo capture time remains unknown when only its inspection time is known. Its recorded location carries its EXIF or user-assigned provenance. No screen-relative box is exported as a real-world feature coordinate. User notes and existing historical sources retain their separate meanings.

## Verification on 11 November 2026

Twenty Node tests passed for contrast geometry, uniform-frame abstention, filters, invalid inputs, location provenance, missing/failed geology responses, JPEG/PNG EXIF round trips, both byte orders, preserved orientation/unknown tags, reassignment and historical sample relationships. Nineteen existing browser checks and thirteen photo-location checks passed in desktop Edge, including phone/landscape layout, synthetic camera lifecycle, map selection/cancellation, geotagged downloads, saved photo markers, linked notes and offline reopening. Pillow independently read the exported JPEG and PNG coordinates and MANUAL processing-method tag. The geology integration browser check used an identified fixture response; it is not a live service or geological accuracy test.

Six previously licensed exploratory photos (outcrop, gravel bar, bedrock, calcite, foam and concrete) exercised the image pipeline. All produced the maximum eight appearance proposals. This demonstrates that the contrast scanner responds to conspicuous features across geological and non-geological scenes. These photos have no independent feature masks or verified mineral labels; they do not establish precision, recall or useful geological targeting. No physical Samsung camera, field accuracy, thermal or battery benchmark has been established.

Run the unit checks from the repository root:

```powershell
node --test public/gold-trail/vision-core.test.mjs public/gold-trail/camera-geology.test.mjs public/gold-trail/photo-metadata.test.mjs public/gold-trail/samples.test.mjs
```

Before adding automatic geological labels, obtain independently reviewed field imagery with feature masks, verified class definitions and source/location provenance. Freeze evaluation sites separately from development data, include foam, shadows, wet rock, vegetation and manufactured surfaces as hard negatives, and measure per-class precision/recall, localization errors and calibrated abstention on unseen sites. Define acceptable errors for the intended use before enabling a class. Keep unvalidated classes unavailable as geological identifications while preserving the visual inspection tool.
