import test from 'node:test';import assert from 'node:assert/strict';
import {assertAttachmentSize} from '../../src/utils/uploadLimit.ts';
test('20 MiB boundary and actual incident size rejected before upload',()=>{
 for(const size of [1,20971520])assert.doesNotThrow(()=>assertAttachmentSize(size));
 for(const size of [0,NaN,-1,20971521,21494363])assert.throws(()=>assertAttachmentSize(size));
});
