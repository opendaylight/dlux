jQuery(function($) {
	$('.accordion').on('hide', function (e) {
		$(e.target).prev().children(0).addClass('collapsed');
	})
	$('.accordion').on('show', function (e) {
		$(e.target).prev().children(0).removeClass('collapsed');
	})
});