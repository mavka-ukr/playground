import { bundle } from "./src/mavka/bundler.js";

console.log(bundle(`
взяти а
взяти а.б.в як х
взяти а.б як х

друк(а)
`, [
  {
    name: "а.м",
    content: `ПІ = 3.14

дати ПІ`
  }
]));
