/*global moment:false */
export default Ember.View.extend({
  templateName: 'filters/views/datepicker',
  filter: null,
  init:function () {
    this._super();
    var textFields = this.get('filter').get('textFields');
    this.set('dateFrom',textFields[0]['value']);
    this.set('dateTo',textFields[1]['value']);
  },
  setFromToDate: function() {
    var arr = [ { name: 'gte', value: this.get('dateFrom') },
                { name: 'lte', value: this.get('dateTo') }
    ];
    this.get('filter').set('textFields', arr);
    this.get('controller').send('goAction',this.get('filter'));
  },

  dateFromLessThanToValidate: function(date) {
    var dateToMoreThanFrom = true;
    var dateFrom = this.get('dateFrom');
    var dateTo = this.get('dateTo');
    if (dateTo && dateFrom) {
      dateToMoreThanFrom = moment(dateTo).isAfter(dateFrom) || moment(dateTo).isSame(dateFrom);
    }
    if (dateToMoreThanFrom) {
      this.setFromToDate();
      this.$('.' + date).removeAttr('data-previous');
    } else {
        var name = (date === 'from') ? 'gte' : 'lte';
        var previousDate = this.get('filter.textFields').findBy('name', name).value;
        if (!previousDate){
          previousDate = '';
        }
        this.$('.' + date).attr('data-previous',previousDate);
    }
  },

  dateFromObserver: function() {
    this.dateFromLessThanToValidate('from');
  }.observes('dateFrom'),

  dateToObserver: function() {
    this.dateFromLessThanToValidate('to');
  }.observes('dateTo'),

  textFieldsObserver: function(){
    var textFields = this.get('filter.textFields');
    if (textFields[0].value === null || textFields[0].value === "") {
      this.set('dateFrom',"");
    }
    if (textFields[1].value === null || textFields[1].value === "") {
      this.set('dateTo',"");
    }
  }.observes('filter.textFields')
});
