/**
 * Prepares texture for storing positions and normals for spline
 */
function initTexture() {
    if ( ! renderer.extensions.get( "OES_texture_float" ) ) {
        console.log("No OES_texture_float support for float textures.");
    }

    if ( renderer.capabilities.maxVertexTextures === 0 ) {
        console.log("No support for vertex shader textures.");
    }

    const height = 4;

    const dataArray = new Float32Array( TEXTURE_WIDTH * height * BITS );
    const dataTexture = new THREE.DataTexture(
        dataArray,
        TEXTURE_WIDTH,
        height,
        THREE.RGBFormat,
        THREE.FloatType
    );

    dataTexture.wrapS = THREE.RepeatWrapping;
    dataTexture.wrapY = THREE.RepeatWrapping;
    dataTexture.magFilter = THREE.LinearFilter;
    dataTexture.needsUpdate = true;

    return dataTexture;
}

function setTextureValue(index, x, y, z, o) {
    const image = texture.image;
    const { width, height, data } = image;
    const i = BITS * width * (o || 0);
    data[index * BITS + i + 0] = x;
    data[index * BITS + i + 1] = y;
    data[index * BITS + i + 2] = z;
}

function initPathShader() {
    // TODO Texture Loading

    // customMaterial = new THREE.MeshBasicMaterial({
    // 	wireframe: true,
    // 	color: 0x000000
    // });

    texture = initTexture();

    customMaterial = new THREE.ShaderMaterial({
        wireframe: true,
        uniforms: {
                texture: { value: texture },
                pathOffset: { type: 'f', value: 0 }, // time of path curve
                pathSegment: { type: 'f', value: 1 }, // fractional length of path
                spineOffset: { type: 'f', value: 161 },
                spineLength: { type: 'f', value: 400 },
                flow: { type: 'i', value: 1 },
        },
        vertexShader: `
        uniform sampler2D texture;

        uniform float pathOffset;
        uniform float pathSegment;
        uniform float spineOffset;
        uniform float spineLength;
        uniform int flow;

        float textureLayers = 4.; // look up takes (i + 0.5) / textureLayers

        void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.);

            bool bend = flow > 0;
            float spinePortion = bend ? (worldPos.x + spineOffset) / spineLength : 0.;
            float xWeight = bend ? 0. : 1.;
            float mt = spinePortion * pathSegment + pathOffset;

            vec3 spinePos = texture2D(texture, vec2(mt, (0.5) / textureLayers)).xyz;
            vec3 a = texture2D(texture, vec2(mt, (1. + 0.5) / textureLayers)).xyz;
            vec3 b = texture2D(texture, vec2(mt, (2. + 0.5) / textureLayers)).xyz;
            vec3 c = texture2D(texture, vec2(mt, (3. + 0.5) / textureLayers)).xyz;
            mat3 basis = mat3(a, b, c);

            worldPos = vec4(
                basis
                    * vec3(worldPos.x * xWeight, worldPos.y * 1., worldPos.z * 1.)
                    + spinePos
                , 1.);

            vec4 mvPosition = viewMatrix * worldPos;
            gl_Position = projectionMatrix * mvPosition;
        }
        `,
        fragmentShader: `
        void main() {
            gl_FragColor.rgb = vec3(0.);
        }
        `
    })

    activate(null, (moo) => {
        console.log(moo);
        onLoad(moo);
    });

    var loader = new THREE.OBJLoader();
    loader.load(
        // resource URL
        'ORCA.OBJ',

        // called when resource is loaded
        onLoad,
        // called when loading is in progresses
        function onProgress( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function onError( error ) {

            console.log( 'An error happened' );

        }
    );
}

function onLoad( object ) {
    if (orca) scene.remove(orca);

    orca = object;

    /*
    transMat = new THREE.Matrix4()
    rotMat = new THREE.Matrix4()
    scaleMat = new THREE.Matrix4()

    // transMat.makeTranslation(00, 0, 125);
    rotMat.makeRotationY( Math.PI / 2);
    // rotMat.makeRotationZ( -Math.PI / 2);

    scaleMat.makeScale(50, 50, 50)
    child.geometry.applyMatrix(rotMat);
    child.geometry.applyMatrix(scaleMat);
    child.geometry.applyMatrix(transMat);
    */


    object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.material = customMaterial
            // child.castShadow = true

            // child.material.map = texture;
            // child.material.color = 0x000000;
        }
    } );

    geoms = orca.children.map(child => child.geometry);
    bbs = geoms.map(geo => {
        geo.computeBoundingBox();
        return geo.boundingBox;
    });

    console.log('boundingbox', bbs);

    referenceGeometry.vertices[0].set(
        Math.min(...bbs.map(bb => bb.min.x)),
        Math.min(...bbs.map(bb => bb.min.y)),
        Math.min(...bbs.map(bb => bb.min.z))
    )

    referenceGeometry.vertices[1].set(
        Math.max(...bbs.map(bb => bb.max.x)),
        Math.max(...bbs.map(bb => bb.max.y)),
        Math.max(...bbs.map(bb => bb.max.z))
    )

    updateModel();

    scene.add( object );
}