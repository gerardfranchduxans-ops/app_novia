const START_DATE = new Date('2024-11-16T00:00:00');
let currentView = null;
let mapInstance = null;
let homeMapInstance = null;
let satelliteLayer = null;
let streetsLayer = null;
let locationMarkers = [];
let modeActual = 'chill';

const gameData = {
  chill:{name:'🍃 Chill', truths:['¿Qué fue lo primero que pensaste cuando me viste?','¿Cuál es tu recuerdo favorito de nosotros?','¿Qué canción te recuerda siempre a mí?'], dares:['Dame un abrazo de 30 segundos sin hablar.','Dime 3 cosas que te gusten de mí mirándome a los ojos.','Déjame hacerte cosquillas durante 10 segundos.']},
  beber:{name:'🍻 Beber', truths:['¿Alguna vez has disimulado que no estabas borracho/a frente a mí?','¿Qué trago o copa no volverías a beber en tu vida?'], dares:['Bebe 2 tragos de tu copa.','Tómate un trago sin usar las manos.','Elige a alguien para beber juntos un trago.']},
  extremo:{name:'🔥 Extremo', truths:['¿Qué secreto picante nunca me habías contado?','¿Qué parte de mi cuerpo es tu favorita y por qué?'], dares:['Hazme un masaje en la espalda durante 2 minutos.','Bésame en el cuello durante 15 segundos.','Susúrrame algo provocativo al oído.']},
  ultra:{name:'💀 Ultra Extremo', truths:['¿Cuál es tu mayor fantasía no cumplida conmigo?','¿Qué lugar atrevido elegirías para tener una cita romántica?'], dares:['Un beso apasionado de 20 segundos.','Quítate una prenda de ropa.','Vérteme un trago despacio y tómalo directamente.']}
};

