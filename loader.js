function activate( target, callback ) {

    target = target || document;

    target.addEventListener( 'dragover', function ( event ) {

        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    
    } );
    
    target.addEventListener( 'drop', function ( event ) {
    
        event.preventDefault();

        var files = event.dataTransfer.files;
    
        if ( files.length > 0 ) {
    
            handleFile( files[ 0 ], callback );
    
        }
    
    } );
}

function loadFile( file, callback ) {
    var filename = file.name;

    var reader = new FileReader();
    reader.addEventListener( 'progress', function ( event ) {

        var size = '(' + Math.floor( event.total / 1000 ).toFixed(2) + ' KB)';
        var progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';
        console.log( 'Loading', filename, size, progress );

    } );

    reader.addEventListener( 'load', ( event ) => {

        var contents = event.target.result;

        var object = new THREE.OBJLoader().parse( contents );
        object.name = filename;

        callback( object );

    } );

    reader.readAsText( file );
}

function handleFile( file, callback ) {
    var filename = file.name;
    var extension = filename.split( '.' ).pop().toLowerCase()

    loadFile( file, callback );
}
