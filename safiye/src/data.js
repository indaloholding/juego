export const MIN = 60000, H = 3600000;

export const TREATMENTS = {
  gafas: ['Gafas graduadas', '👓'], jersey: ['Jersey de lana', '🧶'], clases: ['Clases de maullido', '🎓'],
  malta: ['Pasta de malta', '🥄'], cajaxl: ['Caja de cartón XL', '📦'], aro: ['Aro de luz para selfies', '💡'],
  orejeras: ['Orejeras de peluche', '🎧'], brackets: ['Ortodoncia invisible', '😁'], siesta: ['Siesta terapéutica de 14 h', '😴'],
  espejo: ['Espejo y charla motivacional', '🪞'], crema: ['Crema solar SPF 50', '🧴'], dieta: ['Dieta de lechuga y paciencia', '🥬'],
  cono: ['Cono de la vergüenza', '🔔'], peluche: ['Terapia con ratón de peluche', '🐭'], pimienta: ['Pimienta para estornudar', '🌶️'],
  agenda: ['Agenda con post-its', '📒'], collarin: ['Collarín XXL', '🦴'], bufanda: ['Bufanda de 4 metros', '🧣'],
  terapia: ['Sesión de diván', '🛋️'], modales: ['Libro de buenos modales', '📖'], paracaidas: ['Mini paracaídas', '🪂'],
  diapason: ['Diapasón de concierto', '🎵'], sombrero: ['Sombrero de paja', '👒'], acondicionador: ['Acondicionador y plancha', '💇'],
  tofu: ['Chuletón de tofu', '🥩'], miel: ['Jarabe de miel', '🍯'], vendas: ['Vendas de momia', '🩹'], ventilador: ['Ventilador de mano', '🪭'],
  corona: ['Corona de cartón', '👑'], vitaminas: ['Vitaminas con sabor a atún', '💊'],
};

