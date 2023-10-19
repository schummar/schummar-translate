import { Plugin } from 'vite';
import { TranslateIntegrationOptions } from './integration';

export function schummarTranslatePlugin({ param, availableLanguages }: TranslateIntegrationOptions): Plugin {
  return {
    name: 'schummar-translate-plugin',

    transform(code, id) {
      if (!id.endsWith('.astro')) {
        return;
      }

      if (id.includes('pages/[lang]/index.astro')) console.log(code);

      const params = id
        .split('/')
        .map((x) => x.match(/^\[(.*)\]$/)?.[1])
        .filter(Boolean);

      if (!params.includes(param)) {
        return;
      }

      const ast = this.parse(code) as any;
      const getStaticPathsNode = ast.body.find(
        (x: any) => x.type === 'ExportNamedDeclaration' && x.declaration?.id?.name === 'getStaticPaths',
      );

      const originalBody = getStaticPathsNode?.declaration?.body;
      const originalBodyCode = originalBody ? code.slice(originalBody.start, originalBody.end) : '{return []}';

      const newGetStaticPaths = `
          export async function getStaticPaths() {
            const availableLanguages = ${JSON.stringify(availableLanguages)};
            const paths = (function() 
              ${originalBodyCode}
            )();

            if(paths.length === 0) {
              paths.push({params:{}})
            }

            return availableLanguages.flatMap(lang => {
              return paths.map(path => ({
                ...path,
                params: {
                  ...path.params,
                  ['${param}']: lang
                }
              }))
            })
          }
        `;

      if (getStaticPathsNode) {
        return code.slice(0, getStaticPathsNode.start) + newGetStaticPaths + code.slice(getStaticPathsNode.end);
      } else {
        return code + newGetStaticPaths;
      }
    },
  };
}
