import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import head from './clover_body_solid.dae';
import guard from './clover_guards_transparent.dae';
import m_prop_cw from './prop_cw.dae';
import m_prop_ccw from './prop_ccw.dae';
import checker from './checkerboard.jpg';

import * as $ from 'jquery'
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import {Compartment} from "@codemirror/state"
import {defaultHighlightStyle} from "@codemirror/highlight"
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from "@codemirror/lang-python"

let container, controls;
let camera, scene, renderer, model, guards, prop_ccw, prop_cw, prop_ccw2, prop_cw2;
let group = new THREE.Object3D();

let texture, material, plane;


init();


$(function() {
    console.log("loaded");

    let language = new Compartment, tabSize = new Compartment

    let state = EditorState.create({
        doc: document.getElementById("codesample").innerHTML,
        extensions: [
            oneDark,
            defaultHighlightStyle,
            basicSetup,
            language.of(python()),
            tabSize.of(EditorState.tabSize.of(4))
        ]
    })

    let view = new EditorView({state, defaultCharacterWidt: 8, parent: document.querySelector('.code-pane-html')});
});


function init() {
    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth * 0.5 / window.innerHeight, 0.1, 2000 );
    camera.position.set( -10, 15, 20 );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x9fe0ff );

    // loading manager

    const loadingManager = new THREE.LoadingManager( function () {
        group.add( model );
        group.add( guards );
        group.add( prop_ccw );
        group.add( prop_cw );
        group.add( prop_ccw2 );
        group.add( prop_cw2 );
        scene.add( group );
        group.position.set( 0, 0.86, 0 );
        
        let bb = new THREE.Box3().setFromObject(group);
        let size = bb.getSize(new THREE.Vector3());
        console.log( size );
        console.log( group.children );
        animate();
    } );

    // collada

    const loader = new ColladaLoader( loadingManager );
    loader.load( head, function ( collada ) {
        model = collada.scene;
        model.scale.set( 10, 10, 10 );
    } );

    loader.load( guard, function ( collada ) {
        guards = collada.scene;
        guards.scale.set( 10, 10, 10 );
    } );

    loader.load( m_prop_ccw, function ( collada ) {
        prop_ccw = collada.scene;
        prop_ccw2 = prop_ccw.clone();
        prop_ccw.position.set(-0.826, 0, 0.826);
        prop_ccw.scale.set( 10, 10, 10 );
        prop_ccw2.position.set(0.826, 0, -0.826);
        prop_ccw2.scale.set( 10, 10, 10 );
    } );

    loader.load( m_prop_cw, function ( collada ) {
        prop_cw = collada.scene;
        prop_cw2 = prop_cw.clone();
        prop_cw.position.set(0.826, 0, 0.826);
        prop_cw.scale.set( 10, 10, 10 );
        prop_cw2.position.set(-0.826, 0, -0.826);
        prop_cw2.scale.set( 10, 10, 10 );
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
    renderer.setSize( window.innerWidth / 2, window.innerHeight );
    container.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    texture = THREE.ImageUtils.loadTexture( checker );

    // assuming you want the texture to repeat in both directions:
    texture.wrapS = THREE.RepeatWrapping; 
    texture.wrapT = THREE.RepeatWrapping;

    // how many times to repeat in each direction; the default is (1,1),
    //   which is probably why your example wasn't working
    texture.repeat.set( 400, 400 ); 

    material = new THREE.MeshLambertMaterial({ map : texture });
    plane = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), material);
    plane.material.side = THREE.DoubleSide;

    // rotation.z is rotation around the z-axis, measured in radians (rather than degrees)
    // Math.PI = 180 degrees, Math.PI / 2 = 90 degrees, etc.
    plane.rotation.x = Math.PI / 2;

    scene.add(plane);
    animate();
}


function animate() {
    if (group.children.length > 0) {
        group.children[2].rotation.z += 0.1;
        group.children[3].rotation.z -= 0.1;
        group.children[4].rotation.z += 0.1;
        group.children[5].rotation.z -= 0.1;
    }
    requestAnimationFrame( animate );
    controls.update(); 
    render();
}

function render() {
    renderer.render( scene, camera );
}