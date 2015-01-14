/*global App:false */
var namespace = 'api';
var ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: namespace,
  host: App.baseUrl
});

export default ApplicationAdapter;
