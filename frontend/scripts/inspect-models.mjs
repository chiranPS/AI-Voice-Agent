
import fs from "node:fs";
import path from "node:path";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const loader = new GLTFLoader();

loader.setMeshoptDecoder(MeshoptDecoder);

const modelsDirectory = path.resolve("public/models");
const animationsDirectory = path.join(modelsDirectory, "animations");

function loadGLB(filePath) {
    return new Promise((resolve, reject) => {
        const buffer = fs.readFileSync(filePath);

        const arrayBuffer = buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
        );

        loader.parse(
            arrayBuffer,
            "",
            resolve,
            reject
        );
    });
}

async function inspectFile(filePath) {
    console.log("\n====================================");
    console.log(`FILE: ${path.basename(filePath)}`);
    console.log("====================================");

    const gltf = await loadGLB(filePath);

    const nodeNames = [];
    const boneNames = [];

    gltf.scene.traverse((object) => {
        if (object.name) {
            nodeNames.push(object.name);
        }

        if (object.isBone) {
            boneNames.push(object.name);
        }
    });

    console.log("\nNODES:");
    console.log(nodeNames.join("\n") || "No named nodes");

    console.log("\nBONES:");
    console.log(boneNames.join("\n") || "No bones found");

    console.log("\nANIMATIONS:");

    if (gltf.animations.length === 0) {
        console.log("No animations found");
    }

    gltf.animations.forEach((clip) => {
        console.log(`\nClip: ${clip.name}`);
        console.log(`Duration: ${clip.duration.toFixed(2)} seconds`);
        console.log(`Tracks: ${clip.tracks.length}`);

        clip.tracks.forEach((track) => {
            console.log(`  ${track.name}`);
        });
    });
}

async function main() {
    await MeshoptDecoder.ready;

    const files = [
        path.join(modelsDirectory, "Business_Female_02.glb"),
        path.join(modelsDirectory, "Business_Male_03.glb"),
        ...fs.readdirSync(animationsDirectory)
            .filter((file) => file.endsWith(".glb"))
            .map((file) => path.join(animationsDirectory, file)),
    ];

    for (const file of files) {
        try {
            await inspectFile(file);
        } catch (error) {
            console.error(`Failed to inspect ${file}`);
            console.error(error);
        }
    }
}

main();
