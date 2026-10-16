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

// short = el problema en pocas palabras · sym = emoji del síntoma (se ve sobre el animal)
export const CASES = [
  { id: 'miope', sp: 'gato', sym: '😵‍💫', short: 'No ve nada', title: 'Michi miope', desc: 'Se choca con las paredes y anoche intentó cazar al robot aspirador creyendo que era un ratón gigante.', t: 'gafas', h: 5, rev: 5, revTxt: 'revisión de graduación' },
  { id: 'esfinge', sp: 'gato', v: 6, sym: '🥶', short: 'Tiene muchísimo frío', title: 'Esfinge congelado', desc: 'Gato sin pelo tiritando. Dice que en Stuttgart hace un frío que no es normal.', t: 'jersey', h: 4 },
  { id: 'ladra', sp: 'gato', sym: '🐶', short: 'Ladra en vez de maullar', title: 'El gato que ladra', desc: 'Ha empezado a ladrar. Los vecinos han llamado a la policía alemana dos veces.', t: 'clases', h: 6, rev: 3, revTxt: 'examen de maullido' },
  { id: 'bola', sp: 'gato', sym: '🤮', short: 'Bola de pelo enorme', title: 'Bola de pelo XXL', desc: 'Tiene una bola de pelo del tamaño de un melón y tose como un señor de 80 años.', t: 'malta', h: 3 },
  { id: 'caja', sp: 'gato', sym: '📦', short: 'Quiere una caja más grande', title: 'Okupa de Amazon', desc: 'Lleva tres días dentro de una caja de Amazon. Se niega a salir hasta que le den una más grande.', t: 'cajaxl', h: 6 },
  { id: 'influencer', sp: 'gato', sym: '📉', short: 'Pierde seguidores', title: 'Influencer en crisis', desc: 'Ha perdido 3 seguidores en Instagram y no quiere comer. Exige mejor iluminación para sus selfies.', t: 'aro', h: 8, rev: 4, revTxt: 'revisar el engagement' },
  { id: 'insomnio', sp: 'gato', sym: '🪗', short: 'El ruido no le deja dormir', title: 'Insomnio vecinal', desc: 'No pega ojo: el vecino toca el acordeón a las 3 de la mañana.', t: 'orejeras', h: 5 },
  { id: 'diente', sp: 'gato', sym: '🦷', short: 'Colmillo torcido', title: 'Diente torcido', desc: 'Mordió un chuletón de Alejandro sin permiso y se le ha torcido un colmillo.', t: 'brackets', h: 6, rev: 5, revTxt: 'ajustar la ortodoncia' },
  { id: 'lunes', sp: 'gato', sym: '🫠', short: 'Agotado, no se levanta', title: 'Síndrome del lunes', desc: 'Odia los lunes. Y los martes. Está tirado en el suelo como una alfombra.', t: 'siesta', h: 4 },
  { id: 'perro', sp: 'gato', sym: '🐕', short: 'Se cree un perro', title: 'Se cree un perro', desc: 'Trae la pelota, mueve la cola y saluda a Alejandro en la puerta. Grave: necesita verse tal como es.', t: 'espejo', h: 7, rev: 2, revTxt: 'comprobar que sigue siendo gato' },
  { id: 'nariz', sp: 'gato', sym: '☀️', short: 'Nariz quemada por el sol', title: 'Nariz quemada', desc: 'Se quedó dormido al sol en el balcón y tiene la nariz como un tomate.', t: 'crema', h: 3 },
  { id: 'gordo', sp: 'gato', sym: '🍔', short: 'Sobrepeso', title: 'No cabe por la gatera', desc: 'Ha engordado tanto que ya no cabe por la gatera. Le echa la culpa a Alejandro.', t: 'dieta', h: 8, rev: 5, revTxt: 'pesaje de control' },
  { id: 'dj', sp: 'gato', sym: '🎧', short: 'Se rasca la herida', title: 'Gato DJ', desc: 'Se rasca tanto la oreja que parece que está pinchando música. Se ha hecho una herida y no debe tocarla.', t: 'cono', h: 4 },
  { id: 'rey', sp: 'gato', sym: '🤴', short: 'Se cree de la realeza', title: 'Complejo de rey', desc: 'Se sienta en el trono (el sofá de Alejandro) y exige que le hagan reverencias. Hay que darle la razón.', t: 'corona', h: 6 },
  { id: 'gatitos', sp: 'gato', sym: '🔋', short: 'Sin energía', title: 'Bajón de energía', desc: 'Antes cazaba moscas, ahora solo las mira con desprecio desde el sofá.', t: 'vitaminas', h: 5 },
  { id: 'raton', sp: 'elefante', sym: '🐭', short: 'Pánico a los ratones', title: 'Pánico al ratón', desc: 'Ha visto un ratón y lleva dos horas subido a la camilla. La camilla no está bien.', t: 'peluche', h: 4, rev: 4, revTxt: 'segunda sesión de exposición' },
  { id: 'cacahuete', sp: 'elefante', sym: '🥜', short: 'Trompa atascada', title: 'Cacahuete atascado', desc: 'Tiene un cacahuete en la trompa y respira como una trompeta desafinada. Hay que hacerle estornudar.', t: 'pimienta', h: 2 },
  { id: 'olvido', sp: 'elefante', sym: '❓', short: 'Se le olvida todo', title: 'El elefante olvidadizo', desc: 'Es el primer elefante de la historia que olvida algo. No recuerda qué.', t: 'agenda', h: 6 },
  { id: 'momia', sp: 'elefante', sym: '🏜️', short: 'Piel agrietada', title: 'Piel agrietada', desc: 'Se ha bañado en barro de Estambul y ahora tiene la piel como un desierto.', t: 'vendas', h: 5 },
  { id: 'torticolis', sp: 'jirafa', sym: '🤕', short: 'Cuello torcido', title: 'Tortícolis a 5 metros', desc: 'Durmió mal y ahora mira fijamente hacia Francia todo el rato.', t: 'collarin', h: 4, rev: 5, revTxt: 'quitar el collarín' },
  { id: 'garganta', sp: 'jirafa', sym: '🤒', short: 'Dolor de garganta', title: 'Dolor de garganta', desc: 'Son dos metros de garganta, así que duele el doble.', t: 'bufanda', h: 5 },
  { id: 'vertigo', sp: 'jirafa', sym: '😰', short: 'Vértigo y ansiedad', title: 'Jirafa con vértigo', desc: 'Se marea con su propia altura. No quiere mirar hacia abajo y necesita hablarlo.', t: 'terapia', h: 6 },
  { id: 'palabrotas', sp: 'pájaro', sym: '🤬', short: 'Dice palabrotas', title: 'Loro malhablado', desc: 'Solo dice palabrotas en alemán. Muy bien pronunciadas, eso sí.', t: 'modales', h: 6, rev: 4, revTxt: 'examen de vocabulario' },
  { id: 'volar', sp: 'pájaro', sym: '🙅', short: 'Miedo a volar', title: 'Miedo a volar', desc: 'Pájaro que se niega a volar. Quiere ir a todas partes en Porsche, como Safiye.', t: 'paracaidas', h: 5 },
  { id: 'reggaeton', sp: 'pájaro', sym: '🎶', short: 'Canta desafinado', title: 'Canario desafinado', desc: 'Canta reguetón a todas horas en vez de canciones de pájaro, y desafina.', t: 'diapason', h: 4 },
  { id: 'calor', sp: 'pájaro', sym: '🥵', short: 'Golpe de calor', title: 'Golpe de calor', desc: 'Se quedó encima del Porsche al sol. Está más caliente que el motor.', t: 'ventilador', h: 3 },
  { id: 'sol', sp: 'león', sym: '☀️', short: 'Le molesta el sol', title: 'Al rey no le gusta el sol', desc: 'Le molesta muchísimo el sol. Dice que es el rey de la selva, no de la playa.', t: 'sombrero', h: 3 },
  { id: 'melena', sp: 'león', sym: '💥', short: 'Melena encrespada', title: 'Melena encrespada', desc: 'La humedad le ha dejado la melena como un estropajo. No quiere salir en las fotos.', t: 'acondicionador', h: 5 },
  { id: 'vegano', sp: 'león', sym: '🥦', short: 'Vegano en crisis', title: 'León vegano', desc: 'Se ha hecho vegano y está en plena crisis existencial. Echa de menos la textura de la carne.', t: 'tofu', h: 6, rev: 4, revTxt: 'revisar sus niveles de hierro' },
  { id: 'rugido', sp: 'león', sym: '🔇', short: 'Afónico', title: 'Ha perdido el rugido', desc: 'Intenta rugir y le sale «miau». Las hienas se ríen de él.', t: 'miel', h: 4 },
  // exóticos
  { id: 'hormiga-sol', sp: 'hormiga', sym: '☀️', short: 'Insolación', title: 'Hormiga con insolación', desc: 'Una hormiga obrera se pasó el día cargando migas al sol. Necesita sombra, mucha sombra.', t: 'sombrero', h: 3 },
  { id: 'hormiga-fuerza', sp: 'hormiga', sym: '🏋️', short: 'Ya no levanta peso', title: 'Hormiga sin fuerza', desc: 'Antes levantaba 50 veces su peso. Ahora no puede ni con una miga de pan de molde.', t: 'vitaminas', h: 5 },
  { id: 'pinguino-calor', sp: 'pingüino', sym: '🥵', short: 'Se derrite de calor', title: 'Pingüino en Barcelona', desc: 'Vino de vacaciones a la Barceloneta y se está derritiendo como un polo.', t: 'ventilador', h: 3 },
  { id: 'pinguino-volar', sp: 'pingüino', sym: '🪽', short: 'Quiere volar', title: 'Pingüino soñador', desc: 'Se ha subido a la nevera de Alejandro convencido de que esta vez sí va a volar.', t: 'paracaidas', h: 5 },
  { id: 'croc-muelas', sp: 'cocodrilo', sym: '🦷', short: 'Dientes torcidos', title: 'Cocodrilo con mala sonrisa', desc: 'Tiene 80 dientes y todos torcidos. No se atreve a sonreír en las fotos de la boda.', t: 'brackets', h: 6, rev: 4, revTxt: 'apretar los brackets' },
  { id: 'croc-llora', sp: 'cocodrilo', sym: '😭', short: 'Llora por todo', title: 'Lágrimas de cocodrilo', desc: 'Llora con los anuncios, con las películas y hasta con el tiempo. Necesita desahogarse.', t: 'terapia', h: 5 },
  { id: 'tortuga-estres', sp: 'tortuga', sym: '😫', short: 'Estrés por la prisa', title: 'Tortuga estresada', desc: 'Quiere ir más rápido que el Porsche de Safiye. No duerme pensando en ello.', t: 'siesta', h: 7 },
  { id: 'tortuga-rayada', sp: 'tortuga', sym: '🩹', short: 'Caparazón rayado', title: 'Caparazón rayado', desc: 'Intentó aparcar en la Autobahn y se rayó el caparazón con un guardarraíl.', t: 'vendas', h: 6 },
  { id: 'mono-piojos', sp: 'mono', sym: '🐜', short: 'Pelo enredado', title: 'Mono despeinado', desc: 'Lleva una semana sin peinarse y ya le viven tres familias de bichos en el pelo.', t: 'acondicionador', h: 5 },
  { id: 'mono-movil', sp: 'mono', sym: '📱', short: 'Adicto al móvil', title: 'Mono enganchado', desc: 'No suelta el móvil ni para comer plátanos. Habla solo de criptomonedas.', t: 'terapia', h: 6, rev: 3, revTxt: 'test de desconexión' },
  { id: 'panda-ojeras', sp: 'panda', sym: '🥱', short: 'No duerme nada', title: 'Panda con ojeras', desc: 'Las ojeras ya no son de nacimiento: lleva tres noches viendo series.', t: 'siesta', h: 6 },
  { id: 'panda-color', sp: 'panda', sym: '🤔', short: 'No sabe de qué color es', title: 'Panda confundido', desc: 'No sabe si es blanco con manchas negras o negro con manchas blancas. Crisis de identidad.', t: 'espejo', h: 5 },
  { id: 'flamenco-rosa', sp: 'flamenco', sym: '🤍', short: 'Ha perdido el color rosa', title: 'Flamenco descolorido', desc: 'Ha comido pasta sin tomate una semana entera y se ha quedado blanco. Le faltan vitaminas.', t: 'vitaminas', h: 5, rev: 4, revTxt: 'comprobar el color' },
  { id: 'flamenco-pata', sp: 'flamenco', sym: '🦵', short: 'Tobillo torcido', title: 'Flamenco cojo', desc: 'Lleva 6 horas a una pata y se le ha torcido el tobillo. Ahora no sabe con cuál apoyarse.', t: 'vendas', h: 4 },
  { id: 'pulpo-brazos', sp: 'pulpo', sym: '🤹', short: 'No organiza sus 8 brazos', title: 'Pulpo desorganizado', desc: 'Tiene ocho brazos y ninguno sabe lo que hace el otro. Llega tarde a todo.', t: 'agenda', h: 6 },
  { id: 'pulpo-frio', sp: 'pulpo', sym: '🥶', short: 'Tiene frío', title: 'Pulpo friolero', desc: 'Salió del mar a ver Stuttgart y se ha quedado helado. Pide un jersey (de ocho mangas).', t: 'jersey', h: 4 },
  { id: 'camello-sol', sp: 'camello', sym: '🌞', short: 'Insolación', title: 'Camello achicharrado', desc: 'Ha cruzado Estambul a pie a mediodía. Hasta los camellos tienen un límite.', t: 'sombrero', h: 4 },
  { id: 'camello-joroba', sp: 'camello', sym: '🎈', short: 'Joroba desinflada', title: 'Joroba desinflada', desc: 'Se le ha desinflado la joroba. Necesita energía urgente.', t: 'vitaminas', h: 5 },
  { id: 'rana-principe', sp: 'rana', sym: '💋', short: 'Se cree un príncipe', title: 'Rana con aires de príncipe', desc: 'Pide besos a todo el mundo porque está segura de que es un príncipe encantado. Hay que seguirle el juego.', t: 'corona', h: 6 },
  { id: 'rana-croar', sp: 'rana', sym: '🔇', short: 'Afónica', title: 'Rana afónica', desc: 'Ya no croa. Se ha quedado sin voz de tanto cantar en el karaoke del estanque.', t: 'miel', h: 4 },
  { id: 'perezoso-tarde', sp: 'perezoso', sym: '⏰', short: 'Llega tarde a todo', title: 'Perezoso impuntual', desc: 'Llega tarde a todas sus citas. A esta consulta ha llegado con tres semanas de retraso.', t: 'agenda', h: 8 },
  { id: 'perezoso-hiper', sp: 'perezoso', sym: '⚡', short: 'Hiperactivo (sospechoso)', title: 'Perezoso hiperactivo', desc: 'Se tomó un café de Emilio y lleva 4 horas corriendo. Esto no es natural.', t: 'siesta', h: 3 },
];

