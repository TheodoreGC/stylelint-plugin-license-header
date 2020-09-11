# stylelint-plugin-license-header

A plugin to validate the presence of a license header in style files.

## Installation

```sh
npm install --save-dev stylelint-plugin-license-header
```

## Usage

Add it to the plugins section of your `.stylelintrc` configuration file:

```json
{
  "plugins": [
    "stylelint-plugin-license-header"
  ]
}
```

Then add and configure the rule under the rules section:

```json
{
  "rules": {
    "plugin/license-header": [true, { "license": "./license-header.js" }]
  }
}
```

To [auto-fix](https://stylelint.io/user-guide/usage/options#fix) your style files:

```sh
stylelint --fix .
```

## Supported Rules

- [`plugin/license-header`](./README.md): check for the presence of a license header

## License

[MIT](./LICENSE)
