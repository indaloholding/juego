// Datos del titular leídos de «1. Datos Fiscales.docx» (Drive de david@indaloholding.com) el 16/10/2026.
const T = {
  nombre: 'INDALO BROKERING - FZCO (Indalo Holding)', forma: 'Free Zone Company (FZCO)', licencia: '79489', registro: '77739',
  domicilio: 'DSO-IFZA, IFZA Properties, Dubai Silicon Oasis, Dubái (Emiratos Árabes Unidos)', actividad: 'Commercial Brokers',
  gerente: 'David Huertas Santiago', email: 'david@indaloholding.com',
  rep: 'David Huertas Santiago, Av. de Elvas, 6, Badajoz (España)',
};
const UPD = '16 de octubre de 2026';
const mail = `<a href="mailto:${T.email}">${T.email}</a>`;

export const LEGAL = {
  aviso: ['Aviso legal', `
<p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de los datos del titular de este sitio web:</p>
<ul>
<li><b>Titular:</b> ${T.nombre}</li><li><b>Forma jurídica:</b> ${T.forma}</li>
<li><b>Número de licencia:</b> ${T.licencia} · <b>Número de registro:</b> ${T.registro}</li>
<li><b>Domicilio:</b> ${T.domicilio}</li><li><b>Actividad:</b> ${T.actividad}</li>
<li><b>Gerente:</b> ${T.gerente}</li><li><b>Correo electrónico de contacto:</b> ${mail}</li>
<li><b>Representante en la UE (art. 27 RGPD):</b> ${T.rep}</li>
</ul>
<h3>Objeto</h3><p>«Safiye · The Videogame» es un videojuego web gratuito, creado como regalo personal y de acceso restringido mediante código. No tiene fines comerciales ni contiene compras.</p>
<h3>Propiedad intelectual</h3><p>El código, los modelos 3D procedurales, los textos y el diseño son obra del titular o se usan con licencia abierta (Three.js, MIT; tipografías Fredoka y Nunito, SIL Open Font License). Los nombres de marcas mencionados (Porsche 911, PlayStation, McDonald's, Amazon, Instagram) pertenecen a sus propietarios y se citan solo con fines humorísticos y descriptivos, sin relación ni patrocinio.</p>
<h3>Responsabilidad</h3><p>Todo el contenido es ficticio y de humor. Los «tratamientos» del juego no son consejos veterinarios: ante cualquier problema de salud de un animal real, consulta con un veterinario colegiado.</p>
<h3>Legislación</h3><p>Este aviso se rige por la legislación española en lo aplicable a usuarios ubicados en España.</p>`],
  privacidad: ['Política de privacidad', `
<p>Información conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).</p>
<h3>Responsable</h3><p>${T.nombre}, ${T.domicilio}. Contacto: ${mail}. Como el responsable está establecido fuera del Espacio Económico Europeo, se designa como <b>representante en la UE</b> (art. 27 RGPD) a ${T.rep}.</p>
<h3>Qué datos tratamos</h3><p>Para que cada persona tenga su propia partida, al crear una sesión guardamos: el <b>nombre que elijas</b> (puede ser un apodo), tu <b>PIN de 4 cifras cifrado</b> (nunca se guarda tal cual) y los <b>datos de tu partida</b> (dinero del juego, pacientes, estado de Alejandro, ajustes). No pedimos email, teléfono ni ningún otro dato, y no hay analíticas ni publicidad. En tu navegador se guardan una copia de la partida y un identificador de sesión para no tener que escribir el PIN cada vez.</p>
<p>Al visitar la web, el proveedor de alojamiento registra de forma técnica la dirección IP, el navegador y la fecha de acceso para servir la página y garantizar su seguridad.</p>
<h3>Finalidad y base jurídica</h3><p>Prestarte el juego que solicitas y guardar tu partida para que puedas seguir desde cualquier dispositivo (ejecución del servicio que pides, art. 6.1.b RGPD) y mantener la seguridad, incluido el bloqueo temporal tras varios PIN incorrectos (interés legítimo, art. 6.1.f RGPD).</p>
<h3>Destinatarios y transferencias internacionales</h3><p>El alojamiento y el almacenamiento de las sesiones los presta Netlify, Inc. (EE. UU.) como encargado del tratamiento. Las partidas se almacenan en su región de la Unión Europea (Fráncfort), aunque Netlify puede acceder desde EE. UU.; esa transferencia se ampara en el Marco de Privacidad de Datos UE-EE. UU. y/o en las cláusulas contractuales tipo de la Comisión Europea. El responsable, situado en los Emiratos Árabes Unidos, solo accede a los datos para mantener el juego o por requerimiento legal.</p>
<h3>Plazos de conservación</h3><p>Tu sesión y tu partida se conservan mientras quieras jugar. Puedes borrarlas tú mismo en cualquier momento desde <i>Ajustes › Borrar mi sesión</i>, y se eliminarán de inmediato de la nube y del dispositivo. Los registros técnicos del alojamiento se conservan el tiempo que fija Netlify (normalmente unos días).</p>
<h3>Tus derechos</h3><p>Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${mail}. Si consideras que no se han atendido, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>
<p class="fine">Última actualización: ${UPD}.</p>`],
  cookies: ['Política de cookies', `
<p>Conforme al artículo 22.2 de la LSSI-CE:</p>
<p>Este sitio <b>no utiliza cookies</b> propias ni de terceros, ni de analítica, ni de publicidad, ni de redes sociales. Las tipografías van incluidas en la propia web, sin conexión a servicios externos.</p>
<p>Solo se usa el <b>almacenamiento local del navegador</b> (localStorage) para cosas estrictamente necesarias para el funcionamiento que pides: recordar tu sesión (nombre e identificador de sesión), que ya has introducido el código de acceso y una copia de tu partida. Al ser técnico y necesario, está exento de consentimiento y por eso no se muestra un banner de cookies.</p>
<p>Puedes borrar estos datos desde <i>Ajustes › Cambiar de sesión</i> o <i>Borrar mi sesión</i>, o desde la configuración de tu navegador.</p>
<p class="fine">Última actualización: ${UPD}.</p>`],
  terminos: ['Términos y condiciones', `
<h3>1. Qué es</h3><p>«Safiye · The Videogame» es un juego web gratuito ofrecido por ${T.nombre} como regalo personal. El acceso requiere un código.</p>
<h3>2. Uso</h3><p>Puedes jugar libremente para uso personal y no comercial. No está permitido copiar, revender o explotar comercialmente el juego.</p>
<h3>3. Contenido ficticio</h3><p>Personajes, casos clínicos y situaciones son inventados y en tono de humor. Ningún animal real ha sufrido durante el desarrollo (algún gato ha llevado gafas, eso sí). El dinero del juego es virtual y no tiene valor real; no existen compras dentro del juego.</p>
<h3>4. Sesiones</h3><p>Cada persona crea su propia sesión con un nombre y un PIN. Guarda tu PIN: si lo olvidas, escribe a ${mail} para recuperar la sesión. No uses tu nombre completo si prefieres un apodo.</p>
<h3>5. Tiempo real</h3><p>El juego avanza con la hora real de tu dispositivo, también cuando está cerrado. Los pacientes que no se atienden a tiempo pueden «cruzar el arcoíris» dentro del juego. Puedes cerrar una clínica por vacaciones desde el menú Viajar.</p>
<h3>6. Disponibilidad</h3><p>El juego se ofrece «tal cual». El titular puede modificarlo o retirarlo, y no garantiza que las partidas se conserven para siempre.</p>
<h3>7. Contacto y ley aplicable</h3><p>${mail}. Se aplica la legislación española en lo que corresponda a usuarios en España, sin perjuicio de los derechos que te reconozca tu normativa de consumo.</p>
<p class="fine">Última actualización: ${UPD}.</p>`],
};

export function legalHTML(tab = 'aviso') {
  const tabs = Object.entries(LEGAL).map(([k, [n]]) => `<button data-legal="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('');
  return `<h2>Información legal</h2><div class="legal-tabs">${tabs}</div><div class="legal-body"><h3>${LEGAL[tab][0]}</h3>${LEGAL[tab][1]}</div>`;
}
