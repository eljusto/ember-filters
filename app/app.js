/*global app:false, localStorage:false, Swag: false */

import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

Ember.MODEL_FACTORY_INJECTIONS = true;

var basePath = '',
    baseUrl = 'http://localhost:8000',
    user = {id: "1", name: "root"},
    imagePrefix = 'assets/images/catalog/',
    tabId = '1';
if (typeof app !== "undefined") {
  if (app.base_path)    { basePath = app.base_path; }
  if (app.base_url)     { baseUrl = app.base_url; }
  if (app.user)         { user = app.user; }
  if (app.image_prefix) { imagePrefix = app.image_prefix; }
  if (app.tabId)        { tabId = app.tabId; }
}

//Init Swag helpers
Swag.registerHelpers();

//Add tabId in all jQuery ajaxs
$.ajaxSetup({ data: { tabId: tabId } });

var localStore = Ember.Object.extend({
  getObject: function(name) {
    return JSON.parse(localStorage.getItem(name));
  },
  setObject: function(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
  },
  getItem: function(name) {
    return localStorage.getItem(name);
  },
  setItem: function(name, value) {
    localStorage.setItem(name, value);
  },
  getItemForTab: function(name) {
    return localStorage.getItem(tabId + '' + name);
  },
  setItemForTab: function(name, value) {
    localStorage.setItem(tabId + '' + name, value);
  },
});


var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver,
  basePath: basePath,
  baseUrl:  baseUrl,
  user: user,
  localStore: localStore.create(),
  imagePrefix: imagePrefix,
  tabId: tabId
});

loadInitializers(App, config.modulePrefix);

export default App;