const $ = id => document.getElementById(id);
const escapeHTML = s => String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function elapsedParts(now = new Date()){
  let years = now.getFullYear()-START_DATE.getFullYear();
  let months = now.getMonth()-START_DATE.getMonth();
  let days = now.getDate()-START_DATE.getDate();
  if(days<0){months--; const prev=new Date(now.getFullYear(),now.getMonth(),0); days += prev.getDate();}
  if(months<0){years--; months+=12;}
  const ms=Math.max(0,now-START_DATE), totalDays=Math.floor(ms/86400000), hours=Math.floor(ms/3600000), minutes=Math.floor(ms/60000), seconds=Math.floor(ms/1000);
  return {years,months,days,totalDays,hours,minutes,seconds};
}
function updateCounter(){
  const e=elapsedParts();
  const days=`${e.totalDays.toLocaleString('es-ES')} días`;
  const detail=`${e.years} años · ${e.months} meses · ${e.days} días`;
  $('homeDays').textContent=days;
  $('homeDetail').textContent=detail;
  $('heroDays').textContent=days;
  $('heroDetail').textContent=detail;
  if(currentView==='counter') renderCounter();
}
function renderCounter(){
  const e=elapsedParts();
  $('viewContent').innerHTML=`<div class="counter-page">
    <div class="big-heart">❤️</div><div class="counter-number">${e.totalDays.toLocaleString('es-ES')}</div><div class="counter-label">DÍAS DESDE QUE NOS VIMOS</div>
    <div class="time-grid"><div class="time-box"><strong>${e.years}</strong><span>Años</span></div><div class="time-box"><strong>${e.months}</strong><span>Meses</span></div><div class="time-box"><strong>${e.days}</strong><span>Días</span></div></div>
    <div class="feature-intro"><h3>Y el contador sigue...</h3><p>${e.hours.toLocaleString('es-ES')} horas · ${e.minutes.toLocaleString('es-ES')} minutos · ${e.seconds.toLocaleString('es-ES')} segundos desde el 16 de noviembre de 2024.</p></div>
    <div class="counter-quote">“Te amo hoy, te amé ayer y te amaré siempre, para siempre juntos amor.” ❤️</div>
  </div>`;
}
function renderHomeMap(){
 const mapError=$('homeMapError');
 if(!window.L){
  mapError.textContent='No se pudo cargar Leaflet. Comprueba la conexión e inténtalo de nuevo.';
  mapError.classList.remove('hidden');
  return;
 }
 if(homeMapInstance)return;
 mapError.classList.add('hidden');
 homeMapInstance=L.map('homeMap');
 const tileLayer=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri'}).addTo(homeMapInstance);
 tileLayer.on('tileerror',()=>{
  mapError.textContent='No se pudieron cargar los mapas base. Comprueba la conexión a internet.';
  mapError.classList.remove('hidden');
 });
 const places=[
  {
   name:'Splau',
   lat:41.347634054399244,
   lng:2.077841623781242,
   texto:`Aquí fue donde ella empezó el fail histórico de nuestra quedada cuando literalmente no pudimos hacer nuestro plan de hacer bolos, aun así nos lo pasamos súper bien recuerdo que fuimos al MediaMarkt y estábamos todo el rato literalmente riendo y pensé que cómo podía ser que una persona desconocida para mí me estuviese cayendo tan bien en tan poco tiempo y que por mucho el plan estuviese saliendo todo mal todo estuviese siendo natural y divertido.
Ahí literalmente solo pensaba en que quería seguir conociendo a esa maravillosa persona que tenía al lado y saber todo sobre ella y verla mil veces más te amooooo. ❤️`
  },
  {
   name:'Repsol Martorell',
   lat:41.47709979517732,
   lng:1.921397102967716,
   texto:`El inicio de nuestra historia no sabes lo muy nervioso que estaba ese día literalmente recuerdo estar toda la mañana pensando en lo que hablaría y todo y finalmente quién diría que literalmente era tiempo perdido ya que simplemente me lo pasé súper bien y literalmente desde el primer momento me pareciste tan graciosa que no podíamos parar de hablar, para mí fue como conocer a una alma gemela una persona que me lo pasaba demasiado bien.
Aunque todo el mundo sabe que ese día fue un desastre dentro de ese desastre fue uno de los mejores días de mi vida me lo pasé súper bien y conocí a la mejor persona del mundo que después pasó a ser el amor de mi vida. ❤️`
  },
  {
   name:'Can Casas',
   lat:41.48699236,
   lng:1.90081932,
   texto:`Aquí acabó nuestra primera quedada, desastrosa pero imperfectamente perfecta, desde risas hasta vómitos jajajaj.
Ahora hablando serio ese día sinceramente me hubiese quedado mil horas más hablando contigo recuerdo que era como conocer una persona tan diferente a mí pero a la vez tan parecida, recuerdo poder sentirme en confianza con una persona que realmente no conocía y no sé simplemente quería hablar y hablar contigo y por eso me enamoré de ti, porque eres la mejor persona que conozco, para mí eres única en el mundo y ahora dos años después te digo lo mismo de siempre que te amo con locura y que lo mejor que me ha pasado en esta vida es ese día conocer al amor de mi vida. ❤️`
  },
  {
   name:"Mirador de l'Arrabassada",
   lat:41.43236816356843,
   lng:2.1307155601307985,
   texto:`Esto ya fue un fail aún más grande jajajaj, el gran mirador al que te iba a llevar estaba cerrado y encima casi nos matamos en el coche mirando fotos de Benidorm, aun así hay que decir que estuvimos 4 horas y pico en el coche y para mí fue como media hora, no callábamos y nos lo pasamos súper bien no sé ni de qué hablamos pero sé que en ningún momento me quería ir a casa es más solo quería que ese viaje de coche fuese infinito, te amooooo ❤️`
  }
 ];
 const legendList=$('homeMapLegendList');
 legendList.replaceChildren();
 $('homeMapPointCount').textContent=String(places.length);
 places.forEach(place=>{
  const item=document.createElement('button');
  item.className='home-map-legend-item';
  item.type='button';
  item.textContent=`📍 ${place.name}`;
  item.addEventListener('click',()=>openMemoryPanel(place));
  legendList.appendChild(item);
 });
 const legendToggle=$('homeMapLegendToggle');
 legendToggle.setAttribute('aria-expanded','false');
 legendList.classList.add('hidden');
 legendToggle.onclick=()=>{
  const expanded=legendToggle.getAttribute('aria-expanded')==='true';
  legendToggle.setAttribute('aria-expanded',String(!expanded));
  legendList.classList.toggle('hidden',expanded);
 };
 const markers=places.map(place=>{
  const marker=L.marker([place.lat,place.lng]).addTo(homeMapInstance);
  marker.on('click',()=>openMemoryPanel(place));
  return marker;
 });
 homeMapInstance.fitBounds(L.featureGroup(markers).getBounds().pad(0.15));
}
function openMemoryPanel(place){
 $('memoryPanelTitle').textContent=place.name;
 $('memoryPanelText').textContent=place.texto;
 $('memoryPanelText').scrollTop=0;
 $('memoryPanel').classList.remove('hidden');
 document.body.classList.add('memory-panel-open');
 $('closeMemoryPanel').focus();
}
function closeMemoryPanel(){
 $('memoryPanel').classList.add('hidden');
 document.body.classList.remove('memory-panel-open');
}
function openView(view){
  currentView=view; $('view').classList.remove('hidden'); $('app').classList.add('hidden');
  const meta={map:['NUESTROS SITIOS','Nuestro mapa'],counter:['DESDE EL 16 DE NOVIEMBRE DE 2024','¿Cuánto llevamos?'],games:['PARA PASARLO BIEN','Juegos'],memories:['NUESTROS MOMENTOS','Recuerdos'],letters:['PARA CUANDO ME NECESITES','Cartitas'],surprises:['SORPRESAS','Sorpresas'],secret:['ZONA PRIVADA','Solo para ti']}[view];
  $('viewEyebrow').textContent=meta[0]; $('viewTitle').textContent=meta[1];
  if(view==='map') renderMap();
  if(view==='counter') renderCounter();
  if(view==='games') renderGames();
  if(view==='memories') renderMemories();
  if(view==='letters') renderLetters();
  if(view==='surprises') renderSurprises();
  if(view==='secret') renderSecret();
  window.scrollTo(0,0);
}
function closeView(){ if(mapInstance){mapInstance.remove();mapInstance=null;} currentView=null; $('view').classList.add('hidden');$('app').classList.remove('hidden'); }

