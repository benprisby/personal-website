---
title: Orchestrating My Homelab
date: 2025-09-04T08:30:57-04:00
draft: false
author: Ben Prisby
image: /blog/orchestrating-my-homelab/feature.jpg
tags:
  - homelab
  - ansible
  - docker
  - automation
---
I recently wrote a [tour of my homelab](/blog/homelab-tour-2025/), where I discussed my current hardware and software
choices. At the beginning of that post, I outlined some guiding principles for those choices, one of which was:

> Capture infrastructure as code wherever possible

Almost all services in my homelab are configured using Docker Compose stacks, effectively capturing them as code in
these `docker-compose.yaml` files (plus any other assets like configuration files). This accomplishes capturing *what*
each service is and *how* it runs, but not *where*. Nor does it express anything about the Docker host environment, i.e.
the servers in the homelab. I wanted to do better about practicing what I preach.

## Host Operating System

A key benefit of containerization is that the host requirements become much more minimal compared to running services
bare-metal. Thus, each server needs little more than the Docker runtime on top of a stable Linux distribution, along
with a small collection of useful utilities to make my development and debugging life easier. Host package versions also
become less important since all service dependencies are captured within the container.

My Linux distribution of choice is Debian Bookworm (though at time of writing this, Trixie just became stable and may be
worth jumping to). This also happens to be the base of Raspberry Pi OS (not to be confused with the previous Raspbian).
My rationale for Debian boils down to its emphasis on stability and reduced clutter compared to derivative distributions
like Ubuntu. I also have much more experience with Debian-based systems than RPM.

### Why Not Yocto?

The better question might be *"why Yocto?"*...just kidding. A custom distribution feels overkill for my setup given that
I am running this at home with only the above limited needs for the OS. There is certainly something to be said about
the minimal footprint a Yocto image achieves combined with complete package auditing and ground-up control of every
file, but I opted to keep things simple and use something off-the-shelf. This also keeps me focused more on the services
themselves rather than maintaining the OS.

## Introducing Ansible

