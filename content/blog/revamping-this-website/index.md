---
title: Revamping This Website
date: 2025-08-27T15:18:26-04:00
draft: false
author: Ben Prisby
image: /blog/revamping-this-website/feature.jpg
tags:
  - web-development
  - hugo
  - wordpress
  - branding
---
After sitting on my tech to-do list for many months, I finally made the time to redo my personal website, which is where
you are now! While web development is not something I specialize in professionally, I do take pride in creating simple
user experiences that are easy to navigate and always enjoy opportunities to play around with new technologies.

## Background

This website is an important part of my personal brand. Not only does it allow me to expand on my professional
experience beyond what I can compact into a single-page resume, but it motivates me to showcase personal interests and
adventures. How interesting these may be others is a different story, though. 😜 Plus, I bought this domain many years
ago and it's cheap to carry, so may as well park something useful here!

## Previous Iteration

This site was previously built using WordPress and a [theme I paid for](https://hcode.themezaa.com). Overall, it looked
nice but left me continuously frustrated with keeping it alive, let alone editing it (perhaps contributing to why I kept
kicking the can down the road on redoing it).

### Early Experiences

I first encountered WordPress back in middle school, where a friend of mine was mocking up basic websites with it and
hosting them for free on 000webhost. Prior to this, I did some *very* light web coding with basic HTML and Microsoft
FrontPage, the CD for which I got from my grandfather. I think it was version 2003. Needless to say, the results were
cartoony at best, but at least I was dipping my toes in the water (and loading up sites with animated clip art seemed to
be the style at the time).

Anyway, I found WordPress relatively easy to pick up even with its complexities. I didn't have much in the way of
content, but it was fun making some quick websites for school projects on random, long, free domain names. It was a
chance to get familiar with themes, plugins, SQLite, and cPanel. And this early experience always kept WordPress in my
back pocket as I started playing around with other web technologies and site builders like SquareSpace throughout high
school.

### First Pass

When I got serious about creating this website in early college, I was brought back to WordPress by the
previously-linked H-Code theme. I wanted to avoid a full-blown site builder but still not do everything from scratch.
Thus, WordPress seemed like a good in-betweener that was well-supported and could give me the benefits of a CMS if I
wanted to add a blog.

With these lofty ambitions, I crafted the first pass of the single-page site and immediately starting hitting issues.
First, I went through several hosting services, each getting progressively more expensive. Cheap shared plans proved to
be incredibly slow, so I eventually wound up with AWS Lightsail, which was still affordable and did the job well with an
easy-to-use WordPress template to get off the ground quickly.

{{< figure src="old-website.jpg" alt="Website sections" class="img-fluid mx-auto d-block w-75" >}}

Performance of the site was still poor, so I began installing one optimization plugin after another to try to cut down
load times and resource sizes. I also proxied the site through Cloudflare, which did help significantly but did not
absolve me of the underlying issues. The theme was heavy, WordPress came with a lot of overhead, and staying on top of
lots of knobs to turn was undesirable. Furthermore, I was never fully comfortable with the security posture of the site,
even with Wordfence and what should have been a secure `.htaccess`.

From a flexibility perspective, the WPBakery Page Builder editing experience got in my way more than it helped. I'm not
sure if this was me not using it correctly, but it frequently shuffled page content with the smallest content edit,
which made me hesitant to change anything. The theme settings also sometimes didn't apply to the published page,
leaving me with inconsistencies as I tried to tune CSS and logos. I was never ultimately able to get the page looking
the way I wanted, with display issues appearing over time even after carefully reviewing WordPress and theme updates for
compatibility.

While I could have spent more time than I already had adjusting things, I ended up concluding a total redo was in order.
Independent of the technologies I was battling with, the site was not fulfilling its goals of what I wanted it to be.
Although the theme's visual flair was very slick, leaving visitors impressed, the content seemed too thin and it didn't
feel authentic. I wanted to simplify.

## Moving On

With more software engineering experience under my belt, I was drawn to static site generators. Markdown is
something I use all the time at work for documentation, so it made sense to lean into it. Furthermore, I liked the idea
of decoupling the site content from the presentation of it, while being able to easily store it in Git (goodbye manual
WordPress backups to my NAS). I first experimented with Jekyll but settled on Hugo for its increased popularity and
speed.

In just a few minutes, I had a starter site running locally with the excellent
[Hugo Profile theme](https://github.com/gurusabarish/hugo-profile):

```shell
hugo new site personal-website --format=yaml
cd personal-website
git init
git submodule add git@github.com:gurusabarish/hugo-profile.git themes/hugo-profile
cp themes/hugo-profile/exampleSite/hugo.yaml hugo.yaml
hugo serve -D
```

From there, most of the time was spent writing the content I never fully fleshed out from the previous site, which was
all easy to capture in the YAML file (even though there are 3 ways to express a boolean, I still prefer it over TOML).
The theme exposes most of the visual knobs I suspect many would need (color palette, showing/hiding elements, etc.), but
I wanted to make the site feel more like my own.

While I maintain a complete list of all of the modifications made to this theme
[in the repository README](https://github.com/benprisby/personal-website?tab=readme-ov-file#-theme-modifications), I'll
discuss some of the more signficant ones here.

### Typography

Currently, the theme allows customizing these font properties from the configuration file:

```yaml
font:
  fontSize: 1rem
  fontWeight: 400
  lineHeight: 1.5
  textAlign: left
```

The font family is notably absent, which was a must for me to configure (especially after going down the rabbit hole of
selecting a font pairing I liked on Google Fonts). Adjusting this required overriding `font.css` and the `head.html`
partial.

*Side note: Being able to override any theme file from the submodule is fantastic! It reminds me of Yocto BitBake
layers, oh BitBake...*

After doing a direct swap on the fonts, however, I noticed some the elements didn't take the fonts I had hoped (e.g.
`h1`-`h5` don't use the primary font). So with some light additions to the CSS, things were looking good.

### CSS Bundling

While the site is already lightweight and further sped up by proxying through Cloudflare, I wanted to cut down on the
number of server round trips for assets. The theme modularizes its CSS files by section of the site, keeping them
separate in the final deployment. However, I wanted to optimize this so that the client only needs to fetch one file
that contains all of the required minified CSS.

With Hugo's asset pipeline, this was a relatively straightforward task:

```html
<!-- bundled stylesheets -->
{{- $cssFiles := slice -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/font.css") -}}
{{- if (or (eq .Site.Params.UseBootstrapCDN true) (eq .Site.Params.UseBootstrapCDN "css")) -}}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
{{- else -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/bootstrap.min.css") -}}
{{- end -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/header.css") -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/footer.css") -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/theme.css") -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/index.css") -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/projects.css") -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/list.css") -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/about.css") -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/single.css") -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/gallery.css") -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/viewer.min.css") -}}
{{- if .Site.Params.customCSS -}}
{{- $cssFiles = $cssFiles | append (resources.Get "css/style.css") -}}
{{- end -}}
{{- $bundle := $cssFiles | resources.Concat "css/bundle.css" | resources.Minify | resources.Fingerprint -}}
<link rel="stylesheet" href="{{ $bundle.Permalink }}" media="all">
```

One downside, however, is that it required copying all of the CSS files into the `assets` directory to leverage these
pipeline functions. If things change upstream, they will need to be synced accordingly.

However, this results in a `bundle.min.<hash>.css` being created with everything in it and a hash for cache-busting.
While I kept the conditional logic to support Bootstrap coming from a CDN, I use the default theme behavior of hosting
it locally.

### Accessibility Improvements

While this is area I'm still coming up to speed on, making the site more accessible for screen readers is important to
me. The PageInsights report flagged a few issues with `aria-label` tags that I fixed, but I took the opportunity to also
clean up `alt` tags on images and add additional `aria-*` tags on certain primary items to ensure they are descriptive.
There is still much more to do on this front, but the site is in better shape than initially.

## Conclusion

I'm excited with the results of redoing this website. It was a great opportunity to reflect on the journey that brought
me here and to pick a better tool for what I was looking to create. Going forward, it gives me a lightweight platform to
express myself in posts like these while maintaining full control over the look and feel. I can finally make some form
of a blog happen in addition to improving my overall digital presence!
