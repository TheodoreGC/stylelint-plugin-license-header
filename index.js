const fs = require('fs');
const stylelint = require('stylelint');

const ruleName = 'plugin/license-header';
const messages = stylelint.utils.ruleMessages(ruleName, { rejected: 'Invalid license header' });

const CLEANUP_REGEX = /[\/**\/\r?\n|\r ]/;

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

function countNewLines(text, newLine, side) {
  if (!['left', 'right'].includes(side)) {
    throw new Error(`invalid side <${side}>, unable to count new lines`);
  }

  if (side === 'right') {
      text = text.split('').reverse().join('');
      newLine = newLine.split('').reverse().join('');
  }

  let newLinesCount = 0;

  for (let i = 0; i < text.length;) {
      // Support both "\n" and "\r\n"
      for (let y = 0; y < newLine.length; ++y) {
          if (text.charAt(i) !== newLine.charAt(y)) {
              return newLinesCount;
          }

          ++i;
      }

      ++newLinesCount;
  }

  return newLinesCount;
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

    // Count trailing new lines to keep them after the header comment
    const trailingNewLinesCount = countNewLines(
        licenseHeader,
        context.newline,
        'right',
    ) + 1; // always add at least one

    if (firstComment) {
      const licenseHeaderText = licenseHeader.replace(new RegExp(CLEANUP_REGEX, 'g'), '');
      const firstCommentText = firstComment.text.replace(new RegExp(CLEANUP_REGEX, 'g'), '');
      let newLinesAfterFirstComment = countNewLines(
          firstComment.raws.after || '',
          context.newline,
          'right',
      );


      // Also count new lines before the next node (if any)
      if (firstComment.next()) {
        newLinesAfterFirstComment += countNewLines(
            firstComment.next().raws.before || '',
            context.newline,
            'left',
        );
      }

      if (firstCommentText === licenseHeaderText && trailingNewLinesCount === newLinesAfterFirstComment) return;

      if (firstComment.parent === postcssRoot) {
        firstComment.remove();
      }
    }

    if (context.fix) {
      postcssRoot.prepend(licenseHeader);

      const nextNode = postcssRoot.nodes[1];

      if (nextNode) {
        const existingBefore = nextNode.raws.before || '';

        nextNode.raws.before = context.newline.repeat(trailingNewLinesCount) + existingBefore;
      }

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
