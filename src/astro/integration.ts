import { AstroIntegration } from 'astro';
import { schummarTranslatePlugin } from './plugin';

export interface TranslateIntegrationOptions {
  param: string;
  availableLanguages: string[];
}

export function schummarTranslateIntegration(options: TranslateIntegrationOptions): AstroIntegration {
  return {
    name: 'schummar-translate-integration',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [schummarTranslatePlugin(options)],
          },
        });
      },
    },
  };
}
