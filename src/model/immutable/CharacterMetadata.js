/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CharacterMetadata
 * @typechecks
 * @flow
 */

'use strict';

import type {DraftInlineStyle} from 'DraftInlineStyle';

var {
  Map,
  OrderedSet,
  Record,
} = require('immutable');

type CharacterMetadataConfig = {
  style?: DraftInlineStyle,
  entity?: ?string,
};

type RecordProps = {
  style: DraftInlineStyle,
  entity: ?string,
};

const EMPTY_SET = OrderedSet();

var defaultRecord: RecordProps = {
  style: EMPTY_SET,
  entity: null,
};

var CharacterMetadataRecord = Record(defaultRecord);

class CharacterMetadata extends CharacterMetadataRecord<RecordProps> {
  getStyle(): DraftInlineStyle {
    return this.get('style');
  }

  getEntity(): ?string {
    return this.get('entity');
  }

  hasStyle(style: string): boolean {
    return this.getStyle().includes(style);
  }

  static applyStyle(
    record: CharacterMetadata,
    style: string,
  ): CharacterMetadata {
    var withStyle = record.set('style', record.getStyle().add(style));
    return CharacterMetadata.create(withStyle);
  }

  static removeStyle(
    record: CharacterMetadata,
    style: string,
  ): CharacterMetadata {
    var withoutStyle = record.set('style', record.getStyle().remove(style));
    return CharacterMetadata.create(withoutStyle);
  }

  static applyEntity(
    record: CharacterMetadata,
    entityKey: ?string,
  ): CharacterMetadata {
    var withEntity = record.getEntity() === entityKey ?
      record :
      record.set('entity', entityKey);
    return CharacterMetadata.create(withEntity);
  }

  /**
   * Use this function instead of the `CharacterMetadata` constructor.
   * Since most content generally uses only a very small number of
   * style/entity permutations, we can reuse these objects as often as
   * possible.
   */
  static create(config?: CharacterMetadataConfig): CharacterMetadata {
    if (!config) {
      return CharacterMetadata.EMPTY;
    }

    // Fill in unspecified properties, if necessary.
    var configMap = Map({ ...defaultRecord, ...config });

    var existing: ?CharacterMetadata = pool.get(configMap);
    if (existing) {
      return existing;
    }

    var newCharacter = new CharacterMetadata(config);
    pool = pool.set(configMap, newCharacter);
    return newCharacter;
  }

  static EMPTY = new CharacterMetadata();
}

var pool: Map<Map<any, any>, CharacterMetadata> = Map(
  [[Map(defaultRecord), CharacterMetadata.EMPTY]],
);

module.exports = CharacterMetadata;
