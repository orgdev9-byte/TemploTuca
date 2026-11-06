import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validate } from './model.mjs';
const data=JSON.parse(await readFile(new URL('../content/portal.json',import.meta.url),'utf8'));
test('catálogo íntegro e oito áreas principais na ordem aprovada',()=>{
  assert.equal(validate(data),true);
  assert.deepEqual(data.pages.filter(p=>!p.parentId).sort((a,b)=>a.order-b.order).map(p=>p.title),['Início','O TUCA','Umbanda','Orixás','Linhas de Trabalho','Calendário','Conteúdos','Visite o TUCA']);
});
test('assuntos de Orixás e Linhas têm introdução, páginas próprias e status demonstrativo',()=>{
  for(const id of ['orixas','linhas']) {
    assert.equal(data.pages.find(p=>p.id===id).template,'collection');
    const topics=data.pages.filter(p=>p.parentId===id);
    assert.ok(topics.length>1);
    assert.ok(topics.every(p=>p.template==='article'&&p.status==='demo'&&p.summary.length));
  }
  assert.equal(data.events.length,0,'Não incluir datas de gira sem aprovação');
});
test('novo tópico e submenu aninhado entram apenas por dados',()=>{
  const copy=structuredClone(data);
  copy.pages.push({id:'novo',title:'Novo tema de demonstração',slug:'novo-tema',parentId:'umbanda',template:'collection',order:99,showInNavigation:true,status:'demo',summary:'Demonstração',blocks:[]});
  copy.pages.push({id:'filho',title:'Subtema',slug:'subtema',parentId:'novo',template:'article',order:0,showInNavigation:true,status:'demo',summary:'Demonstração',blocks:[]});
  assert.equal(validate(copy),true);
});
test('impede ciclos, pais ausentes e caminhos ambíguos no futuro catálogo',()=>{
  const cycle=structuredClone(data);cycle.pages.find(p=>p.id==='umbanda').parentId='umbanda';
  assert.throws(()=>validate(cycle),/Ciclo/);
  const missing=structuredClone(data);missing.pages[0].parentId='ausente';
  assert.throws(()=>validate(missing),/pai ausente/);
  const duplicate=structuredClone(data);duplicate.pages.push({...duplicate.pages[0],id:'outra'});
  assert.throws(()=>validate(duplicate),/Caminho duplicado/);
});


test('resumos aparecem uma vez e blocos genéricos não ocupam páginas',()=>{
  for(const page of data.pages){
    assert.ok(!page.blocks.some(b=>b.type==='paragraph'&&b.text===page.summary),page.id+' repete o resumo');
    assert.ok(!page.blocks.some(b=>['Sobre este espaço','Conteúdo em preparação'].includes(b.text)),page.id+' contém estrutura genérica');
  }
});
