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
import * as Sk from 'skulpt'

let container, controls;
let camera, scene, renderer, model, guards, prop_ccw, prop_cw, prop_ccw2, prop_cw2;
let group = new THREE.Object3D();
let view, state;

let texture, material, plane;



init();

dragElement(document.getElementById("terminal"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

$(function() {
    let language = new Compartment, tabSize = new Compartment

    state = EditorState.create({
        doc: document.getElementById("codesample").innerHTML,
        extensions: [
            oneDark,
            defaultHighlightStyle,
            basicSetup,
            language.of(python()),
            tabSize.of(EditorState.tabSize.of(4))
        ]
    })

    view = new EditorView({state, defaultCharacterWidth: 8, parent: document.querySelector('.code-pane-html')});
});

function outf(text) {
    $("#output").text($("#output").text() + text)
}
function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function runit() {
    let prog = state.doc.toString();
    // Sk.externalLibraries = {
    //     rospy : {
    //         path: "rospy.js",
    //     },
    // };
    //
    // Sk.builtins = {
    //     rospy: Sk.builtin.rospy,
    // }

    Sk.configure({
        output:outf,
        read:builtinRead,
        __future__: Sk.python3
    });

    let myPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function(mod) {
            try {
                console.log($("#output").text());
                eval($("#output").text());
            } catch(e) {
                alert('Исправьте ошибки');
            }

        },
        function(err) {
            let msg = err.toString();
            $("#debug").text(msg);
            console.log(msg);
            // view.addLineClass(msg.split(" ")[msg.split(" ").length-1] - 1, 'wrap', 'line-error');
        });
}

function sleep(x) {
    console.log("sleep: " + x);
}

function land() {
    // group.position.set( 0, 0, 0 );
}

function nav(x, y, z, frame_id, auto_arm) {
    console.log("move");
    group.position.set( group.position.x + y*10, group.position.y + z*10, group.position.z - x*10 );
}


function init() {
    $(".run-script").on("click", function () {
        runit();
    });

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


        let bb = new THREE.Box3().setFromObject(group);
        let size = bb.getSize(new THREE.Vector3());
        group.position.set( 0, -bb.min.y, 0 );
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


