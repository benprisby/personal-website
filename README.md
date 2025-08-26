# Personal Website

My personal portfolio website built with Hugo, featuring a modern, responsive design with light and dark mode support.

## 🌐 Live Site

**<https://benprisby.com>**

## 📋 Overview

This website showcases my professional experience, projects, and personal interests. It includes:

- **Hero Section** - Brief introduction with social links and resume download
- **About Me** - Personal background and technical skills summary
- **Experience** - Selected professional work history
- **Education** - Academic background and selected accolades
- **Projects** - Highlighted personal projects and client work
- **Contact** - Ways to get in touch

## 🚀 Getting Started

### Prerequisites

- Git
- [Hugo](https://gohugo.io/installation/)
- [Minify](https://github.com/tdewolff/minify) (optional)
- [pre-commit](https://pre-commit.com) (development only)

### Local Development

1. Clone the repository.
2. Initialize the theme submodule: `git submodule update --init --recursive`.
3. Install pre-commit hooks: `pre-commit install`.
4. Start the development server: `hugo server -D`.
5. View the site (defaulting to <http://localhost:1313>).

### Building for Production

```bash
hugo --minify
minify -i -r public/  # Optional
```

The built site will be in the *public* directory. The additional `minify` step ensures that all possible assets are
minified in-place beyond what Hugo handles to get the most compact output possible.

## 📦 Deployment

This site is built using a [GitHub Actions workflow](.github/workflows/hugo.yaml) invoked on push to `main` that:

1. Sets up a build environment on an Ubuntu runner
2. Runs Hugo to generate the static site content
3. Minifies all relevant output files
4. Publishes the site to GitHub Pages for hosting

The site is proxied through Cloudflare to boost performance and security, where the custom domain lives.

## 🎨 Theme Modifications

This website uses the excellent [Hugo Profile](https://github.com/gurusabarish/hugo-profile) theme.

While the out-of-the-box theme was already more than ample for getting this site off the ground, the following list
contains all modifications I have made to it to suit my needs and address minor assorted issues beyond what can be
customized in the [configuration file](hugo.yaml):

- Changed fonts to JetBrains Mono + Inter with monospace used for all headings and technical elements:
  [17f21fa](https://github.com/benprisby/personal-website/commit/17f21fa5a280352fdd314e4188a999851b4d9757)
- Fixed hero section buttons horizontal alignment:
  [415c53d](https://github.com/benprisby/personal-website/commit/415c53d3fddf64eea222e07d2f96ac4791403419)
- Set background color on `body` element for overscroll:
  [56f8037](https://github.com/benprisby/personal-website/commit/56f8037492f41c016594452874f00ae3c12b43c3)
- Set high fetch priority for hero image:
  [ff13c5a](https://github.com/benprisby/personal-website/commit/ff13c5a8d486d2cd1940527b6e175f09e552f203)
- Bundled all CSS files into one minified file to reduce server round-trips:
  [d31f752](https://github.com/benprisby/personal-website/commit/d31f7520dedf8b601812384cb4f9920d7c2ee1ac)
- Expanded favicon formats and platforms:
  [92b3de6](https://github.com/benprisby/personal-website/commit/92b3de69583e7e91acf17ba7c64ff5aa772dc2b1)
- Fixed `aria-controls` value for experience section items:
  [d8ba169](https://github.com/benprisby/personal-website/commit/d8ba169196605ef9aad36ab57437777a30b00190)
- Added/updated `alt` and `aria-label` tags for hero and projects sections:
  [6b2cee1](https://github.com/benprisby/personal-website/commit/6b2cee14017e89a4090cb974ea382baab1ca1d6d)
- Added `_blank` target to footer social links:
  [61bc2c7](https://github.com/benprisby/personal-website/commit/61bc2c7ae3433651a9fbf359afb3550ac1eebb14)
- Added `aria-label` for theme toggle button in nav bar:
  [5752957](https://github.com/benprisby/personal-website/commit/5752957d7b02054055ca837bcf28fd9004ad057b)

## 🔧 Development Notes

- Theme overrides are copied from *themes/hugo-profile* into a matching directory structure relative to the repository
  root
- All CSS files are in *assets/css*, NOT the *static* directory, to allow them to be bundled as one
- Pre-commit hooks will automatically fix basic syntax or whitespace issues
