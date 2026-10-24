import yauzl from 'yauzl';

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_MIMES = Object.freeze({pdf:'application/pdf', docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',txt:'text/plain'});

export function documentMetadata(file) {
  if (!file || typeof file.name !== 'string' || file.name.length > 160 || /[\x00-\x1f\x7f/\\]/.test(file.name)) throw new Error('invalid_document');
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!DOCUMENT_MIMES[extension] || !Number.isInteger(file.size) || file.size < 1 || file.size > MAX_DOCUMENT_BYTES || !/^[a-f0-9]{64}$/.test(file.sha256 || '')) throw new Error('invalid_document');
  return { name:file.name, size:file.size, extension, mime:DOCUMENT_MIMES[extension], sha256:file.sha256 };
}

export async function validateDocument(bytes, metadata) {
  if (!Buffer.isBuffer(bytes) || bytes.length !== metadata.size || bytes.length > MAX_DOCUMENT_BYTES) throw new Error('invalid_document');
  if (metadata.extension === 'pdf') {
    if (!bytes.subarray(0,8).toString('ascii').match(/^%PDF-1\.[0-9]|^%PDF-2\.0/) || !bytes.subarray(-2048).includes(Buffer.from('%%EOF'))) throw new Error('invalid_document');
    return;
  }
  if (metadata.extension === 'txt') {
    const text = new TextDecoder('utf-8',{fatal:true}).decode(bytes);
    if (!text.trim() || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text)) throw new Error('invalid_document');
    return;
  }
  await validateDocx(bytes);
}

function validateDocx(bytes) {
  return new Promise((resolve,reject) => {
    yauzl.fromBuffer(bytes,{lazyEntries:true,validateEntrySizes:true,strictFileNames:true},(error,zip) => {
      if (error || !zip) return reject(new Error('invalid_document'));
      let failed = false; let count = 0; let total = 0;
      const names = new Set(); const required = new Map();
      const fail = () => { if (!failed) { failed=true; zip.close(); reject(new Error('invalid_document')); } };
      zip.on('error',fail);
      zip.on('end',() => {
        if (failed) return;
        const types = required.get('[Content_Types].xml') || '';
        const document = required.get('word/document.xml') || '';
        if (!types.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml') || !/<(?:\w+:)?document\b/.test(document) || /<!DOCTYPE|<!ENTITY/i.test(types+document)) return fail();
        resolve();
      });
      zip.on('entry',entry => {
        if (failed) return;
        if (++count > 1000 || names.has(entry.fileName) || (entry.generalPurposeBitFlag&1) || ![0,8].includes(entry.compressionMethod) || /(^|\/)\.\.(\/|$)|\\|vbaProject\.bin|word\/embeddings\//i.test(entry.fileName)) return fail();
        names.add(entry.fileName);
        if (/\/$/.test(entry.fileName)) { zip.readEntry(); return; }
        if (entry.uncompressedSize > 20*1024*1024) return fail();
        zip.openReadStream(entry,(streamError,stream) => {
          if (streamError || !stream) return fail();
          let entryBytes=0; const parts=[];
          const collect = ['[Content_Types].xml','word/document.xml'].includes(entry.fileName);
          stream.on('error',fail);
          stream.on('data',chunk => {
            total+=chunk.length; entryBytes+=chunk.length;
            if (total>50*1024*1024 || entryBytes>20*1024*1024 || (collect && entryBytes>4*1024*1024)) { stream.destroy(); return fail(); }
            if (collect) parts.push(chunk);
          });
          stream.on('end',() => { if (failed) return; if (collect) required.set(entry.fileName,Buffer.concat(parts).toString('utf8')); zip.readEntry(); });
        });
      });
      zip.readEntry();
    });
  });
}
