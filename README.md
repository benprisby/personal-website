# Personal Website

[![Hugo](https://img.shields.io/badge/Hugo-FF4088?logo=hugo&logoColor=white)](https://gohugo.io/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?logo=github&logoColor=white)](https://pages.github.com/)
[![Build and Deploy](https://github.com/benprisby/personal-website/actions/workflows/hugo.yaml/badge.svg)](https://github.com/benprisby/personal-website/actions/workflows/hugo.yaml)
[![pre-commit.ci status](https://results.pre-commit.ci/badge/github/benprisby/personal-website/main.svg)](https://results.pre-commit.ci/latest/github/benprisby/personal-website/main)

My personal portfolio website built with Hugo, featuring a modern, responsive design with light and dark mode support.

## 🌐 Live Site

**<https://benprisby.com>**

## 📋 Overview

This website showcases my professional experience, projects, and personal interests. It includes:

- **Hero Section**: Brief introduction with social links and resume download
- **About Me**: Personal background and technical skills summary
- **Experience**: Selected professional work history
- **Education**: Academic background and selected accolades
- **Projects**: Highlighted personal projects and client work
- **Contact**: Ways to get in touch

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

The site is proxied through Cloudflare to boost performance and security.

## 🎨 Theme Modifications

This website uses the excellent [Hugo Profile](https://github.com/gurusabarish/hugo-profile) theme.

While the out-of-the-box theme was already more than ample for getting this site off the ground, the following list
contains all modifications I have made to it to suit my needs and address minor assorted issues beyond what can be
customized in the [configuration file](hugo.yaml):

- Changed fonts to JetBrains Mono + Inter with monospace used for all headings and technical elements:
  [`2d7f3fe`](https://github.com/benprisby/personal-website/commit/2d7f3fec8d75c353266e8a14a1b873c56cea303a)
- Fixed hero section buttons horizontal alignment:
  [`b5152c8`](https://github.com/benprisby/personal-website/commit/b5152c86e1c42af9deebf416f0e2b60ebb55fd35)
- Set background color on `body` element for overscroll:
  [`7bb8547`](https://github.com/benprisby/personal-website/commit/7bb8547b7cc0a30a044ee187f4961fe3bfa8b4a9)
- Set high fetch priority for hero image:
  [`6272511`](https://github.com/benprisby/personal-website/commit/62725114804cbece54359af6bccb413ef46bf1ff)
- Bundled all CSS files into one minified file to reduce server round-trips:
  [`de362f2`](https://github.com/benprisby/personal-website/commit/de362f2ca4b9a0511eff37cb5cafee1d1d8f0d41)
- Expanded favicon formats and platforms:
  [`6eded42`](https://github.com/benprisby/personal-website/commit/6eded42819cbec941c96e39b9a69b297fe91a45f)
- Fixed `aria-controls` value for experience section items:
  [`1bdbc55`](https://github.com/benprisby/personal-website/commit/1bdbc55882f916c6d2d7938b775e2d520adeb5d3)
- Added/updated `alt` and `aria-label` tags for hero and projects sections:
  [`4446a02`](https://github.com/benprisby/personal-website/commit/4446a02af7e8a82aa0a9d1fa2f6d33ef0c924d48)
- Added `aria-label` for theme toggle button in nav bar:
  [`1adb33a`](https://github.com/benprisby/personal-website/commit/1adb33ad045c30b1db8b88800cc6562655592eda)
- Renamed custom CSS file from `style.css` to `custom.css`:
  [`7c36672`](https://github.com/benprisby/personal-website/commit/7c366720b2835404be52cfa1f9f7ad987c5d7a2f)
- Fix light/dark mode toggling and avoid occasional white flash when loading:
  [`26033dd`](https://github.com/benprisby/personal-website/commit/26033dd50309d1fce504a2b2ca34615c31b35c9d)
- Fix theme toggle button alignment:
  [`44f6a7d`](https://github.com/benprisby/personal-website/commit/44f6a7db60384ef371247b0ac3b89d5b037b83be)
- Add render hook to open Markdown links in new tabs:
  [`2b088aa`](https://github.com/benprisby/personal-website/commit/2b088aa215a60a05214e947f7073e0a86d627bc7)
- "Plainify" blog summaries and reduce length in footer cards:
  [`35b2457`](https://github.com/benprisby/personal-website/commit/35b24575e64b9d7adb04c627b1a6e599d3e1a86d)
- Add typewriter effect to hero subtitle:
  [`9bfdecb`](https://github.com/benprisby/personal-website/commit/9bfdecbb7e38c7883a82538370e1a8996a25049a)
- Fix and improve search functionality:
  [`87c6d9a`](https://github.com/benprisby/personal-website/commit/87c6d9a53bebb4771b5884aa54964328eabe1975)
- Clear search context when clicking a result:
  [`b9466b8`](https://github.com/benprisby/personal-website/commit/b9466b88e18ffc6cdf7d3472d04078a61fab3a21)
- Fix nav item vertical centering on wider screens:
  [`3bf2a91`](https://github.com/benprisby/personal-website/commit/3bf2a91be2fa896565e9f7e673226a0056a0fd8f)
- Ensure nav bar separator consumes full height:
  [`334a9c2`](https://github.com/benprisby/personal-website/commit/334a9c2acc0ea0d8917aaa2e78acb9235401c9e3)
- Extend maximum-displayed post title length:
  [`e4aec3d`](https://github.com/benprisby/personal-website/commit/e4aec3de73fa359ec0d0972b6f2efac080cc4c82)
- Maintain blog image aspect ratios on the list page:
  [`a4455b7`](https://github.com/benprisby/personal-website/commit/a4455b75155dea16e852747408c329b7a5376f89)
- Update to Font Awesome 6.7.2:
  [`fe275ca`](https://github.com/benprisby/personal-website/commit/fe275ca13a5411b03917c3295e78bd6eaeacb4fb)
- Overhaul social sharing buttons (networks and styling):
  [`7be3283`](https://github.com/benprisby/personal-website/commit/7be3283d53c8c0cc0733f16435eb497c50acbb27)
- Simplify footer content:
  [`4cecc8d`](https://github.com/benprisby/personal-website/commit/4cecc8d11364a0e189c12b37ed74f7efdfafe0f8)

## 🔧 Development Notes

- Theme overrides are copied from *themes/hugo-profile* into a matching directory structure relative to the repository
  root
- All CSS files are in *assets/css*, NOT the *static* directory, to allow them to be bundled as one
- Pre-commit hooks will automatically fix basic syntax or whitespace issues
