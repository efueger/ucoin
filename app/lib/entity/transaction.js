"use strict";
var _ = require('underscore');
var rawer = require('../rawer');
var hashf = require('../hashf');
var constants = require('../constants');

var Transaction = function(obj, currency) {

  var that = this;
  var json = obj || {};

  this.locktime = 0;
  this.inputs = [];
  this.unlocks = [];
  this.outputs = [];
  this.issuers = [];

  _(json).keys().forEach(function(key) {
   that[key] = json[key];
  });

  this.version = constants.DOCUMENTS_VERSION;
  this.currency = currency || this.currency;

  if (this.signatories && this.signatories.length)
    this.issuers = this.signatories;
  if (this.issuers && this.issuers.length)
    this.signatories = this.issuers;

  this.json = function() {
    return {
      'version': parseInt(this.version, 10),
      'currency': this.currency,
      'issuers': this.issuers,
      'inputs': this.inputs,
      'unlocks': this.unlocks,
      'outputs': this.outputs,
      'comment': this.comment,
      'locktime': this.locktime,
      'signatures': this.signatures,
      'raw': this.getRaw(),
      'hash': this.hash
    };
  };

  this.getTransaction = function () {
    var tx = {};
    tx.hash = this.hash;
    tx.version = this.version;
    tx.currency = this.currency;
    tx.issuers = this.issuers || this.signatories;
    tx.signatures = this.signatures;
    // Inputs
    tx.inputs = [];
    this.inputs.forEach(function (input) {
      var sp = input.split(':');
      tx.inputs.push({
        type: sp[0],
        identifier: sp[1],
        noffset: parseInt(sp[2]),
        raw: input
      });
    });
    // Unlocks
    tx.unlocks = this.unlocks;
    // Outputs
    tx.outputs = [];
    this.outputs.forEach(function (output) {
      var sp = output.split(':');
      tx.outputs.push({
        amount: parseInt(sp[0]),
        base: parseInt(sp[1]),
        conditions: sp[2],
        raw: output
      });
    });
    tx.comment = this.comment;
    tx.locktime = this.locktime;
    return tx;
  };

  this.getRaw = function () {
    return rawer.getTransaction(this);
  };

  this.getHash = function (recompute) {
    if (recompute || !this.hash) {
      this.hash = hashf(rawer.getTransaction(this)).toUpperCase();
    }
    return this.hash;
  };

  this.compact = function () {
    return rawer.getCompactTransaction(this);
  };

  this.hash = this.hash || hashf(this.getRaw()).toUpperCase();
};

Transaction.statics = {};

Transaction.statics.fromJSON = (json) => new Transaction(json);

module.exports = Transaction;
