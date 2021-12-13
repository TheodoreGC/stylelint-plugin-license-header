const { messages, ruleName } = require('.');

testRule({
  plugins: ['./index.js'],
  ruleName,
  config: [true, { license: './sample-header.js' }],
  fix: true,
  accept: [
    {
      code: '/**\n* Copyright 2021 COMPANY Inc, or its subsidiaries.\n* SPDX-License-Identifier: Apache-2.0\n*/',
      description: 'Multi-line license header'
    }
  ],
  reject: [
    {
      code: '// Bad comment',
      fixed: '/**\n* Copyright 2021 COMPANY Inc, or its subsidiaries.\n* SPDX-License-Identifier: Apache-2.0\n*/',
      description: 'Invalid text',
      message: messages.rejected,
      line: 1,
      column: 1
    }
  ]
});
