"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cheerio_1 = __importDefault(require("cheerio"));
exports.default = ({ extension = '.html', inject = true } = {}) => {
    if (extension[0] !== '.')
        extension = `.${extension}`;
    let templates;
    return {
        name: 'web-components',
        buildStart() {
            templates = '';
        },
        generateBundle(_, bundle) {
            if (!inject)
                return;
            Object.values(bundle).forEach((file) => {
                if ((file.type === 'asset' || file.isAsset) &&
                    path_1.default.extname(file.fileName) === '.html') {
                    file.source = cheerio_1.default
                        .load(file.source)('body')
                        .prepend(templates)
                        .toString();
                }
            });
        },
        async load(id) {
            if (path_1.default.extname(id) !== extension)
                return null;
            console.log(id);
            const $ = cheerio_1.default.load(await new Promise((resolve, reject) => fs_1.default.readFile(id, (error, content) => error
                ? reject(error)
                : resolve(content.toString()))));
            const style = $('style');
            const template = $('template');
            const script = $('script');
            template.remove('style').append(style);
            if (inject)
                templates += template;
            template.remove('style');
            return `
        export const style = ${JSON.stringify(style.html())}
        export const template = ${JSON.stringify(template.html())}
        ${script.html()}
      `;
        }
    };
};
