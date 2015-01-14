/*global moment:false */
export default Em.Mixin.create({
  dateFormat: 'Y-m-d',
  calendarView: 'days',
  isDateValid: true,
  isDateValidObserver: function() {
    if (this.get('isDateValid')) {
      this.$().addClass('valid');
      this.$().removeClass('invalid');
    } else {
      this.$().addClass('invalid');
      this.$().removeClass('valid');
    }
  }.observes('isDateValid'),

  didInsertElement: function() {
    this._super();
    var self = this;
    var onChange = function(preparedDate) {
      $(this).change();
      if ($(this).attr('data-previous') !== undefined) {
        preparedDate = $(this).attr('data-previous');
        $(this).val(preparedDate);
      }
      $(this).attr('data-value',preparedDate);
    };
    var d = new Date();
    if (this.$().hasClass('no-date-limit')) {
      this.$().pickmeup({
        format: this.get('dateFormat'),
        hide_on_select: true,
        change: onChange,
        view: this.get('calendarView')
      });
    } else {
      this.$().pickmeup({
        hide_on_select: true,
        change: onChange,
        view: this.get('calendarView'),
        min: new Date('01/01/2013'),
        max: d.getFullYear() + '-12-31',
        format: this.get('dateFormat')
    });
    }
    this.$().attr('pattern', this.get('datePattern'));
    this.$().change(function(event){
      Em.run(function(){
        var preparedDate = event.currentTarget.value;
        self.dateChanged(preparedDate);
      });
    });
  },
  dateChanged: function(preparedDate) {
    //date validation
    if (preparedDate != null)
    {
      var m = moment.utc(preparedDate, this.get('dateFormat'),true);
      this.set('isDateValid', m.isValid());
      if (m.isValid()) {
        this.set('value', preparedDate);
      } else {
        var previousDate = this.$().attr('data-value');
        if (!previousDate){
          previousDate = this.$().attr('value');
        }
        this.$().val(previousDate);
      }
    }
  },
  willDestroyElement: function() {
    this._super();
  }
});