export const NAMES = {
  gato: ['Michi', 'Luna', 'Kebab', 'Pretzel', 'Churro', 'Lokum', 'Simit', 'Bolita', 'Sultán', 'Kaiser', 'Mimi', 'Nube', 'Croqueta', 'Baklava', 'Strudel', 'Tapita', 'Pimienta', 'Garbanzo', 'Lahmacun', 'Brezel'],
  elefante: ['Trompetas', 'Señor Kilos', 'Elefantina', 'Don Colmillo', 'Bombón'],
  jirafa: ['Altísima', 'Rascacielos', 'Jirafina', 'Cuellito', 'Torre'],
  'pájaro': ['Herr Pío', 'Kiko', 'Lorenzo', 'Plumita', 'Paco'],
  'león': ['Leónidas', 'Rey Bigotes', 'Melenas', 'Leo', 'Simbad'],
  hormiga: ['Migas', 'Hormigón', 'Antonia', 'Obrera 427'], 'pingüino': ['Pingu', 'Frac', 'Hielito', 'Don Esmoquin'],
  cocodrilo: ['Croqueto', 'Sonrisas', 'Lacoste'], tortuga: ['Flash', 'Rayo', 'Speedy'], mono: ['Chita', 'Bananas', 'Monchi'],
  panda: ['Bambú', 'Ojeras', 'Po'], flamenco: ['Rosalía', 'Camarón', 'Pinkie'], pulpo: ['Ocho', 'Paul', 'Tentáculo'],
  camello: ['Joroba', 'Sultán Camel', 'Dunas'], rana: ['Príncipe Gustavo', 'Croac', 'Saltarina'], perezoso: ['Siesta', 'Lentejo', 'Mañana'],
};
export const PAY = { gato: 90, 'pájaro': 70, 'león': 260, jirafa: 230, elefante: 300, hormiga: 60, 'pingüino': 150, cocodrilo: 220, tortuga: 110, mono: 140, panda: 240, flamenco: 160, pulpo: 180, camello: 210, rana: 80, perezoso: 120 };
export const SPECIES_EMOJI = { gato: '🐱', elefante: '🐘', jirafa: '🦒', 'pájaro': '🦜', 'león': '🦁', hormiga: '🐜', 'pingüino': '🐧', cocodrilo: '🐊', tortuga: '🐢', mono: '🐒', panda: '🐼', flamenco: '🦩', pulpo: '🐙', camello: '🐫', rana: '🐸', perezoso: '🦥' };
export const SPECIES_WEIGHTS = [['gato', 0.3], ['pájaro', 0.05], ['león', 0.06], ['jirafa', 0.05], ['elefante', 0.05], ['hormiga', 0.05], ['pingüino', 0.05], ['cocodrilo', 0.05], ['tortuga', 0.04], ['mono', 0.05], ['panda', 0.05], ['flamenco', 0.04], ['pulpo', 0.04], ['camello', 0.04], ['rana', 0.04], ['perezoso', 0.04]];

