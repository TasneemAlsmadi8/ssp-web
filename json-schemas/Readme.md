## To generate JSON schemas from TS interfaces:

`ts-json-schema-generator --path 'interfaces.ts' --type 'PdfJson' -o PdfJson.schema.json`
`ts-json-schema-generator --path 'interfaces.ts' --type 'PdfJsonTemplate' -o PdfJsonTemplate.schema.json`

## To apply them in VS Code

- go to settings.json OR (ctrl+,) and search for "json"
- update "json.schemas" to the following:
  ` "json.schemas": [
  {
    "fileMatch": [
      "**/*.template.json",
    ],
    "url": "/Users/user/Desktop/json-schema-project/PdfJsonTemplate.schema.json"
  },
  {
    "fileMatch": [
      "**/*.pdf.json",
    ],
    "url": "/Users/user/Desktop/json-schema-project/PdfJson.schema.json"
  },
]`
- NOTE: modify example url path to where you saved the schemas