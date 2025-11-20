import { Vector2, Vector3 } from 'three';

function Tokey2() {
  return `${this.x == -0 ? 0 : this.x},${this.y == -0 ? 0 : this.y}`;
}

function Tokey3() {
  return `${this.x == -0 ? 0 : this.x},${this.y == -0 ? 0 : this.y},${this.z == -0 ? 0 : this.z}`;
}

Vector2.prototype.Tokey = Tokey2;
Vector3.prototype.Tokey = Tokey3;

export { Vector2, Vector3, Tokey2, Tokey3 };
