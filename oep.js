/* jslint node: true */

'use strict';

var jwt = require('jsonwebtoken'); // sign with default (HMAC SHA256)
var Client = require('node-rest-client').Client;
var client = new Client();

// Variables privadas
var url_autenticacion = 'http://oepbolivia.xyz/api/referendum/people/signature/';
var url_consulta = 'http://oepbolivia.xyz/api/referendum/people/perform/';
var url_imagen = 'http://www.oep.org.bo/img/point.png';

// Constructor
function OEP() {
  this._client_secret = null;
  this._client_id = null;
  this._ci = null;
  this._fecha_nacimiento = null; // String en formato yyyy-mm-dd
}

// Métodos de instancia
OEP.prototype.buscarPersona = function(entrada, callback) {
  var self = this, resultado, datos;
  self.extraerEntrada(entrada);
  self.iniciarSesion(function () {
    self.generarArgs(function (args) {
      datos = {
        data: args,
        headers: { "Content-Type": "application/json" }
      };
      client.post(url_consulta, datos, function(data, response) {
        callback(data, response);
      });
    });
  });
};

OEP.prototype.extraerAutenticacion = function(data) {
  var decoded = jwt.decode(data.value);
  this._client_id = decoded.client_id;
  this._client_secret = decoded.client_secret;
};

/**
 * Verifica si se ha cambiado un atributo con respecto al parámetro `entrada`
 * en cuyo caso retorna `true`, caso contrario retorna `false`;
 */
OEP.prototype.extraerEntrada = function (entrada) {
  this._ci = entrada.ci;
  this._fecha_nacimiento = entrada.fecha_nacimiento;
};

OEP.prototype.extraerLlave = function (callback) {
  var enBase64;
  client.get(url_imagen, function (data, response) {
    enBase64 = 'data:' + response.headers['content-type'] + ';base64,' + new Buffer(data).toString('base64');
    callback(enBase64.substring(23, 63));
  });
};

OEP.prototype.generarArgs = function (callback) {
  var self = this;
  self.generarSignature(function (signature) {
    callback({
      signature: signature,
      client_id: self._client_id,
      client_secret: self._client_secret
    });
  });
};

OEP.prototype.generarSignature = function (callback) {
  var self = this, token, datos, headers;
  self.extraerLlave(function (llave) {
    datos = {
      document: self._ci,
      born: self._fecha_nacimiento
    };
    token = jwt.sign(datos, llave, {noTimestamp: true});
    callback(token);
  });
};

OEP.prototype.iniciarSesion = function (callback) {
  var self = this;
  client.get(url_autenticacion, function (data, response) {
    self.extraerAutenticacion(data);
    callback();
  });
};

module.exports = OEP;
