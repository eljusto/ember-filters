var Filter = DS.Model.extend({
  title: DS.attr(),
  items: DS.hasMany('FilterItem', {embedded: 'always'}),

  displayItems: function() {
    var displayItems = false;
    this.get('items').content.forEach(function(filter){
      var mode = filter.get('filterMode') || 'off';
      if (mode !== 'off') {
        displayItems = true;
      }
      filter.get('linkedFilterItems').content.forEach(function(lf){
        var lfMode = lf.get('filterMode') || 'off';
        if (lfMode !== 'off') {
          displayItems = true;
        }
      });
    });
    if (this.get('items').content.length < 4) {
      displayItems = true;
    }
    return displayItems;
  }.property('filters')
});

export default Filter;
