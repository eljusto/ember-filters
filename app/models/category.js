var Category = DS.Model.extend({
  title: DS.attr(),
  items: DS.hasMany('CategoryItem', {embedded: 'always'}),

  displayId: function() {
    var newId = this.id.replace(".","_");
    return newId;
  }.property('id'),

  selectedItems: function() {
    var isChecked = false;
    this.get('items').content.forEach(function(category){
      var mode = category.get('mode');
      if (mode !== undefined && mode !== 'off'){
        isChecked = true;
      }
    });
    var categoriesLength = this.get('items').content.length;
    if (categoriesLength > 5) {
      this.set('hasMoreProperty',true);
    }
    if (categoriesLength < 4){
      isChecked = true;
    }
    return isChecked;
  }.property('categories')
});

export default Category;
