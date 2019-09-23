import fs from 'fs'
import path from 'path'
import { Plugin, OutputBundle, OutputAsset } from 'rollup'
import cheerio from 'cheerio'

export default ({
  extension = '.html',
  inject = true
}: {
  extension?: string
  inject?: boolean
} = {}): Plugin => {
  if (extension[0] !== '.') extension = `.${extension}`

  let templates: string

  return {
    name: 'web-components',

    buildStart() {
      templates = ''
    },

    generateBundle(_: unknown, bundle: OutputBundle) {
      if (!inject) return

      Object.values(bundle).forEach((file) => {
        if (
          (file.type === 'asset' || (file as unknown as OutputAsset).isAsset) &&
          path.extname(file.fileName) === '.html'
        ) {
          (file as OutputAsset).source = cheerio
            .load((file as OutputAsset).source)('body')
            .prepend(templates)
            .toString()
        }
      })
    },

    async load(id: string): Promise<string | null> {
      if (path.extname(id) !== extension) return null
        console.log(id)

      const $ = cheerio.load(await new Promise(
        (resolve, reject) => fs.readFile(id, (error, content) => error
          ? reject(error)
          : resolve(content.toString())
        )
      ))

      const style = $('style')
      const template = $('template')
      const script = $('script')

      template.remove('style').append(style)

      if (inject) templates += template

      template.remove('style')

      return `
        export const style = ${JSON.stringify(style.html())}
        export const template = ${JSON.stringify(template.html())}
        ${script.html()}
      `
    }
  }
}
