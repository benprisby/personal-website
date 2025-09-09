---
title: Improving My Dotfiles Posture
date: 2025-09-08T14:46:24-04:00
draft: false
author: Ben Prisby
image: /blog/improving-my-dotfiles-posture/feature.jpg
tags:
  - chezmoi
  - dotfiles
  - git
  - shell
  - ansible
  - automation
---
An important part of my design philosophy for software scalability is minimizing machine-to-machine differences wherever
possible. This allows me to focus more on *what* I'm delivering rather than *where*, with any changes to common pieces
benefitting all downstream machines. By worrying less about each machine being a unicorn, I have more mental bandwidth
for the functional parts of the system, which is where I'd rather spend my time. And, running the same software on every
machine possible maximizes the testing of it, contributing to higher-quality software.

Beyond production software, I also apply this thinking to my development setups. While I do have a primary workstation,
much of my time on and off the job is spent hopping around different machines. And while having remote debugging setups
are all fine and good, sometimes it's simpler (or necessary in an embedded world) to do things on-target. Thus, I wanted
to improve how I capture and synchronize aspects of my development environment across machines I work on.

## The Dotfiles Dilemma

Most of my interfacing with development machines is from a terminal, and thus I leverage a lot of command-line tools to
get things done. For example, <small>*\*rings boxing bell\**</small> Vim is my primary text editor when I don't have (or
want) a GUI, configured via `~/.vimrc`. My customizations are relatively minimal, but significant enough where I do get
slowed down in a default configuration on a new machine. My shell configurations for both Bash and Zsh follow a similar
paradigm with their respective dotfiles.

### Manual Approach

Sure, I could (and have) done the poor man's sync of copying these files across to new machines manually as I bring them
up, but that leaves a lot to be desired. Beyond the mechanical effort, a single source of truth cannot effectively be
enforced across my Mac and Linux machines. Even if I make my `.vimrc` edits on my primary Mac and then `scp` them over
to each Linux server, that doesn't help the fact that macOS defaults to Zsh as its shell while the Debian uses Bash.