function renderMap(){
 $('viewContent').innerHTML=`<div class="map-wrap"><div class="map-search"><input id="placeSearch" placeholder="🔍 Buscar un sitio..." autocomplete="off" aria-label="Buscar un sitio" aria-controls="placeSuggestions"><div id="placeSuggestions" class="place-suggestions hidden"></div></div><div id="map"></div></div>
 <div class="map-actions"><button class="soft-btn" id="layerBtn">🌍 Cambiar a calles</button><button class="soft-btn" id="gpsBtn">📍 Mi ubicación</button></div><div class="place-list" id="placeList"></div>`;
 mapInstance=L.map('map',{zoomControl:false}).setView([41.59,1.52],8); L.control.zoom({position:'bottomright'}).addTo(mapInstance);
 satelliteLayer=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Esri'}).addTo(mapInstance);
 streetsLayer=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri'});
 locationMarkers=[];
 window.ubicaciones.forEach((sitio,i)=>{if(!sitio.lat||!sitio.lng)return;const marker=L.marker([sitio.lat,sitio.lng]).addTo(mapInstance);const img='imagenes/'+sitio.imagen;const text=escapeHTML(sitio.texto).replace(/\n/g,'<br>');marker.bindPopup(`<div class="popup-container"><img src="${img}" class="popup-imagen" onerror="this.src='imagenes/default.svg'"><div class="popup-texto">${text}</div></div>`);locationMarkers.push({sitio,marker});});
 const list=$('placeList');
 locationMarkers.forEach(({sitio})=>{
  const button=document.createElement('button');
  button.className='place-item';
  button.type='button';
  button.innerHTML=`<b>📍 ${escapeHTML(sitio.nombre)}</b><span>Toca para abrir el recuerdo</span>`;
  button.addEventListener('click',()=>showPlaceOnMap(sitio.nombre));
  list.appendChild(button);
 });
 const search=$('placeSearch');
 const suggestions=$('placeSuggestions');
 const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
 const choosePlace=name=>{
  search.value=name;
  suggestions.classList.add('hidden');
  showPlaceOnMap(name);
 };
 const renderSuggestions=()=>{
  const query=normalize(search.value.trim());
  suggestions.replaceChildren();
  if(!query){suggestions.classList.add('hidden');return;}
  const matches=locationMarkers.filter(({sitio})=>normalize(sitio.nombre).includes(query));
  if(!matches.length){
   const empty=document.createElement('div');
   empty.className='place-suggestion-empty';
   empty.textContent='No se encontraron sitios';
   suggestions.appendChild(empty);
  }else{
   matches.forEach(({sitio})=>{
    const option=document.createElement('button');
    option.className='place-suggestion';
    option.type='button';
    option.textContent=`📍 ${sitio.nombre}`;
    option.addEventListener('click',()=>choosePlace(sitio.nombre));
    suggestions.appendChild(option);
   });
  }
  suggestions.classList.remove('hidden');
 };
 search.addEventListener('input',renderSuggestions);
 search.addEventListener('keydown',event=>{
  if(event.key==='Enter'){
   const firstMatch=locationMarkers.find(({sitio})=>normalize(sitio.nombre).includes(normalize(search.value.trim())));
   if(firstMatch)choosePlace(firstMatch.sitio.nombre);
  }else if(event.key==='Escape'){
   suggestions.classList.add('hidden');
  }
 });
 search.addEventListener('focus',renderSuggestions);
 $('layerBtn').onclick=()=>{if(mapInstance.hasLayer(satelliteLayer)){mapInstance.removeLayer(satelliteLayer);streetsLayer.addTo(mapInstance);$('layerBtn').textContent='🛰️ Cambiar a satélite';}else{mapInstance.removeLayer(streetsLayer);satelliteLayer.addTo(mapInstance);$('layerBtn').textContent='🌍 Cambiar a calles';}};
 $('gpsBtn').onclick=()=>mapInstance.locate({setView:true,maxZoom:16});
 mapInstance.on('locationfound',e=>L.circleMarker(e.latlng,{radius:8}).addTo(mapInstance).bindPopup('📍 Estás aquí ❤️').openPopup());
}
function showPlaceOnMap(name){
 const place=locationMarkers.find(({sitio})=>sitio.nombre===name);
 if(!place||!mapInstance)return;
 $('map').closest('.map-wrap').scrollIntoView({behavior:'smooth',block:'start'});
 window.setTimeout(()=>{
  if(!mapInstance)return;
  mapInstance.invalidateSize();
  mapInstance.flyTo([place.sitio.lat,place.sitio.lng],15);
  place.marker.openPopup();
 },350);
}
function renderGames(){
 $('viewContent').innerHTML=`<div class="feature-intro"><h3>Elege cómo quieres jugar 🍻</h3><p>Hay modos tranquilos, de beber y otros bastante más salvajes.</p></div><div class="mode-grid">${Object.entries(gameData).map(([k,v])=>`<button class="mode-btn ${k}" data-mode="${k}"><span>${v.name.split(' ')[0]}</span><b>${v.name.substring(v.name.indexOf(' ')+1)}</b><small>Verdades + retos</small></button>`).join('')}</div><div id="gamePanel" class="game-panel hidden"></div>`;
 document.querySelectorAll('.mode-btn').forEach(b=>b.onclick=()=>startGame(b.dataset.mode));
}
function startGame(mode){modeActual=mode;const d=gameData[mode];$('gamePanel').classList.remove('hidden');$('gamePanel').innerHTML=`<h3>${d.name}</h3><div id="gameCard" class="game-card">Elige <b style="margin-left:5px">VERDAD</b> o <b style="margin-left:5px">RETO</b> 👇</div><div class="game-actions"><button class="truth" id="truthBtn">🤔 Verdad</button><button class="dare" id="dareBtn">⚡ Reto</button></div><button class="close-game" id="closeGame">Cerrar partida</button>`;$('truthBtn').onclick=()=>drawGame('truth');$('dareBtn').onclick=()=>drawGame('dare');$('closeGame').onclick=()=>$('gamePanel').classList.add('hidden');$('gamePanel').scrollIntoView({behavior:'smooth',block:'center'});}
function drawGame(type){const list=type==='truth'?gameData[modeActual].truths:gameData[modeActual].dares;const item=list[Math.floor(Math.random()*list.length)];$('gameCard').innerHTML=`${type==='truth'?'🤔 VERDAD':'⚡ RETO'}<br><br>${escapeHTML(item)}`;}