export const CLINICS = {
  stuttgart: { name: 'Stuttgart', full: 'Clínica Safiye · Stuttgart', flag: '🇩🇪', cost: 0, every: 50, cap: 6, km: '6 km', tag: 'Sede principal' },
  estambul: { name: 'Estambul', full: 'Safiye Veteriner · İstanbul', flag: '🇹🇷', cost: 1200, every: 60, cap: 6, km: '2.200 km', tag: 'Junto al Bósforo' },
  barcelona: { name: 'Barcelona', full: 'Clínica Safiye · Barcelona', flag: '🇪🇸', cost: 2500, every: 55, cap: 7, km: '1.050 km', tag: 'Director: Emilio' },
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
  { id: 'turbo', name: 'Porsche 911 GT3 RS', emoji: '🏎️', price: 1500, desc: 'Alerón gigante, viajes el doble de rápidos y colores especiales.' },
];

export const PORSCHE_COLORS = [
  ['Guards Red', '#c8102e'], ['Miami Blue', '#00a3e0'], ['Chalk', '#d8d5cc'], ['Racing Yellow', '#f7c600'],
  ['Negro Jet', '#1c1f24'], ['Verde Python', '#5e8a3a'], ['Rosa Frozen Berry', '#d27aa6', 'turbo'], ['Oro Safiye', '#c9a14a', 'turbo'], ['Verde Lizard GT3', '#7cc243', 'turbo'],
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