These environments *could* be coerced to be more similar (by switching shells, for example), but to me that adds
unnecessary friction as opposed to leaning into what the operating system prefers. In general, if I find myself fighting
too much with a tool that's not critical, I tend to throw it out and try something else that works with me, not against
(after all, isn't that what they should aspire to be?).

To be fair, most of my dotfiles change rarely and I'm not bringing up new machines daily (or even close to that), which
is likely why the manual approach got me by for as long as it did. But I knew I could do better.

### Extending Ansible Playbooks

Given that I recently brought my homelab [under the management of Ansible](/blog/orchestrating-my-homelab/), extending
the playbooks I created to also deliver dotfiles was a viable option. It would have been a fairly simple addition:

```yaml
- name: Copy dotfiles
  ansible.builtin.copy:
    src: "{{ item }}"
    dest: "/home/{{ ansible_user }}/"
    owner: "{{ ansible_user }}"
    mode: "0644"
  loop:
    - .bash_profile
    - .bashrc
    - .vimrc
```

While this would put dotfile management in much better shape, it would still exclude machines not managed by Ansible.
You could argue (and I would not immediately counter) that all machines *should* be brought under Ansible, but it's not
realistic for me. Some machines could in theory, but likely won't (such as my work Mac). Other times, I want to test
drive a new OS and/or hardware and have a comfortable development environment to work in without committing to adding it
to my Ansible inventory. So with that, this approach was also out.

## chezmoi to the Rescue

Taking a step back, the scope of these dotfiles is really just a subset of my personal development configuration. They
do not capture every tool I use, but do represent the critical mass to take a fresh Unix environment into one that I
work well within. As such, it made sense to find a purpose-built tool that captures that essence. Enter,
[chezmoi](https://www.chezmoi.io).

While I came across chezmoi years ago and made an initial effort to manage some dotfiles with it, only recently did I
give it more of an in-depth look. It represents what I feel makes a great tool: does one thing really well with
thoughtful flexibility built-in to unlock powerful functionality.

As its core, chezmoi uses a Git repository as the single source of truth for dotfiles and wraps the management of its
contents in an intuitive interface. It handles the mapping of each dotfile from the Git tree into its actual OS
destination and synchronizes all local files against the upstream with one command: `chezmoi update`.

The documentation is quite thorough, so rather than rehashing it here I'll focus on features that were particularly
useful to me.

### Templating

chezmoi supports Go templates to conditionally include file content, indicated by using the `.tmpl` file extension. This
gracefully handled my machine-to-machine differences. For example, the following `~/.gitconfig` snippet allows me to
manage one file that adds Fork as my diff tool only on macOS:

```go
[pull]
    rebase = true
{{- if eq .chezmoi.os "darwin" }}
[diff]
    tool = fork
{{- end }}
```

Templates are also supported in the `.chezmoiignore` file, allowing selective exclusion of files:

```go
README.md

{{ if eq .chezmoi.os "darwin" }}
.bashrc
.bash_profile
{{ end }}

{{ if eq .chezmoi.os "linux" }}
.zshrc
.zprofile
.ssh/config
{{ end }}

{{ if eq .chezmoi.hostname .work.hostname }}
.ssh/config
{{ end }}
```

This solved one of my [initial issues](#manual-approach), allowing me to deliver only the relevant shell configuration
to each machine and also draw a line between work and personal machines (since I want to leave my work SSH configuration
alone). Also in the above example, template variables can be provided in a data file (`.chezmoidata.yaml` in my case) to
avoid duplicating them across multiple files:

```yaml
work:
  hostname: my-work-hostname
```

This provides all of the flexibility I would be looking for in my dotfiles while still being simple to manage.

### Scripting

chezmoi also has the capability to run scripts on your behalf as part of an update, with your choice of executing them
every time or on change (controlled by the filename prefix). The scripts live alongside the dotfiles in the Git
repository, but stay inside the checkout directory as opposed to being copied out. To me, this unlocks Ansible-esque
task automation and makes chezmoi essentially able to do anything.

My prime use case for this is a macOS configuration script I use to set various system preferences (keyboard, Finder,
Dock, etc.). Initially, I had chezmoi manage this script like any other dotfile and ran it manually. However, having
chezmoi also handle the execution is much more robust because it guarantees that the script runs automatically on every
Mac. Internally, chezmoi hashes the script and only reruns it if the content has changed (independent of file renames).

As exciting as this is, however, I would be mindful to strictly limit any additional scripts to only configure
environment-related properties.

## Ansible Integration

While I initially considered [using Ansible](#extending-ansible-playbooks), it and chezmoi need not be
mutually-exclusive. Since my homelab playbooks already install a minimal set of development tooling, it felt natural to
integrate chezmoi as part of them to provide a familiar development environment on each server.

chezmoi binaries are distributed in many ways, but unfortunately the Debian apt repositories is not one of them.
Therefore, a few more steps where required to install the latest package from GitHub, but the important ones are:

```yaml
- name: Initialize chezmoi with dotfiles repo
  ansible.builtin.command: "chezmoi init {{ chezmoi_repo }}"
  become: true
  become_user: "{{ ansible_user }}"
  args:
    creates: "/home/{{ ansible_user }}/.local/share/chezmoi"

- name: Update and apply chezmoi dotfiles
  ansible.builtin.command: chezmoi update
  become: true
  become_user: "{{ ansible_user }}"
  changed_when: false
```

Note that chezmoi does support an `--apply` flag on its `init` command to make the operation atomic, but breaking it
apart like this ensures that the initialization step only runs once, with the `update` command being idempotent.

## Conclusion

chezmoi brought my dotfiles management in line with my broader philosophy of minimizing machine-to-machine differences.
Instead of maintaining separate configurations, I now have one source of truth that adapts to each environment. The
templating gracefully handles OS and role differences that previously required manual intervention, while the scripting
enables capabilities beyond static files. Most importantly, integrating this with Ansible allows my managed
infrastructure to inherit this improved setup automatically. Now my dotfiles have better posture than I do!

---

📁 **Source**: [View on GitHub](https://github.com/benprisby/dotfiles)