function renderMemories(){
 const items=window.ubicaciones.filter(x=>x.imagen); $('viewContent').innerHTML=`<div class="feature-intro"><h3>Todos nuestros recuerdos ❤️</h3><p>Los mismos sitios que aparecen en el mapa, ahora reunidos en una galería para poder verlos cómodamente desde el móvil.</p></div><div class="memory-grid">${items.map(x=>`<button class="memory-card" data-name="${escapeHTML(x.nombre)}"><img src="imagenes/${x.imagen}" onerror="this.src='imagenes/default.svg'"><div><b>${escapeHTML(x.nombre)}</b><span>📍 Abrir recuerdo en el mapa</span></div></button>`).join('')}</div>`;
 document.querySelectorAll('.memory-card').forEach(b=>b.onclick=()=>openView('map'));
}
function renderLetters(){
 const letterParagraphs=[
  'Hola amor,',
  'Esta es la primera nota de la sección de notas que espero que pueda hacerte muy feliz, te quiero decir que te amo muchísimo y que eres la persona mas guapa que he visto en mi vida.',
  'No se exactamente cuántos días pondrá ahora mismo en el contador de días que llevamos juntos pero te puedo asegurar que esos días han sido los mejores de mi vida ya que los he pasado al lado de la mujer de mi vida, la única persona con la que he estado y con la única que quiero estar en todo este mundo.',
  'Por eso quiero que recuerdes que siempre voy a estar a tu lado para lo que necesites y que siempre te voy ha hacer sorpresas como esta porque te amooooo muchisimo amor.'
 ];
 $('viewContent').innerHTML=`<div class="feature-intro"><h3>Notas para ti 💌</h3><p>En este espacio podrás encontrar todas las notas que he preparado para ti.</p></div>
 <article class="letter"><div class="letter-head"><span>💌</span><span class="badge">ABIERTA</span></div><h3>Para la persona más guapa</h3><p>Te amoooo muchisimo amor.</p><div class="letter-full hidden" id="firstLetter">${letterParagraphs.map(paragraph=>`<p>${escapeHTML(paragraph)}</p>`).join('')}</div><button class="open-letter" id="openLetterBtn" type="button" aria-expanded="false">Abrir carta</button></article>
 <article class="letter locked-letter"><div class="letter-head"><span>🔒</span><span class="badge">BLOQUEADA</span></div><h3>Ábreme cuando me eches de menos</h3><p>Esta carta está esperando su momento.</p></article>
 <article class="letter locked-letter"><div class="letter-head"><span>🔒</span><span class="badge">FECHA ESPECIAL</span></div><h3>Ábreme el día de nuestro aniversario</h3><p>Una pequeña sorpresa para el 1 de diciembre.</p></article>`;
 $('openLetterBtn').onclick=()=>{
  const letter=$('firstLetter');
  const isOpen=letter.classList.toggle('hidden')===false;
  $('openLetterBtn').textContent=isOpen?'Cerrar carta':'Abrir carta';
  $('openLetterBtn').setAttribute('aria-expanded',String(isOpen));
 };
}
function renderSurprises(){
 $('viewContent').innerHTML=`<div class="surprise-box"><div class="gift">🎁</div><h3>Hay una sorpresa para ti...</h3><p>Cuando sea el momento adecuado podras descubrirla aquí</p><button class="reveal-btn" id="revealBtn">✨ Intentar descubrirla</button></div><div class="feature-intro" style="margin-top:14px"><h3>Ideas que podemos meter aquí</h3><p>🎟️ Vale por una cita · 🍽️ Cena sorpresa · ✈️ Pista de un viaje · 🎥 Vídeo · 💌 Carta · 🎁 Regalo desbloqueable.</p></div>`;
 $('revealBtn').onclick=()=>{ $('revealBtn').textContent='❤️ Sorpresa guardada para ti'; showToast('Todavía no te la voy a contar... 😏'); };
}
function renderSecret(){
 $('viewContent').innerHTML=`<div class="secret-box"><div class="lock">🔐</div><h3>Zona solo para ti</h3><p>A ver si puedes adivinar la contraseña correcta</p><input class="secret-input" id="secretInput" type="password" placeholder="Escribe la contraseña"><button class="secret-button" id="secretBtn">Entrar</button><div id="secretResult" aria-live="polite"></div></div>`;
 $('secretBtn').onclick=()=>{
  const password=$('secretInput').value.trim();
  const result=$('secretResult');
  if(!password){showToast('Escribe una contraseña 🔐');return;}
  if(password==='wikilikis'){
   result.className='secret-result unlocked';
   result.textContent='Te amooooo muchísimo amor ❤️';
  }else{
   result.className='secret-result error';
   result.textContent='Contraseña incorrecta. Inténtalo de nuevo.';
  }
 };
}
function showToast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}

