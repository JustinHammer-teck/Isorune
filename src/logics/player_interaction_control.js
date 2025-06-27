import { Vector2, Quaternion, Vector3, Matrix4 } from "three"; // Import Vector3

// Constants for speeds (radians per second) are often clearer when using delta time
const SPEED_INCREMENT = 0.03; // Adjust as needed
const MAX_SPEED = 0.3;
export const MIN_SPEED = 0.02 * 0.1;

const ROLL_INCREMENT = 0.0015 / 2;
const YAW_INCREMENT = 0.001 / 2;
const PITCH_INCREMENT = 0.001 / 2;

const x = new Vector3(1, 0, 0);
const y = new Vector3(0, 1, 0);
const z = new Vector3(0, 0, 1);

let yawVelocity = 0;
let pitchVelocity = 0;
let rollVelocity = 0;
let turbo = 0;

const maxVelocity = 0.01;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const easeOutQuad = x => 1 - (1 - x) * (1 - x);



export class PlayerInteractionControl {
    constructor(app) {
        this.app = app;

        this.keyMap = {};

        const onDocumentKey = (e) => {
            this.keyMap[e.code] = e.type === 'keydown';
        };

        document.addEventListener('keydown', onDocumentKey, false);
        document.addEventListener('keyup', onDocumentKey, false);

        this.viewable = new Set();
        this.viewPoolSize = 12;
    }

    async Tick(delta) {

        // Ensure the player object exists
        if (!this.app.player) {
            return;
        }

        if (!this.lastPost) {
            this.lastPost = new Vector3().clone(this.app.player.position);
            this.viewedChunkCoordinate = new Vector2();
            this.app.player.matrixAutoUpdate = true;
        }

        const speedChange = SPEED_INCREMENT * delta;
        if (this.keyMap['KeyQ'] && this.app.player.speed < MAX_SPEED) {
            this.app.player.speed += speedChange;
        }
        if (this.keyMap['KeyE'] && this.app.player.speed > MIN_SPEED) {
            this.app.player.speed -= speedChange;
        }

        const player = this.app.player;
        const camera = this.app.camera;

        yawVelocity *= 0.95;
        pitchVelocity *= 0.95;
        rollVelocity *= 0.95;

        yawVelocity = clamp(yawVelocity, -maxVelocity, maxVelocity);
        pitchVelocity = clamp(pitchVelocity, -maxVelocity, maxVelocity);
        rollVelocity = clamp(rollVelocity, -maxVelocity, maxVelocity);

        if (this.keyMap['KeyA']) {
            rollVelocity -= ROLL_INCREMENT;
            yawVelocity += YAW_INCREMENT;
        }

        if (this.keyMap['KeyD']) {
            rollVelocity += ROLL_INCREMENT;
            yawVelocity -= YAW_INCREMENT;
        }

        if (this.keyMap['KeyW']) {
            pitchVelocity += PITCH_INCREMENT;
        }

        if (this.keyMap['KeyS']) {
            pitchVelocity -= PITCH_INCREMENT;
        }

        // Apply yaw/pitch/roll
        x.applyAxisAngle(y, yawVelocity);
        z.applyAxisAngle(y, yawVelocity);

        x.applyAxisAngle(z, pitchVelocity);
        y.applyAxisAngle(z, pitchVelocity);

        z.applyAxisAngle(x, rollVelocity);
        y.applyAxisAngle(x, rollVelocity);

        x.normalize();
        y.normalize();
        z.normalize();

        const rotMatrix = new Matrix4().makeBasis(x, y, z);

        player.quaternion.setFromRotationMatrix(rotMatrix);

        // Move forward
        if (this.keyMap['ShiftLeft'] || this.keyMap['ShiftRight']) {
            turbo += 0.025;
        } else {
            turbo *= 0.95;
        }
        turbo = clamp(turbo, 0, 1);

        const turboSpeed = easeOutQuad(turbo) * 0.02;
        player.position.add(x.clone().multiplyScalar(player.speed + turboSpeed));

        // player.position.copy(planePosition);

        // Optional: update camera
        if (camera) {
            camera.fov = 45 + turboSpeed * 900;
            camera.updateProjectionMatrix();

            const camOffset = new Vector3(-0.2, 0.05, 0)
                .applyQuaternion(player.quaternion)
                .applyAxisAngle(new Vector3(1, 0, 0), 0);

            camera.position.copy(player.position).add(camOffset);
            // camera.lookAt(planePosition);

            const playerWorldPos = new Vector3();
            this.app.player.getWorldPosition(playerWorldPos);
            // Look slightly above the player
            const lookAtTarget = playerWorldPos.clone();
            lookAtTarget.y += 0.03;
            this.app.camera.lookAt(lookAtTarget);
        }

        this.app.player.quaternion.normalize();



        if (this.keyMap['KeyJ']) {
            this.app.projectileCtrl.generatePlayerMachineGunBullet();
        }

        if (this.keyMap['KeyK']) {
            this.app.projectileCtrl.generatePlayerMissile();
        }


        if (this.keyMap['KeyL']) {
            this.app.projectileCtrl.generatePlayerBomb();
        }
    }

}