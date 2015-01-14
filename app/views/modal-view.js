export default Ember.View.extend({
  didInsertElement: function() {
    this.$('.modal-dialog').draggable();
    this.$('.modal-dialog').position({my: "center center+100px", at: "center", of: window});
  }
});
