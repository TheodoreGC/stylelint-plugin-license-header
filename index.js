const fs = require('fs');
const stylelint = require('stylelint');

const ruleName = 'plugin/license-header';
const messages = stylelint.utils.ruleMessages(ruleName, { rejected: 'Invalid license header' });

const CLEANUP_REGEX = /[\/**\/\n ]/;

function readLicenseFile(path) {
  if (!path) {
    throw new Error('missing license header path');
  }

  try {
    return fs.readFileSync(path, 'utf-8');
  } catch (e) {
    throw new Error(`could not read license header from <${path}>`);
  }
}

const newLicenseHeader = (primaryOptions, secondaryOptions = {}, context) => (postcssRoot, postcssResult) => {
  const validOptions = stylelint.utils.validateOptions(
    postcssResult,
    ruleName,
    { actual: primaryOptions },
    {
      actual: secondaryOptions,
      possible: {
        license: value => typeof value === 'string'
      },
      optional: false
    });

    if (!validOptions) return;

    let firstComment = null;
    postcssRoot.walkComments(comment => {
      if (firstComment) return;
      firstComment = comment;
    });

    const licenseHeader = readLicenseFile(secondaryOptions.license);

    if (firstComment) {
      const licenseHeaderText = licenseHeader.replace(new RegExp(CLEANUP_REGEX, 'g'), '');
      const firstCommentText = firstComment.text.replace(new RegExp(CLEANUP_REGEX, 'g'), '');

      if (firstCommentText === licenseHeaderText) return;

      if (firstComment.parent === postcssRoot) {
        firstComment.remove();
      }
    }

    if (context.fix) {
      postcssRoot.prepend(licenseHeader);
      return;
    }

    stylelint.utils.report({
      message: messages.rejected,
      node: firstComment || postcssRoot,
      result: postcssResult,
      ruleName
    });
};

module.exports = stylelint.createPlugin(ruleName, newLicenseHeader);

module.exports.ruleName = ruleName;
module.exports.messages = messages;
