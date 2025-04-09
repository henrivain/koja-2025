import {
    BoxGeometry,
    Mesh,
    MeshPhongMaterial,
    DoubleSide,
    MeshBasicMaterial,
    SphereGeometry,

} from "three";

const GRAY = 0xbbbcbd

import Engine from "./engine";
import { Mover } from './Mover';
import { STLLoader } from "three/examples/jsm/Addons.js";

function main() {
    const blueMaterial = new MeshPhongMaterial({ color: 0x3498db, side: DoubleSide });
    const greenMaterial = new MeshPhongMaterial({ color: 0x1db32e, side: DoubleSide });
    const lightBlue = new MeshPhongMaterial({ color: 0x3993ed, side: DoubleSide });





    const plane = new BoxGeometry(2000, 2000, 10);
    const floor = new Mesh(plane, new MeshPhongMaterial({ color: GRAY, side: DoubleSide }));
    floor.position.set(0, -110, 0)
    floor.rotateX(-Math.PI / 2);


    const geometry = new BoxGeometry(200, 200, 100);
    const cube = new Mesh(geometry, blueMaterial);
    cube.position.set(0, 0, 0)

    const geometry2 = new BoxGeometry(200, 200, 200);
    const cube2 = new Mesh(geometry2, greenMaterial);
    cube2.position.set(100, 100, 0)

    const geometry3 = new BoxGeometry(100, 100, 200);
    const cube3 = new Mesh(geometry3, lightBlue);
    cube2.position.set(200, 300, 0)

    const elem = document.getElementById("viewport") as HTMLElement;
    const engine = new Engine(elem, [floor, cube, cube2]);
    engine.run();
    engine.addElem(cube3)


    const loader = new STLLoader();
    loader.load("Unnamed.stl", (geometry) => {
        const lightBlue = new MeshBasicMaterial({ color: 0x3993ed, side: DoubleSide });
        const mesh = new Mesh(geometry, lightBlue);
        engine.addElem(mesh)
    })


    new Mover(engine);

}


function createRandomCube() {
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: Math.random() * 0xffffff });
    const cube = new Mesh(geometry, material);
    cube.position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
    return cube;
}

function createRandomSphere() {
    const geometry = new SphereGeometry(0.5, 32, 32);
    const material = new MeshBasicMaterial({ color: Math.random() * 0xffffff });
    const sphere = new Mesh(geometry, material);
    sphere.position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
    return sphere;
}







main();