// accessory = lo que el animal lleva puesto al curarse
export const CASES = [
  { id: 'miope', sp: 'gato', title: 'Michi miope', desc: 'Se choca con las paredes y anoche intentó cazar al robot aspirador creyendo que era un ratón gigante.', t: 'gafas', h: 5, rev: 5, revTxt: 'revisión de graduación', acc: 'gafas' },
  { id: 'esfinge', sp: 'gato', v: 6, title: 'Esfinge congelado', desc: 'Gato sin pelo tiritando. Dice que en Stuttgart hace un frío que no es normal.', t: 'jersey', h: 4, acc: 'jersey' },
  { id: 'ladra', sp: 'gato', title: 'El gato que ladra', desc: 'Ha empezado a ladrar. Los vecinos han llamado a la policía alemana dos veces.', t: 'clases', h: 6, rev: 3, revTxt: 'examen de maullido' },
  { id: 'bola', sp: 'gato', title: 'Bola de pelo XXL', desc: 'Tiene una bola de pelo del tamaño de un melón y tose como un señor de 80 años.', t: 'malta', h: 3 },
  { id: 'caja', sp: 'gato', title: 'Okupa de Amazon', desc: 'Lleva tres días dentro de una caja de Amazon. Se niega a salir hasta que le den una más grande.', t: 'cajaxl', h: 6 },
  { id: 'influencer', sp: 'gato', title: 'Influencer en crisis', desc: 'Ha perdido 3 seguidores en Instagram y no quiere comer. Exige mejor iluminación.', t: 'aro', h: 8, rev: 4, revTxt: 'revisar el engagement' },
  { id: 'insomnio', sp: 'gato', title: 'Insomnio vecinal', desc: 'No pega ojo: el vecino toca el acordeón a las 3 de la mañana.', t: 'orejeras', h: 5, acc: 'orejeras' },
  { id: 'diente', sp: 'gato', title: 'Diente torcido', desc: 'Mordió un chuletón de Alejandro sin permiso y se le ha torcido un colmillo.', t: 'brackets', h: 6, rev: 5, revTxt: 'ajustar la ortodoncia' },
  { id: 'lunes', sp: 'gato', title: 'Síndrome del lunes', desc: 'Odia los lunes. Y los martes. Está tirado en el suelo como una alfombra.', t: 'siesta', h: 4 },
  { id: 'perro', sp: 'gato', title: 'Se cree un perro', desc: 'Trae la pelota, mueve la cola y saluda a Alejandro en la puerta. Grave.', t: 'espejo', h: 7, rev: 2, revTxt: 'comprobar que sigue siendo gato' },
  { id: 'nariz', sp: 'gato', title: 'Nariz quemada', desc: 'Se quedó dormido al sol en el balcón y tiene la nariz como un tomate.', t: 'crema', h: 3 },
  { id: 'gordo', sp: 'gato', title: 'No cabe por la gatera', desc: 'Ha engordado tanto que ya no cabe por la gatera. Le echa la culpa a Alejandro.', t: 'dieta', h: 8, rev: 5, revTxt: 'pesaje de control' },
  { id: 'dj', sp: 'gato', title: 'Gato DJ', desc: 'Se rasca tanto la oreja que parece que está pinchando música. Se ha hecho una herida.', t: 'cono', h: 4, acc: 'cono' },
  { id: 'rey', sp: 'gato', title: 'Complejo de rey', desc: 'Se sienta en el trono (el sofá de Alejandro) y exige que le hagan reverencias.', t: 'corona', h: 6, acc: 'corona' },
  { id: 'raton', sp: 'elefante', title: 'Pánico al ratón', desc: 'Ha visto un ratón y lleva dos horas subido a la camilla. La camilla no está bien.', t: 'peluche', h: 4, rev: 4, revTxt: 'segunda sesión de exposición' },
  { id: 'cacahuete', sp: 'elefante', title: 'Cacahuete atascado', desc: 'Tiene un cacahuete en la trompa y respira como una trompeta desafinada.', t: 'pimienta', h: 2 },
  { id: 'olvido', sp: 'elefante', title: 'El elefante olvidadizo', desc: 'Es el primer elefante de la historia que olvida algo. No recuerda qué.', t: 'agenda', h: 6 },
  { id: 'momia', sp: 'elefante', title: 'Piel agrietada', desc: 'Se ha bañado en barro de Estambul y ahora tiene la piel como un desierto.', t: 'vendas', h: 5 },
  { id: 'torticolis', sp: 'jirafa', title: 'Tortícolis a 5 metros', desc: 'Durmió mal y ahora mira fijamente hacia Francia todo el rato.', t: 'collarin', h: 4, rev: 5, revTxt: 'quitar el collarín', acc: 'collarin' },
  { id: 'garganta', sp: 'jirafa', title: 'Dolor de garganta', desc: 'Son dos metros de garganta, así que duele el doble.', t: 'bufanda', h: 5, acc: 'bufanda' },
  { id: 'vertigo', sp: 'jirafa', title: 'Jirafa con vértigo', desc: 'Se marea con su propia altura. No quiere mirar hacia abajo.', t: 'terapia', h: 6 },
  { id: 'palabrotas', sp: 'pájaro', title: 'Loro malhablado', desc: 'Solo dice palabrotas en alemán. Muy bien pronunciadas, eso sí.', t: 'modales', h: 6, rev: 4, revTxt: 'examen de vocabulario' },
  { id: 'volar', sp: 'pájaro', title: 'Miedo a volar', desc: 'Pájaro que se niega a volar. Quiere ir a todas partes en Porsche, como Safiye.', t: 'paracaidas', h: 5 },
  { id: 'reggaeton', sp: 'pájaro', title: 'Canario desafinado', desc: 'Canta reguetón a todas horas en vez de canciones de pájaro.', t: 'diapason', h: 4 },
  { id: 'calor', sp: 'pájaro', title: 'Golpe de calor', desc: 'Se quedó encima del Porsche al sol. Está más caliente que el motor.', t: 'ventilador', h: 3 },
  { id: 'sol', sp: 'león', title: 'Al rey no le gusta el sol', desc: 'Le molesta muchísimo el sol. Dice que es el rey de la selva, no de la playa.', t: 'sombrero', h: 3, acc: 'sombrero' },
  { id: 'melena', sp: 'león', title: 'Melena encrespada', desc: 'La humedad le ha dejado la melena como un estropajo. No quiere salir en las fotos.', t: 'acondicionador', h: 5 },
  { id: 'vegano', sp: 'león', title: 'León vegano', desc: 'Se ha hecho vegano y está en plena crisis existencial.', t: 'tofu', h: 6, rev: 4, revTxt: 'revisar sus niveles de hierro' },
  { id: 'rugido', sp: 'león', title: 'Ha perdido el rugido', desc: 'Intenta rugir y le sale «miau». Las hienas se ríen de él.', t: 'miel', h: 4 },
  { id: 'gatitos', sp: 'gato', title: 'Bajón de energía', desc: 'Antes cazaba moscas, ahora solo las mira con desprecio desde el sofá.', t: 'vitaminas', h: 5 },
];

export const NAMES = {
  gato: ['Michi', 'Luna', 'Kebab', 'Pretzel', 'Churro', 'Lokum', 'Simit', 'Bolita', 'Sultán', 'Kaiser', 'Mimi', 'Nube', 'Croqueta', 'Baklava', 'Strudel', 'Tapita', 'Pimienta', 'Garbanzo', 'Lahmacun', 'Brezel'],
  elefante: ['Trompetas', 'Señor Kilos', 'Elefantina', 'Don Colmillo', 'Bombón'],
  jirafa: ['Altísima', 'Rascacielos', 'Jirafina', 'Cuellito', 'Torre'],
  'pájaro': ['Herr Pío', 'Kiko', 'Lorenzo', 'Plumita', 'Paco'],
  'león': ['Leónidas', 'Rey Bigotes', 'Melenas', 'Leo', 'Simbad'],
};
export const PAY = { gato: 90, 'pájaro': 70, 'león': 260, jirafa: 230, elefante: 300 };
export const SPECIES_EMOJI = { gato: '🐱', elefante: '🐘', jirafa: '🦒', 'pájaro': '🦜', 'león': '🦁' };
export const SPECIES_WEIGHTS = [['gato', 0.52], ['pájaro', 0.12], ['león', 0.12], ['jirafa', 0.12], ['elefante', 0.12]];

