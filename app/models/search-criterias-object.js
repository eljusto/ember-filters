export default DS.Model.extend({
  categories: DS.hasMany('Category', {embedded: 'always'}),
  filters: DS.hasMany('Filter', {embedded: 'always'}),
  dictionaries: DS.attr(),
  appliedState: DS.attr()
});
