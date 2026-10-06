const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const source=fs.readFileSync('src/utils/markdownParser.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const context={exports:{}};vm.runInNewContext(compiled,context,{timeout:1000});
const parse=context.exports.parseBlocks;
for(const input of ['|','| heading |','prefix\n| partial','```\nunfinished','## عنوان\n- نقطة']) {
 context.input=input;vm.runInNewContext('exports.parseBlocks(input)',context,{timeout:1000});
}
const table='| الموضوع | الشرح |\n|---|---|\n| دالة | مثال |';
for(let i=1;i<=table.length;i++){context.input=table.slice(0,i);vm.runInNewContext('exports.parseBlocks(input)',context,{timeout:1000});}
assert.equal(parse(table)[0].kind,'table');
assert.equal(parse('|')[0].text,'|');
console.log('PASS: incomplete table headers, every streamed prefix, code fences and Arabic blocks terminate; full tables parse.');