export const CLINICS = {
  stuttgart: { name: 'Stuttgart', full: 'Clínica Safiye · Stuttgart', flag: '🇩🇪', cost: 0, every: 55, cap: 4, km: '6 km', tag: 'Sede principal' },
  estambul: { name: 'Estambul', full: 'Safiye Veteriner · İstanbul', flag: '🇹🇷', cost: 1200, every: 70, cap: 4, km: '2.200 km', tag: 'Junto al Bósforo' },
  barcelona: { name: 'Barcelona', full: 'Clínica Safiye · Barcelona', flag: '🇪🇸', cost: 2500, every: 60, cap: 5, km: '1.050 km', tag: 'Director: Emilio' },
};

export const FOODS = [
  { id: 'chuleton', name: 'Chuletón de vaca rubia gallega', note: '1 kg a 200 €/kg', emoji: '🥩', price: 200, feli: 40, sac: 90, line: 'Safi… esto es lo más bonito que me ha pasado en la vida.' },
  { id: 'jamon', name: 'Jamón ibérico de bellota', note: 'Cortado a cuchillo', emoji: '🍖', price: 120, feli: 30, sac: 45, line: '¿Cortado a cuchillo? Te quiero.' },
  { id: 'sushi', name: 'Sushi omakase', note: '12 piezas del chef', emoji: '🍣', price: 90, feli: 25, sac: 60, line: 'Arigato, Safi-san.' },
  { id: 'paella', name: 'Paella de marisco', note: 'Con socarrat', emoji: '🥘', price: 45, feli: 18, sac: 80, line: '¡Con socarrat! Como en casa.' },
  { id: 'iskender', name: 'İskender kebap', note: 'Receta de Estambul', emoji: '🌯', price: 25, feli: 12, sac: 75, line: 'Çok güzel… ¿se dice así?' },
  { id: 'spaetzle', name: 'Käsespätzle', note: 'Muy de Stuttgart', emoji: '🧀', price: 15, feli: 6, sac: 70, line: 'Muy alemán. Muy correcto.' },
  { id: 'pizza', name: 'Pizza congelada', note: 'Del súper', emoji: '🍕', price: 4, feli: 0, sac: 50, line: 'Bueno… alimenta.' },
  { id: 'mcdonalds', name: 'Hamburguesa del McDonald\'s', note: 'Menú del día', emoji: '🍔', price: 6, feli: -15, sac: 45, line: '¿Esto es lo que valgo para ti, Safi?' },
  { id: 'ensalada', name: 'Ensalada triste', note: 'Tres hojas y un tomate', emoji: '🥗', price: 3, feli: -10, sac: 25, line: 'Esto no es comida, es decoración.' },
];

export const UPGRADES = [
  { id: 'hierba', name: 'Hierba gatera premium', emoji: '🌿', price: 400, desc: 'Los gatos aguantan un 25 % más en la sala de espera.' },
  { id: 'musica', name: 'Música relajante en la sala', emoji: '🎻', price: 650, desc: 'Todos los pacientes aguantan un 15 % más.' },
  { id: 'cafetera', name: 'Cafetera italiana para Safiye', emoji: '☕', price: 300, desc: 'Cobras un 10 % más por cada caso (Safiye trabaja con alegría).' },
  { id: 'turbo', name: 'Porsche 911 Turbo S', emoji: '🏎️', price: 1500, desc: 'Viajes el doble de rápidos y colores especiales.' },
];

export const PORSCHE_COLORS = [
  ['Guards Red', '#c8102e'], ['Miami Blue', '#00a3e0'], ['Chalk', '#d8d5cc'], ['Racing Yellow', '#f7c600'],
  ['Negro Jet', '#1c1f24'], ['Verde Python', '#5e8a3a'], ['Rosa Frozen Berry', '#d27aa6', 'turbo'], ['Oro Safiye', '#c9a14a', 'turbo'],
];

export const ALE_ACTIVITY = {
  play: { label: 'Jugando a la PlayStation en el sofá', emoji: '🎮' },
  trabajo: { label: 'Teletrabajando en la habitación', emoji: '💻' },
  barbacoa: { label: 'Haciendo una barbacoa en el jardín', emoji: '🔥' },
  piscina: { label: 'En su piscina de plástico', emoji: '🛟' },
  dormir: { label: 'Durmiendo como un bebé', emoji: '😴' },
};

export const EMILIO_LINES = [
  'Tranquila, Safi. Barcelona está controlada.',
  '¿Un cortado mientras curamos a este loro?',
  'He puesto la sala de espera en modo Gaudí.',
  'El león de ayer ya me sigue en Instagram.',
  'Aquí los gatos toman el sol en la Barceloneta.',
];
