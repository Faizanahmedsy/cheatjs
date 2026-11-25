import type {Config} from 'tailwindcss';
import twColors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

/**
 * Site-wide white mode: every palette colour is a CSS variable. In white mode
 * (html[data-mode="light"]) each scale is flipped (50<->950, 100<->900, ...),
 * so dark backgrounds turn light and pale text turns dark, on every page,
 * without touching the components.
 */
const PALETTES = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'] as const;
const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;
const FLIP: Record<string, string> = { '50': '950', '100': '900', '200': '800', '300': '700', '400': '600', '500': '500', '600': '400', '700': '300', '800': '200', '900': '100', '950': '50' };

/**
 * Ustad Billu's palette (ustadbillu.vercel.app): "slate" becomes a warm scale
 * from Billu's paper (#f7f1e6) down to his ink (#1b2a22), and "cyan", the
 * site's main accent, becomes Billu's terra orange (#e5603a).
 */
const BILLU_OVERRIDES: Record<string, Record<string, string>> = {
  // Minimal neutral look: "slate" is a cool neutral grey, "cyan" (the site accent) is a calm sky blue.
  slate: {
    '50': '#fafafa', '100': '#f4f4f5', '200': '#e4e4e7', '300': '#d4d4d8', '400': '#a1a1aa', '500': '#71717a',
    '600': '#52525b', '700': '#3f3f46', '800': '#27272a', '900': '#18181b', '950': '#09090b',
  },
  cyan: {
    '50': '#f0f9ff', '100': '#e0f2fe', '200': '#bae6fd', '300': '#7dd3fc', '400': '#38bdf8', '500': '#0ea5e9',
    '600': '#0284c7', '700': '#0369a1', '800': '#075985', '900': '#0c4a6e', '950': '#082f49',
  },
};

function rgb(hex: string): string {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ');
}

const varColors = Object.fromEntries(
  PALETTES.map((name) => [name, Object.fromEntries(SHADES.map((shade) => [shade, `rgb(var(--c-${name}-${shade}) / <alpha-value>)`]))]),
);

const paletteVars = plugin(({ addBase }) => {
  const palette = { ...(twColors as unknown as Record<string, Record<string, string>>), ...BILLU_OVERRIDES };
  const dark: Record<string, string> = {};
  const light: Record<string, string> = {};
  for (const name of PALETTES) {
    for (const shade of SHADES) {
      dark[`--c-${name}-${shade}`] = rgb(palette[name][shade]);
      light[`--c-${name}-${shade}`] = rgb(palette[name][FLIP[shade]]);
    }
  }
  addBase({ ':root': dark, 'html[data-mode="light"]': light });
});

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['Source Code Pro', 'monospace'],
        labmono: ['var(--lab-mono)'],
      },
      colors: {
        ...varColors,
        lab: {
          bg: 'var(--lab-bg)',
          scene: 'var(--lab-scene)',
          panel: 'var(--lab-panel)',
          raised: 'var(--lab-raised)',
          border: 'var(--lab-border)',
          text: 'var(--lab-text)',
          muted: 'var(--lab-muted)',
          accent: 'var(--lab-accent)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), paletteVars],
} satisfies Config;