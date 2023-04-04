import { parse } from "mavka-parser";
import TakeModuleNode from "mavka-parser/src/ast/TakeModuleNode.js";
import IdentifierNode from "mavka-parser/src/ast/IdentifierNode.js";
import startupModulesEncoded from "virtual:mavka-startup-modules";
import { Buffer } from "buffer";

function generateRandomCyrillicChar() {
  const charCode = Math.floor(Math.random() * (0x044F - 0x0410 + 1)) + 0x0410;
  return String.fromCharCode(charCode);
}

export function bundle(module, rawFiles = {}) {
  const bundled = {};

  if (Array.isArray(rawFiles)) {
    const decoded = Buffer.from(startupModulesEncoded, 'base64').toString('utf-8').replaceAll("\\\\", "\\");

    const startupModuleFiles = JSON.parse(decoded);

    if (!Array.isArray(startupModuleFiles)) {
      throw `Не вдалось завантажити вбудовані модулі.`;
    }

    if (startupModuleFiles.length > 0) {
      rawFiles = startupModuleFiles.concat(rawFiles);
    }
  }

  const files = {};
  for (const rawFile of rawFiles) {
    files[rawFile.name.substring(0, rawFile.name.length - 2)] = rawFile.content;
  }

  const programAst = parse(module);
  const programAstBody = programAst.body;

  let randomName = `тм_${new Array(10).fill(0).map(generateRandomCyrillicChar).join("")}`;

  let code = "";

  let linesToDelete = [];

  for (const node of programAstBody) {
    if (node instanceof TakeModuleNode) {
      const path = node.id instanceof IdentifierNode ? [node.id.name] : node.id.toFlatArray();
      const asName = node.as ? node.as.name : null;

      let name = path[0];
      const newPath = path.slice(1);
      const last = newPath[newPath.length - 1];

      if (!(name in files)) {
        throw `Не вдалось завантажити модуль "${name}".`;
      }

      let content = `модуль ${randomName}
модуль ${name}
${files[name]}
кінець

дати ${name}
кінець`;

      if (name in bundled) {
        content = "";
        randomName = bundled[name];
      } else {
        bundled[name] = randomName;
      }

      if (newPath.length) {
        if (asName) {
          content += `\n${asName} = ${randomName}.${name}.${newPath.join(".")}`;
        } else {
          content += `\n${last} = ${randomName}.${name}.${newPath.join(".")}`;
        }
      } else {
        if (asName) {
          content += `\n${asName} = ${randomName}.${name}`;
        } else {
          content += `\n${name} = ${randomName}`;
        }
      }

      code += content;

      for (let i = node.context.start.line; i <= node.context.stop.line; i++) {
        linesToDelete.push(i);
        console.log("delete line", i);
      }
    }
  }

  module = module.split("\n").filter((code, index) => !linesToDelete.includes(index + 1)).join("\n");

  code += `\n${module}`;

  return code;
}
