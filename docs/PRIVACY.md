# Privacy and Public Data

## Private Raw Record

The raw mobile record may contain an image, timestamp, exact latitude and
longitude, altitude, GPS accuracy, phone model and device-motion summary. This
combination can reveal a contributor's movements or a sensitive survey site.

Raw records must remain private by default.

## Public Export

A future public export should:

- remove GPS data from image EXIF metadata;
- publish a generalized location such as a grid cell where appropriate;
- suppress sensitive sites and sensitive species locations;
- include the contributor's accepted image and metadata licences;
- keep an audit trail for each transformation;
- support withdrawal or deletion requests where required.

## App Store Preparation

Before public distribution:

1. Review the data flow with the relevant research ethics and data-protection
   contacts.
2. Publish a privacy policy URL.
3. Complete Apple App Privacy declarations.
4. Complete the Google Play Data Safety form.
5. Add a consent screen and a contact route for deletion requests.

## Licence Separation

The app source code uses the MIT Licence. Dataset metadata and photographs need
an explicit licence decision and contributor consent. CC0 can be considered for
open metadata. CC BY 4.0 can be considered for photographs where attribution is
appropriate.
