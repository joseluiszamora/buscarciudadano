var OEP = require('./oep');

var oep = new OEP();
var entrada = {
  ci: '6051949',  // cambiar por el carnet buscado
  fecha_nacimiento: '1985-07-28' // cambiar la fecha de nacimiento
};
oep.buscarPersona(entrada, function (datos, respuesta) {
  console.log('OEP Servicio datos:', datos);
  //console.log('OEP Servicio respuesta:', respuesta);

  // TODO: procesar la salida de las variables 'datos' y 'respuesta'
});
