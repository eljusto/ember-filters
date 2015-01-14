export default Em.Mixin.create({
	isValid: true,
	validate: function() {
		throw new Error("Must override method `validate`.");
	}
});
