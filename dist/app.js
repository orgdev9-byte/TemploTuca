(() => {
  'use strict';
  // Replace only this adapter when a CMS is approved. Rendering consumes the same model.
  const repository = { load: async () => window.TUCA_CONTENT };
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const themes = {
    warm:{ number:'01',name:'Moderno e acolhedor',eyebrow:'Templo de Umbanda Caminhos de Aruanda',heading:'Uma casa.<br>Muitos caminhos.',intro:'Conheça o T.U.C.A, explore os assuntos do portal e encontre as informações para sua visita.' },
    dark:{ number:'02',name:'Tradicional e marcante',eyebrow:'Templo de Umbanda Caminhos de Aruanda',heading:'Presença.<br>Identidade. <em>T.U.C.A.</em>',intro:'Um portal para apresentar a casa, reunir conhecimento e aproximar caminhos.' },
    blue:{ number:'03',name:'Contemporâneo e institucional',eyebrow:'Conhecer é se aproximar',heading:'O T.U.C.A,<br>mais perto<br>de você.',intro:'A casa, os conteúdos e a programação. Explore o portal do Templo de Umbanda Caminhos de Aruanda.' }
  };
  const theme = themes[document.body.dataset.theme];
  const isSite = document.body.dataset.mode === "site";
  let data, pages, roots, current, routeMap, calendarDate = new Date(new Date().getFullYear(),new Date().getMonth(),1);
  let calendarFilter='all';
  const children = id => pages.filter(p=>p.parentId===id).sort((a,b)=>a.order-b.order);
  const ancestors = p => p.parentId ? [...ancestors(pages.find(x=>x.id===p.parentId)),pages.find(x=>x.id===p.parentId)] : [];
  const route = p => p.id==='inicio' ? '/' : '/' + [...ancestors(p),p].map(x=>x.slug).join('/');
  const href = p => '#' + route(p);
  const link = (p,extra='') => `<a href="${escape(href(p))}" ${p.id===current?.id?'aria-current="page"':''} ${extra}>${escape(p.title)}</a>`;
  const find = id => pages.find(p=>p.id===id);
  function navItems(items) {
    return `<ul>${items.filter(p=>p.showInNavigation).map(p=>{
      const sub=children(p.id).filter(x=>x.showInNavigation);
      return `<li class="nav-item"><div class="nav-row">${link(p)}${sub.length?`<button class="submenu-toggle" aria-expanded="false" aria-controls="menu-${escape(p.id)}" aria-label="Abrir submenu ${escape(p.title)}" data-label="${escape(p.title)}"><span aria-hidden="true">⌄</span></button>`:''}</div>${sub.length?`<div class="submenu" id="menu-${escape(p.id)}" hidden>${p.id==='visite'?'':`<a class="overview-link" href="${escape(href(p))}">Ver introdução →</a>`}${navItems(sub)}</div>`:''}</li>`;
    }).join('')}</ul>`;
  }
  function closeSubmenus(except) {
    document.querySelectorAll('.submenu-toggle[aria-expanded="true"]').forEach(btn=>{
      const panel=document.getElementById(btn.getAttribute('aria-controls'));
      if (except && (panel.contains(except) || btn===except)) return;
      setSubmenu(btn,false);
    });
  }
  function setSubmenu(btn,open) {
    btn.setAttribute('aria-expanded',String(open));
    btn.setAttribute('aria-label',`${open?'Fechar':'Abrir'} submenu ${btn.dataset.label}`);
    document.getElementById(btn.getAttribute('aria-controls')).hidden=!open;
  }
  function closeMobile(restore=false) {
    const btn=document.querySelector('.mobile-toggle');
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Abrir menu principal');
    document.querySelector('.site-nav').classList.remove('mobile-open');
    if(restore)btn.focus();
  }
  function header() {
    return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
      ${isSite ? '' : `<div class="prototype-bar"><div class="wrap"><span>Proposta ${theme.number} <span class="prototype-name">· ${theme.name}</span></span><a href="propostas.html">Comparar propostas <span aria-hidden="true">↗</span></a></div></div>`}
      <header class="site-header"><div class="brand-row wrap"><a class="brand" href="#/" aria-label="T.U.C.A — Início"><img src="${escape(theme.number==='02' ? data.site.logoDark : data.site.logo)}" alt="Emblema original do T.U.C.A" width="1006" height="1024"><span>T.U.C.A<small>${isSite ? escape(data.site.tagline) : 'Templo de Umbanda<br>Caminhos de Aruanda'}</small></span></a>${isSite ? '' : '<p class="brand-message">É simples, é do bem,<br><strong>é Umbanda.</strong></p>'}${isSite ? `<a class="header-visit" href="${href(find('visite'))}">Planeje sua visita <span aria-hidden="true">↗</span></a>` : ''}<button class="mobile-toggle" aria-expanded="false" aria-controls="main-navigation" aria-label="Abrir menu principal"><span aria-hidden="true">☰</span> Menu</button></div>
      <nav class="site-nav" id="main-navigation" aria-label="Navegação principal"><div class="wrap">${navItems(roots)}</div></nav></header>
      <div class="demo-bar"><div class="wrap"><span class="demo-dot" aria-hidden="true"></span>${escape(data.site.demoNotice)}</div></div>`;
  }
  function cards(items) {
    return `<div class="topic-grid">${items.map((p,i)=>`<a class="topic-card" href="${escape(href(p))}"><span class="card-index">${String(i+1).padStart(2,'0')}</span><h3>${escape(p.title)}</h3><p>${escape(p.summary)}</p><span class="card-bottom">Explorar página <span aria-hidden="true">↗</span></span></a>`).join('')}</div>`;
  }
  function sectionCards(items) {
    if(!items.length)return '';
    if(!items.every(p=>p.group))return cards(items);
    return [...new Set(items.map(p=>p.group))].map(group=>`<section class="topic-group" aria-label="${escape(group)}"><h3>${escape(group)}</h3>${cards(items.filter(p=>p.group===group))}</section>`).join('');
  }
  const localDate = date => new Date(date+'T12:00:00');
  const dayKey = date => new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
  const confirmedEvents = () => data.events.filter(e=>e.status==='confirmed').sort((a,b)=>a.date.localeCompare(b.date));
  const upcomingEvents = () => confirmedEvents().filter(e=>e.date>=dayKey(new Date()));
  function eventList(events) {
    if(!events.length)return '<p class="agenda-empty">Nenhuma atividade programada para este período.</p>';
    return '<ul class="event-list">'+events.map(e=>`<li><time datetime="${escape(e.date)}">${escape(new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit'}).format(localDate(e.date)))}</time><div><h3>${escape(e.title)}</h3><p>Portões às ${escape(e.doors.replace(':00','h'))} · Início às ${escape(e.start.replace(':00','h'))}</p></div></li>`).join('')+'</ul>';
  }
  function home() {
    return `<section class="hero wrap"><div class="hero-copy"><p class="eyebrow">${isSite ? escape(data.site.home.eyebrow) : theme.eyebrow}</p><h1 class="${isSite ? 'hero-title-name' : ''}">${isSite ? escape(data.site.home.title) : theme.heading}</h1><p class="hero-intro">${isSite ? escape(data.site.home.description) : theme.intro}</p><div class="hero-actions"><a class="button" href="${href(find('tuca'))}">Conheça o T.U.C.A <span aria-hidden="true">↗</span></a><a class="text-link" href="${href(find('calendario'))}">Ver calendário <span aria-hidden="true">→</span></a></div></div><figure class="hero-photo"><img src="${escape(data.site.photo)}" alt="Fotografia original fornecida do congá do T.U.C.A, com atabaque em primeiro plano" width="813" height="1314"><figcaption>Um olhar para a nossa casa <span>Fotografia original · T.U.C.A</span></figcaption></figure><span class="hero-vertical" aria-hidden="true">T.U.C.A / CAMINHOS DE ARUANDA</span></section>
      <section class="quick-paths wrap" aria-label="Acessos rápidos"><a href="${href(find('visite'))}"><span class="eyebrow">01 · Sua visita</span><strong>Encontre seu caminho <span aria-hidden="true">↗</span></strong><p>Orientações e informações da casa.</p></a><a href="${href(find('orixas'))}"><span class="eyebrow">02 · Conhecimento</span><strong>Explore os assuntos <span aria-hidden="true">↗</span></strong><p>Orixás, Umbanda e Linhas de Trabalho.</p></a><a href="${href(find('calendario'))}"><span class="eyebrow">03 · Programação</span><strong>Acompanhe a agenda <span aria-hidden="true">↗</span></strong><p>Consulte as datas e os horários das giras.</p></a></section>
      <section class="portal-section wrap"><div class="section-heading"><div><p class="eyebrow">Conhecer, aprender, se aproximar</p><h2>Um portal para explorar.</h2></div><p>Escolha um assunto para navegar.</p></div>${cards([find('umbanda'),find('orixas'),find('linhas')])}</section>
      <section class="agenda-callout wrap"><div><p class="eyebrow">Calendário da casa</p><h2>O próximo encontro<br>começa por aqui.</h2></div><div>${eventList(upcomingEvents().slice(0,3))}<a class="text-link" href="${href(find('calendario'))}">Explorar o calendário <span aria-hidden="true">→</span></a></div></section>`;
  }
  function locationBlock() {
    const place=data.site.location;
    if(!place || !/^https:\/\/www\.google\.com\/maps\/embed\?/.test(place.embedUrl) || !/^https:\/\/www\.google\.com\/maps\/search\//.test(place.mapsUrl))return '';
    return `<section class="location-section" aria-label="Localização do T.U.C.A"><div class="location-details"><div><h2>Nosso endereço</h2><address><strong>${escape(place.street)}</strong><span>${escape(place.neighborhood)}</span><span>${escape(place.city)} — ${escape(place.state)}</span></address></div><a class="button map-open" href="${escape(place.mapsUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir endereço do T.U.C.A no Google Maps (nova aba)">Abrir no Google Maps <span aria-hidden="true">↗</span></a></div><div class="location-map"><iframe title="Mapa do T.U.C.A — Avenida Sapopemba, 633, São Paulo" src="${escape(place.embedUrl)}" width="600" height="450" style="border:0" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p class="map-credit">Mapa interativo do Google Maps.</p></section>`;
  }
  function contactBlock() {
    const enabled=data.site.contact.enabled;
    return `<form class="contact-form" name="contato-tuca" method="POST" action="/obrigado.html" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="contato-tuca"><p hidden><label>Não preencha este campo <input name="bot-field" tabindex="-1" autocomplete="off"></label></p><label for="contact-name">Nome</label><input id="contact-name" name="nome" type="text" autocomplete="name" maxlength="150" required><label for="contact-email">E-mail</label><input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" required><label for="contact-message">Mensagem</label><textarea id="contact-message" name="mensagem" rows="6" maxlength="5000" required></textarea><button class="button" type="submit" ${enabled?'':'disabled'}>Enviar mensagem <span aria-hidden="true">↗</span></button><p class="contact-status" role="status" aria-live="polite">${enabled?'':'O envio pelo formulário estará disponível em breve.'}</p><p class="contact-direct">Você também pode escrever para <a href="mailto:${escape(data.site.contact.email)}">${escape(data.site.contact.email)}</a>.</p></form>`;
  }
  function bindContact() {
    const form=document.querySelector('.contact-form');if(!form)return;
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(!data.site.contact.enabled||!form.reportValidity())return;
      const button=form.querySelector('button'),status=form.querySelector('.contact-status');
      button.disabled=true;status.textContent='Enviando sua mensagem…';
      try {
        const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});
        if(!response.ok)throw Error('Falha no envio');
        form.reset();status.textContent='Mensagem enviada. Obrigado por entrar em contato com o T.U.C.A.';
      } catch {status.textContent='Não foi possível enviar agora. Tente novamente ou escreva para '+data.site.contact.email+'.';}
      finally {button.disabled=false;}
    });
  }
  function blocks(list=[]) {
    return list.map(b=>b.type==='page-link'&&find(b.pageId)?`<a class="text-link" href="${escape(href(find(b.pageId)))}">${escape(b.text)} →</a>`:b.type==='contact'?contactBlock():b.type==='location'?locationBlock():b.type==='heading'?`<h2>${escape(b.text)}</h2>`:b.type==='paragraph'?`<p>${b.strong?`<strong>${escape(b.text)}</strong>`:escape(b.text)}</p>`:b.type==='list'?`<ul>${b.items.map(t=>`<li>${escape(t)}</li>`).join('')}</ul>`:'').join('');
  }
  function calendar() {
    const year=calendarDate.getFullYear(),month=calendarDate.getMonth();
    const label=new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(calendarDate);
    const offset=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate();
    const today=new Date();
    const monthKey=year+'-'+String(month+1).padStart(2,'0');
    const selectedType=current.id==='calendario-eventos-especiais'?'eventos':current.id==='calendario-proximas-giras'?'giras':calendarFilter;
    const visible=confirmedEvents().filter(e=>e.date.startsWith(monthKey)&&(selectedType==='all'||e.type===selectedType));
    const cells=Array.from({length:Math.ceil((offset+days)/7)*7},(_,i)=>{
      const day=i-offset+1;
      if(day<1||day>days)return '<td class="empty-day"></td>';
      const isToday=today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===day;
      const key=monthKey+'-'+String(day).padStart(2,'0');
      const events=visible.filter(e=>e.date===key);
      return `<td class="${events.length?'has-event':''}"><span ${isToday?'aria-current="date" class="today"':''}>${day}</span>${events.map(e=>`<span class="day-event" title="${escape(e.title)} — Portões às ${escape(e.doors.replace(':00','h'))} · Início às ${escape(e.start.replace(':00','h'))}">${escape(e.title)}</span>`).join('')}</td>`;
    });
    return `<section class="calendar" aria-label="Calendário de giras e eventos"><div class="calendar-toolbar"><button class="icon-button" data-month="-1" aria-label="Mês anterior">←</button><h2 id="month-label" aria-live="polite">${escape(label)}</h2><button class="icon-button" data-month="1" aria-label="Próximo mês">→</button><button class="today-button">Mês atual</button></div><label class="filter-label" ${current.id==='calendario-eventos-especiais'||current.id==='calendario-proximas-giras'?'hidden':''}>Exibir <select id="calendar-filter"><option value="all" ${calendarFilter==='all'?'selected':''}>Todas as atividades</option><option value="giras" ${calendarFilter==='giras'?'selected':''}>Giras</option><option value="eventos" ${calendarFilter==='eventos'?'selected':''}>Eventos especiais</option></select></label><div class="calendar-table-wrap"><table aria-labelledby="month-label"><thead><tr>${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=>`<th scope="col">${d}</th>`).join('')}</tr></thead><tbody>${Array.from({length:cells.length/7},(_,i)=>`<tr>${cells.slice(i*7,i*7+7).join('')}</tr>`).join('')}</tbody></table></div><p class="calendar-legend"><span class="today-sample" aria-hidden="true"></span> Hoje · As giras estão indicadas nos dias da programação</p><div class="month-events" aria-live="polite">${eventList(visible)}</div></section>`;
  }
  function gallery() {
    return `<figure class="content-photo"><img src="${escape(data.site.photo)}" alt="Fotografia original do congá do T.U.C.A, com atabaque em primeiro plano" width="813" height="1314"><figcaption>Fotografia original fornecida para o projeto. A galeria definitiva poderá receber novos registros aprovados pela casa.</figcaption></figure>`;
  }
  function contentPage() {
    const parents=ancestors(current),section=parents[0]||current,sub=children(current.id),siblings=children(section.id);
    return `<div class="wrap"><nav class="breadcrumbs" aria-label="Caminho da página"><ol><li><a href="#/">Início</a></li>${parents.map(p=>`<li>${link(p)}</li>`).join('')}<li aria-current="page">${escape(current.title)}</li></ol></nav><div class="content-layout${parents.length?'':' content-layout--overview'}">${parents.length?`<aside class="section-nav"><h2>${link(section)}</h2><nav aria-label="Páginas de ${escape(section.title)}"><ul>${siblings.map(p=>`<li>${link(p)}</li>`).join('')}</ul></nav></aside>`:''}<article class="page-content"><header class="page-heading"><h1>${escape(current.heading||current.title)}</h1><p class="page-summary">${escape(current.summary)}</p></header>
      ${(current.id==='orixas'||current.id==='linhas')&&current.status==='demo'?'<div class="editorial-note"><strong>Uma estrutura para conhecer os temas.</strong><p>Os assuntos abaixo são propostas de organização. Não representam uma lista oficial dos fundamentos ou das práticas do T.U.C.A. A seleção e os textos dependem da aprovação do dirigente.</p></div>':''}
      ${current.template==='calendar'?`<div id="calendar-region">${calendar()}</div>`:''}
      ${current.template==='gallery'?gallery():''}
      ${current.image?`<figure class="orixa-image"><img src="${escape(current.image.src)}" alt="${escape(current.image.alt)}" width="1024" height="1024" loading="lazy" decoding="async">${current.image.caption?`<figcaption>${escape(current.image.caption)}</figcaption>`:''}</figure>`:''}
      ${current.blocks?.length?`<div class="prose">${blocks(current.blocks)}</div>`:''}
      ${sub.length?`<section class="subtopics" aria-label="Páginas desta seção"><h2>${current.id==='orixas'?'Conheça os temas':current.id==='linhas'?'Conheça as linhas de trabalho':'Explore esta seção'}</h2>${sectionCards(sub)}</section>`:''}
      ${current.template==='visit'?'<div class="editorial-note"><strong>Planeje sua primeira visita.</strong><p>Nosso endereço: Av. Sapopemba, 633 — Vila Regente Feijó, São Paulo — SP. Acesse Como chegar para consultar o mapa. Horários, contatos e recomendações de visita serão apresentados após confirmação da casa.</p></div>':''}
      </article></div></div>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="wrap footer-main"><div><p class="footer-wordmark">T.U.C.A</p><p>Templo de Umbanda<br>Caminhos de Aruanda</p></div><div><p class="eyebrow">Explore o portal</p><nav aria-label="Navegação do rodapé">${roots.filter(p=>p.id!=='inicio').map(p=>link(p)).join('')}</nav></div><div>${isSite ? `<p class="eyebrow">Sua visita</p><a href="${href(find('visite'))}">Informações para sua visita ↗</a>` : `<p class="eyebrow">Projeto em estudo</p><p>Protótipo navegável para avaliação<br>e aprovação do dirigente.</p><a href="propostas.html">Ver as três propostas ↗</a>`}</div></div><div class="wrap footer-bottom"><span>${isSite ? 'T.U.C.A · Portal em preparação' : `Proposta ${theme.number} · ${theme.name}`}</span></div></footer>`;
  }
  function render(focus=false) {
    let path;
    try { path=decodeURIComponent(location.hash.slice(1)||'/').replace(/\/$/,'')||'/'; } catch { path='invalid'; }
    const aliases={'/linhas-de-trabalho/exus-e-pombagiras':'/linhas-de-trabalho','/linhas-de-trabalho/outras-linhas':'/linhas-de-trabalho','/orixas/outros-orixas':'/orixas','/calendario':'/atendimento/calendario','/calendario/proximas-giras':'/atendimento/calendario','/calendario/calendario-completo':'/atendimento/calendario','/calendario/eventos-especiais':'/atendimento/calendario','/visite-o-tuca':'/atendimento','/visite-o-tuca/como-chegar':'/atendimento/como-chegar','/visite-o-tuca/contatos':'/atendimento/contatos'};
    if(aliases[path]){path=aliases[path];history.replaceState(null,'','#'+path);}
    current=routeMap.get(path);
    document.title=`${current?.title||'Página não encontrada'} — T.U.C.A${isSite ? '' : ` · Proposta ${theme.number}`}`;
    document.getElementById('app').innerHTML=header()+`<main id="conteudo" tabindex="-1">${current?(current.template==='home'?home():contentPage()):'<section class="wrap not-found"><p class="eyebrow">Este caminho não foi encontrado</p><h1>Vamos encontrar<br>outro caminho?</h1><p>Esta página não faz parte do protótipo.</p><a class="button" href="#/">Voltar ao início →</a></section>'}</main>`+footer();
    document.querySelectorAll('.submenu-toggle').forEach(btn=>setSubmenu(btn,false));
    bindNavigation();
    bindCalendar();
    bindContact();
    if(focus) { document.getElementById('conteudo').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'}); }
  }
  function bindNavigation() {
    document.querySelector('.mobile-toggle').addEventListener('click',event=>{
      const btn=event.currentTarget,open=btn.getAttribute('aria-expanded')!=='true';
      btn.setAttribute('aria-expanded',String(open));btn.setAttribute('aria-label',`${open?'Fechar':'Abrir'} menu principal`);
      document.querySelector('.site-nav').classList.toggle('mobile-open',open);
    });
    document.querySelectorAll('.submenu-toggle').forEach(btn=>{
      btn.addEventListener('click',()=>{const open=btn.getAttribute('aria-expanded')!=='true';closeSubmenus(btn);setSubmenu(btn,open);});
      btn.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();closeSubmenus(btn);setSubmenu(btn,true);document.getElementById(btn.getAttribute('aria-controls')).querySelector('a').focus();}});
    });
    document.querySelector('.site-nav').addEventListener('focusout',e=>{if(!e.currentTarget.contains(e.relatedTarget))closeSubmenus();});
    document.querySelector('.skip-link').addEventListener('click',e=>{e.preventDefault();document.getElementById('conteudo').focus();document.getElementById('conteudo').scrollIntoView();});
    document.querySelector('.site-nav').addEventListener('click',e=>{if(e.target.closest('a')){closeSubmenus();closeMobile();}});
  }
  function bindCalendar() {
    const region=document.getElementById('calendar-region');if(!region)return;
    const update=target=>{region.innerHTML=calendar();bindCalendar();region.querySelector(target)?.focus({preventScroll:true});};
    region.querySelectorAll('[data-month]').forEach(btn=>btn.addEventListener('click',()=>{calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()+Number(btn.dataset.month),1);update(`[data-month="${btn.dataset.month}"]`);}));
    region.querySelector('.today-button').addEventListener('click',()=>{calendarDate=new Date(new Date().getFullYear(),new Date().getMonth(),1);update('.today-button');});
    region.querySelector('select').addEventListener('change',e=>{calendarFilter=e.target.value;update('select');});
  }
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    const sub=e.target.closest('.submenu');
    if(sub){const btn=document.querySelector(`[aria-controls="${sub.id}"]`);setSubmenu(btn,false);btn.focus();return;}
    const own=e.target.closest('.submenu-toggle');
    if(own&&own.getAttribute('aria-expanded')==='true'){setSubmenu(own,false);return;}
    const open=document.querySelector('.submenu-toggle[aria-expanded="true"]');
    if(open){closeSubmenus();open.focus();return;}
    if(document.querySelector('.mobile-toggle')?.getAttribute('aria-expanded')==='true')closeMobile(true);
  });
  document.addEventListener('click',e=>{
    const internal=e.target.closest('a[href^="#/"]');
    if(internal&&internal.getAttribute('href')===location.hash){e.preventDefault();render(true);return;}
    if(!e.target.closest('.site-nav'))closeSubmenus();
    if(!e.target.closest('.site-header'))closeMobile();
  });
  addEventListener('hashchange',()=>render(true));
  matchMedia('(min-width:1100px)').addEventListener('change',()=>{closeSubmenus();closeMobile();});
  repository.load().then(content=>{
    data=content;pages=data.pages;roots=children(null);routeMap=new Map(pages.map(p=>[route(p),p]));render();
  }).catch(()=>{document.getElementById('app').innerHTML='<main class="wrap"><h1>Não foi possível abrir o protótipo.</h1><p>Gere os arquivos com npm run build e tente novamente.</p><a href="index.html">Voltar às propostas</a></main>';});
})();
