import {
    BoxGeometry,
    Mesh,
    MeshPhongMaterial,
    DoubleSide,
} from "three";


import { CSG } from 'three-csg-ts';

import Engine from "./engine";

function main() {
    const elem = document.getElementById("viewer") as HTMLElement;
    const engine = new Engine(elem, (scene) => {
        const blueMaterial = new MeshPhongMaterial({ color: 0x3498db, side: DoubleSide });
        const greenMaterial = new MeshPhongMaterial({ color: 0x1db32e, side: DoubleSide });

        const geometry = new BoxGeometry(200, 200, 100);
        const cube = new Mesh(geometry, blueMaterial);
        cube.position.set(0, 0, 0)

        const geometry2 = new BoxGeometry(200, 200, 200);
        const cube2 = new Mesh(geometry2, greenMaterial);
        cube2.position.set(100, 100, 0)

        scene.add(cube)
        scene.add(cube2)

        const subtract = CSG.subtract(cube, cube2)
        scene.add(subtract)
    });
    engine.run();
}






main();

