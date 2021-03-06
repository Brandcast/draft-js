/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule applyEntityToContentBlock
 * @typechecks
 * @flow
 */

'use strict';

import type ContentBlock from 'ContentBlock';

var CharacterMetadata = require('CharacterMetadata');

var nullthrows = require('nullthrows');

function applyEntityToContentBlock(
  contentBlock: ContentBlock,
  start: number,
  end: number,
  entityKey: ?string,
): ContentBlock {
  var characterList = contentBlock.getCharacterList();
  while (start < end) {
    characterList = characterList.set(
      start,
      CharacterMetadata.applyEntity(
        nullthrows(characterList.get(start)),
        entityKey,
      ),
    );
    start++;
  }
  return contentBlock.set('characterList', characterList);
}

module.exports = applyEntityToContentBlock;