$('passwordForm').addEventListener('submit',event=>{
 event.preventDefault();
 const error=$('passwordError');
 if($('securityAnswer').value.trim()==='16'){
  $('accessScreen').classList.add('hidden');
  $('home').classList.remove('hidden');
  error.textContent='';
  updateCounter();
  renderHomeMap();
  window.setTimeout(()=>{if(homeMapInstance)homeMapInstance.invalidateSize();},0);
 }else{
  error.textContent='Respuesta incorrecta. Inténtalo de nuevo.';
  $('securityAnswer').value='';
  $('securityAnswer').focus();
 }
});
$('enterBtn').onclick=()=>{
 $('memoriesAccessScreen').classList.remove('hidden');
};
$('closeBlockedAccess').onclick=()=>$('memoriesAccessScreen').classList.add('hidden');
$('closeMemoryPanel').onclick=closeMemoryPanel;
$('memoryPanel').addEventListener('click',event=>{
 if(event.target===$('memoryPanel'))closeMemoryPanel();
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&!$('memoryPanel').classList.contains('hidden'))closeMemoryPanel();
});
$('backBtn').onclick=closeView;
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.open)));
$('loveBtn').onclick=()=>showToast('Te amo muchísimo ❤️');
setInterval(updateCounter,1000);updateCounter();