With the OS settled, [Ansible](https://www.ansible.com) was the natural choice for capturing everything on top of it for
each server. I first came across Ansible at work when working with our DevOps team, where playbooks describe our build
server infrastructure. I then became more familiar with its concepts through many of
[Jeff Geerling's excellent videos](https://www.youtube.com/playlist?list=PL2_OBreMn7FqZkvMYt6ATmgC0KAGGJNAN). While
likely stating the obvious, Ansible is incredibly powerful and flexible, with its collections providing functionality
for configuring more or less every nook and cranny of a system (and *then* there are the additional roles all across
GitHub and Ansible Galaxy, such as [Jeff's](https://galaxy.ansible.com/ui/standalone/namespaces/2492/)).

Ansible is [quite flexible](https://docs.ansible.com/ansible/latest/tips_tricks/sample_setup.html) in how a project can
be laid out. I won't cover every detail in this post (see [the GitHub repository](https://github.com/benprisby/homelab)
for that), but I will discuss my higher-level thinking for doing things the way I did, with some examples.

### Inventories

My homelab has 5 servers: one NUC and four Raspberry Pis. Naturally, it made sense to group them by hardware type since
some tasks would only apply to one (e.g. kernel `cmdline.txt` configuration on Raspberry Pi). However, I also wanted to
add functional groups in case these servers expand to do more than just run Docker containers.

For simplicity, I use the same user account name on all servers. As such, the inventory only needs to cover what varies:
the IP address. The resulting `production` inventory file looks like:

```yaml
nuc:
  hosts:
    big-slice:
      ansible_host: 10.20.0.15
raspberry_pi:
  hosts:
    small-slice-01:
      ansible_host: 10.20.0.11
    small-slice-02:
      ansible_host: 10.20.0.12
    small-slice-03:
      ansible_host: 10.20.0.13
    small-slice-04:
      ansible_host: 10.20.0.14
docker_hosts:
  children:
    nuc:
    raspberry_pi:
```

### Variables

The inventory file is limited to host connection information and groupings. All other host-specific variables go into
their respective `host_vars` file. For example, here is one of the Pis:

```yaml
hardware:
  model: Raspberry Pi 4
  type: raspberry_pi

docker_services:
  - adguard
  - dockerproxy
  - monitoring-agent
  - portainer-agent
```

This makes it simple for me to add/remove services on a per-server basis. There is some duplication since right now the
Pis all run the same set of services, but I do anticipate that changing down the road.

Any host-agnostic configuration resides in `group_vars`. This includes items like the `ansible_user`, list of apt
packages to install on each host and the `/etc/docker/daemon.json` Docker configuration file contents. I ideally try to
push things here *before* `host_vars` to force consistency among the servers. After all, less variability directly
reduces my cognitive load and increases scalability for when my homelab inevitably expands.

Finally, anything secret is encrypted in a single `vault.yml` file under `group_vars`. This allows me to safely put
passwords and keys under version control, keeping them alongside everything else. I weighed spreading the secrets out
instead of a global file, but in the end preferred only needing to work with a single encrypted file in the codebase:

```shell
ansible-vault edit group_vars/all/vault.yml
```

### Roles

In the simplest case, a single role for all servers to become would have worked fine, but I wanted more flexibility for
the future without overdoing it:

| Role              | Description |
| ----------------- | ----------- |
| `common`          | Base OS and hardware configuration  |
| `docker`          | Docker engine and plugin installation (credit: [Jeff Geerling](https://github.com/geerlingguy/ansible-role-docker)) |
| `docker_services` | Docker Compose stacks deployment |

I felt this provided natural insertion points throughout the software stack for changes. The `common` role lays
consistent groundwork for all servers, with the additional roles adding the application-specific functionality each
needs. Today, that's just Docker Compose. But tomorrow, it could be Kubernetes, a development environment, or a unique
hardware setup.

#### `docker_services` Role

Each Docker Compose stack is organized by name under `files`. Each of these subdirectories contains, at minimum, the
`docker-compose.yaml` file. Any additional files services may require are placed alongside it or in the
parallel-structured `templates` directory. Using Jinja2 templates allows not only referencing Vault secrets, but also
avoiding hardcoding things like IP addresses (e.g. `{{ hostvars['small-slice-04']['ansible_host'] }}`).

The role's tasks are kept generic to make adding, removing, or editing services entirely limited in scope to their
respective subdirectories. The slightly-increased task complexity is worth it to me so I can stay focused on the Compose
files. Adding a new service minimally consists of:

1. Create `roles/docker_services/files/<service>/docker-compose.yaml`.
2. Add `<service>` to one or more `docker_services` lists in `host_vars` to assign it to a server.
3. Run the site playbook.

### Playbooks

The most satisfying part of attempting to plan a sensible inventory + role configuration is that the main `site.yml`
playbook just connects the dots:

```yaml
- name: Configure all hosts
  hosts: all
  become: true
  roles:
    - common

- name: Set up Docker on all Docker hosts
  hosts: docker_hosts
  become: true
  roles:
    - geerlingguy.docker

- name: Deploy Docker services
  hosts: docker_hosts
  become: true
  roles:
    - docker_services
```

Now with one command, all services are deployed across all servers in parallel:

```shell
ansible-playbook site.yml --ask-vault-pass
```

#### Updating Servers

Even with `unattended-upgrades` running to automatically install security patches, I would occasionally go
server-to-server and update everything with a script:

```bash
#!/bin/bash

set -e

sudo apt update
sudo apt full-upgrade -y
sudo apt autoremove -y

cd ${HOME}/docker
for project in $(ls -1); do
    cd ${project}
    docker compose pull
    docker compose up -d
    cd ..
done
docker system prune -f
```

In Ansible, this functionality was simple to capture in a `system-update.yml` playbook:

```yaml
- name: Update all systems
  hosts: all
  become: true

  tasks:
    - name: Update apt cache and upgrade packages
      ansible.builtin.apt:
        update_cache: true
        cache_valid_time: 3600
        upgrade: full
        autoremove: true

    - name: Pull latest Docker images for services
      community.docker.docker_compose_v2:
        project_src: "{{ docker_projects_path }}/{{ item }}"
        state: present
        pull: always
      loop: "{{ docker_services }}"
      when: docker_services is defined
      become: true
      become_user: "{{ ansible_user }}"

    - name: Prune Docker
      community.docker.docker_prune:
        containers: true
        images: true
        networks: true
        builder_cache: true
      when: docker_services is defined
      become: true
      become_user: "{{ ansible_user }}"
```

Now instead of SSHing into each server and running a script, I can just run the playbook and have all servers update
simultaneously! <small><i>...What could possibly go wrong with that strategy?</i> 🙃</small>

## Looking Back (and Ahead)

Using Ansible to orchestrate my homelab servers has dramatically decreased the amount of time I spend updating them and
working with Docker services. Having a holistic view of everything in one codebase keeps me focused on how everything
fits together while still being able to express server-specific oddities.

Having everything under Git also opens the door for GitOps opportunities. The low-hanging fruit would be automating the
playbook to run post-commit, likely by making one my servers a self-hosted GitHub Actions runner. Or, servers could
periodically fetch the latest desired state and apply it themselves (though that would require Ansible to be installed
on each server). Regardless, it would enforce the repository as the single source of truth and keep servers in sync with
it.

---

📁 **Source**: [View on GitHub](https://github.com/benprisby/homelab)
