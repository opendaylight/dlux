function show_box(id) {
 jQuery('.widget-box.visible').removeClass('visible');
 jQuery('#'+id).addClass('visible');
}