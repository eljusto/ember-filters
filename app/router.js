import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('index', {path: '/'});
  this.resource('search-criterias', {path: '/search'}, function() {
    this.route('products', {path: 'products/:searchCriterias'} );
  });

});

export default Router;
