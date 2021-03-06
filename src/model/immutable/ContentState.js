/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ContentState
 * @typechecks
 * @flow
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type DraftEntityInstance from 'DraftEntityInstance';
import type {DraftEntityMutability} from 'DraftEntityMutability';
import type {DraftEntityType} from 'DraftEntityType';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const DraftEntity = require('DraftEntity');
const Immutable = require('immutable');
const SelectionState = require('SelectionState');

const generateRandomKey = require('generateRandomKey');
const invariant = require('invariant');
const nullthrows = require('nullthrows');
const sanitizeDraftText = require('sanitizeDraftText');

const {List, Record, Repeat} = Immutable;

type RecordProps = {
  entityMap: ?any,
  blockMap: ?BlockMap,
  selectionBefore: ?SelectionState,
  selectionAfter: ?SelectionState,
};

const defaultRecord: RecordProps = {
  entityMap: null,
  blockMap: null,
  selectionBefore: null,
  selectionAfter: null,
};

const ContentStateRecord = Record(defaultRecord);

class ContentState extends ContentStateRecord<RecordProps> {

  getEntityMap(): any {
    // TODO: update this when we fully remove DraftEntity
    return DraftEntity;
  }

  getBlockMap(): BlockMap {
    const blockMap = this.get('blockMap');
    invariant(blockMap, 'ContentState missing blockMap');
    return blockMap;
  }

  getSelectionBefore(): SelectionState {
    const selection = this.get('selectionBefore');
    invariant(selection, 'ContentState missing selectionBefore');
    return selection;
  }

  getSelectionAfter(): SelectionState {
    const selection = this.get('selectionAfter');
    invariant(selection, 'ContentState missing selectionAfter');
    return selection;
  }

  getBlockForKey(key: string): ?ContentBlock {
    return this.getBlockMap().get(key);
  }

  getKeyBefore(key: string): ?string {
    return this.getBlockMap()
      .reverse()
      .keySeq()
      .skipUntil(v => v === key)
      .skip(1)
      .first();
  }

  getKeyAfter(key: string): ?string {
    return this.getBlockMap()
      .keySeq()
      .skipUntil(v => v === key)
      .skip(1)
      .first();
  }

  getBlockAfter(key: string): ?ContentBlock {
    return this.getBlockMap()
      .skipUntil((_, k) => k === key)
      .skip(1)
      .first();
  }

  getBlockBefore(key: string): ?ContentBlock {
    return this.getBlockMap()
      .reverse()
      .skipUntil((_, k) => k === key)
      .skip(1)
      .first();
  }

  getBlocksAsArray(): Array<ContentBlock> {
    return this.getBlockMap().valueSeq().toArray();
  }

  getFirstBlock(): ContentBlock {
    const block = this.getBlockMap().first();
    invariant(block, 'ContentState blockMap is empty');
    return block;
  }

  getLastBlock(): ContentBlock {
    const block = this.getBlockMap().last();
    invariant(block, 'ContentState blockMap is empty');
    return block;
  }

  getPlainText(delimiter?: string): string {
    return this.getBlockMap()
      .map(block => {
        return block ? block.getText() : '';
      })
      .join(delimiter || '\n');
  }

  getLastCreatedEntityKey() {
    // TODO: update this when we fully remove DraftEntity
    return DraftEntity.__getLastCreatedEntityKey();
  }

  hasText(): boolean {
    return (
      this.getBlockMap().size > 1 ||
      this.getFirstBlock().getLength() > 0
    );
  }

  createEntity(
    type: DraftEntityType,
    mutability: DraftEntityMutability,
    data?: Object,
  ): ContentState {
    // TODO: update this when we fully remove DraftEntity
    DraftEntity.__create(
      type,
      mutability,
      data,
    );
    return this;
  }

  mergeEntityData(
    key: string,
    toMerge: {[key: string]: any},
  ): ContentState {
    // TODO: update this when we fully remove DraftEntity
    DraftEntity.__mergeData(key, toMerge);
    return this;
  }

  replaceEntityData(
    key: string,
    newData: {[key: string]: any},
  ): ContentState {
    // TODO: update this when we fully remove DraftEntity
    DraftEntity.__replaceData(key, newData);
    return this;
  }

  addEntity(instance: DraftEntityInstance): ContentState {
    // TODO: update this when we fully remove DraftEntity
    DraftEntity.__add(instance);
    return this;
  }

  getEntity(key: string): DraftEntityInstance {
    // TODO: update this when we fully remove DraftEntity
    return DraftEntity.__get(key);
  }

  static createFromBlockArray(
    // TODO: update flow type when we completely deprecate the old entity API
    blocks: Array<ContentBlock> | {contentBlocks: Array<ContentBlock>},
    entityMap: ?any,
  ): ContentState {
    // TODO: remove this when we completely deprecate the old entity API
    const theBlocks = Array.isArray(blocks) ? blocks : blocks.contentBlocks;
    var blockMap = BlockMapBuilder.createFromArray(theBlocks);
    var selectionState = blockMap.isEmpty()
      ? new SelectionState()
      : SelectionState.createEmpty(nullthrows(blockMap.first()).getKey());
    return new ContentState({
      blockMap,
      entityMap: entityMap || DraftEntity,
      selectionBefore: selectionState,
      selectionAfter: selectionState,
    });
  }

  static createFromText(
    text: string,
    delimiter: string | RegExp = /\r\n?|\n/g,
  ): ContentState {
    const strings = text.split(delimiter);
    const blocks = strings.map(
      block => {
        block = sanitizeDraftText(block);
        return new ContentBlock({
          key: generateRandomKey(),
          text: block,
          type: 'unstyled',
          characterList: List(Repeat(CharacterMetadata.EMPTY, block.length)),
        });
      },
    );
    return ContentState.createFromBlockArray(blocks);
  }
}

module.exports = ContentState;
