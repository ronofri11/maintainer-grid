/*
 *  NOTIFICACIONES
 */

 function randomstring(L){
    var s= '';
    var randomchar=function(){
        var n= Math.floor(Math.random()*62);
        if(n<10) return n; //1-10
        if(n<36) return String.fromCharCode(n+55); //A-Z
        return String.fromCharCode(n+61); //a-z
    }
    while(s.length< L) s+= randomchar();
    return s;
}

/*
 *
 * Muestra notificacion
 *
 * @param tipo: 1 mensaje, 2 exito, 3 error, 4 info.
 * @param mensaje: html a mostrar
 * @param oculta: true: se oculta automaticamente despues de unos segundos, false: se oculta solo con x
 *
 */

function notificacion(tipo, mensaje, oculta){

    var tipoMensaje = '';
    var idMensaje = '';
    if ( tipo == 1 ){
        tipoMensaje = 'exito';
    }else if ( tipo == 2){
        tipoMensaje = 'warning';
    }else if ( tipo == 3){
        tipoMensaje = 'error';
    }else if ( tipo == 4){
        tipoMensaje = 'info';
    }

    // comprueba que no haya repeticion
    var textosNotificaciones = $('.notificacion:visible').text();
    // console.log(textosNotificaciones, ' - ' + mensaje);
    var existeTexto = textosNotificaciones.search(mensaje.replace('<b>','').replace('</b>',''));
    // console.log(existeTexto);

    // previene repeticion
    if( existeTexto == -1 ){
        // crea id notificacion
        idMensaje = randomstring(5);

        // pinta notificacion
        $('.panel_notificacion').append('<div id ="' + idMensaje + '" class="notificacion ' + tipoMensaje + '"><button type="button" class="close" data-dismiss="alert" onclick="$(this).parent().remove()">×</button>' + mensaje + '</div>');
        //console.log('previene duplicacion notificacion');
        ocultaNotificacion(idMensaje, oculta);
    }else{
        return false;
    }
}

function ocultaNotificacion(idd, oculta) {
    var noti = $('#'+idd);

    if (oculta) {
        noti.css('display','none').fadeIn('fast').delay(3500).fadeOut();
        // console.log('si');
    } else {
        noti.css('display','none').fadeIn('fast');
    }
}

function cerrarModal(){
    $('#contenedor_danLight').css('z-index','-8').css('opacity','1');
    $('#contenido_danLight').css('z-index','-9');
    $('#guardaModal').hide();
}


