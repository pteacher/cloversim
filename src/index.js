import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import { Stats } from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import head from './clover_body_solid.dae';
import guard from './clover_guards_transparent.dae';


let mouseX = 0, mouseY = 0;
let windowWidth, windowHeight, activeAction, previousAction;
let mixer, actions;

let container, stats, clock, controls;
let camera, scene, renderer, model, guards;

init();
animate();

const roughnessMipmapper = new RoughnessMipmapper(renderer);


function init() {

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
    camera.position.set( 8, 10, 8 );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();

    


    // loading manager

    const loadingManager = new THREE.LoadingManager( function () {

        scene.add( model );
        scene.add( guards );

    } );

    // collada

    const loader = new ColladaLoader( loadingManager );
    loader.load( head, function ( collada ) {

        model = collada.scene;
        model.scale.set(10, 10, 10);

    } );

    loader.load( guard, function ( collada ) {

        guards = collada.scene;
        guards.scale.set(10, 10, 10);

    } );

    //

    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add( ambientLight );

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    directionalLight.position.set( 1, 1, 0 ).normalize();
    scene.add( directionalLight );

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;


}


function animate() {
    requestAnimationFrame( animate );
    controls.update(); 
    render();
}

function render() {
    renderer.render( scene, camera );
}