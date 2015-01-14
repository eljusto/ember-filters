var CategoryItem = DS.Model.extend({
  title: DS.attr(),
  count: DS.attr(),
  mode: DS.attr(),
  category: DS.belongsTo('Category'),
  weight: DS.attr(),

  switchMode: function(){
    var currentMode = this.get('mode');
    switch (currentMode) {
      case 'include':
        currentMode = 'exclude';
        break;
      case 'exclude':
        currentMode = 'off';
        break;
      default:
        currentMode = 'include';
    }
    this.set('mode', currentMode);
  },

  isChecked: function(){
    var filterMode = this.get('mode');
    if (filterMode !== undefined && filterMode !== 'off') {
      return true;
    }
    return false;
    }.property('mode'),

  isWeightMoreThanZero: function(){
    var weight = this.get('weight');
    if (weight > 0) {
      return true;
    }
    return false;
  }.property('weight')
});

export default CategoryItem;
