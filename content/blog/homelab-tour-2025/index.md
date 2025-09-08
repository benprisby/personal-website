---
title: Homelab Tour (2025)
date: 2025-09-02T05:37:21-04:00
draft: false
author: Ben Prisby
image: /blog/homelab-tour-2025/feature.jpg
tags:
  - homelab
  - docker
  - hardware
  - networking
  - monitoring
---
For years, I've built and maintained a homelab to serve as a self-hosted infrastructure playground. In addition to
running several critical services for my home network and smart home, it allows me to experiment with new technologies
outside of work and keeps me motivated to learn new things.

## Goals

To be perfectly clear, I'm not attempting to establish a grandiose set of axioms for my homelab. It is in no way even
close to as elaborate as many of the setups I see. However, I do believe enumerating a list of principles keeps me
focused on the right things as the setup evolves with me:

- Serve as a learning platform for hardware and software
- Stay nimble and open-minded about new software technologies
- Maximize hardware utilization *before* considering upgrades
- Support rapid prototyping: do it, then do it right, then do it fast
- Capture infrastructure as code wherever possible
- Keep power consumption minimal

## Background

After being introduced to the concept of a homelab (mostly from many hours down the YouTube rabbit hole with channels
like [Jeff Geerling](https://www.youtube.com/@JeffGeerling), [Techno Tim](https://www.youtube.com/@TechnoTim), and
[The Geek Pub](https://www.youtube.com/@TheGeekPub)), I started with one humble Raspberry Pi 4 that I deployed Pi-hole
on to enrich DNS filtering on my home network. At the time, I was using a cheap Linksys router + access point I found on
clearance, so there was little visibility into what devices on the network were doing. As smart home (and more generally
IoT) devices became more popular and I added more of them to my home, Pi-hole let me keep an eye on where they were
dialing out and easily block many telemetry and ad endpoints while providing a nice dashboard to view statistics.

From here, you could say I got the bug and gradually (no, rapidly) added more hardware to the network, starting with 3
more Pis and later a NAS, UniFi networking gear, and a NUC, which I will detail more in the
[hardware section](#hardware). There was plenty of intermediate hardware along the way that mostly wound up given to a
friend or relegated to the back of a closet, mostly second-hand network gear and old desktops I repurposed as servers.
An important lesson I learned is that you will indeed get caught in the infinite cycle of looking for the next shiny toy
to upgrade to in your homelab. And when you cross one off your list, you add two more...

Even before all this, I was interested in having a server for syncing backups of my important data, which included the
following hilarious gutting of a retired family PC put on full display in my childhood bedroom:

{{< figure src="old-desktop.jpg" alt="Old desktop" caption="\"Repurposed\" old desktop turned backup server (2014)" >}}

From a software perspective, I added more services to take advantage of the new hardware. I started running most of them
bare-metal, but gradually moved to containerizing them with Docker and capturing the stack in a Compose file. I did
experiment with Kubernetes (K3s cluster on those 4 Raspberry Pis) and Docker Swarm for a bit, but moved back to Compose
stacks on each server to reduce deployment complexity. I do plan on revisiting them at some point though.

## Hardware

All of the central hardware is housed in an 8U rack that currently sits in a hutch in my office. This keeps it out of
sight while still providing easy access to anything I want to poke at. The hutch is adjacent to the closet containing
the access panel for ethernet and coax runs in the home, so this keeps cable runs nearly invisible (in-wall was not an
option).

To keep things cool, I installed a small exhaust fan in the back of the hutch. I could get away with no fan, but this
one is silent on low speed and keeps air moving from the gaps in the hutch front doors out through the back.

### Network

I made the switch to the UniFi ecosystem back in 2020 and never looked back. Comparing today to back then, the software
has matured extensively both in terms of stability and functionality (at least to me). I did flirt with moving to
pfSense on a custom box more than once, but never could bring myself to switch away from the full integration
Ubiquiti offers with one of their gateways.

Currently, I have:

- **UniFi Dream Machine Pro**: Network gateway and Unifi controller
- **UniFi Standard 24 PoE**: Access switch providing power to downstream devices
- **UniFi U7 Pro Wall**: Access point serving the entire home
- **UniFi Flex Mini**: Edge switches in various rooms where more ports are needed

{{< figure src="network-topology.jpg" alt="Network topology" caption="UniFi network topology (wired devices only)" >}}

### Servers

The analogy I use when naming my infrastructure servers is a pie. There are slices of varying size. And many slices are
*Raspberry* 🥁...okay, all done with that.

#### The Small Slices

I have been using Raspberry Pis for a long time and have always been impressed with how much performance I've squeezed
out of them (along with the infinite use cases for them in DIY projects). As home servers, they draw very little power,
are easy to extend with hardware upgrades, and are cheap to replace if they ever release the magic white smoke.

Currently, I have **4x Raspberry Pi 4s with PoE hats** mounted in a 1U rack. With the hats, they are powered off the
access switch so I can remotely power cycle them if needed. They are named `small-slice-#`, from `-01` to `-04`. The
first Pi is an 8 GB RAM model, while the rest are 4 GB. Each Pi has a 64 GB SD card and runs Raspberry Pi OS Bookworm.

I did experiment with booting off some SATA SSDs I had in my parts bin, connecting them with a USB adapter. However, I
rolled back to some higher-quality SD cards once I abandoned running a K3s cluster on them (the high write cycles of
etcd would severely wear down an SD card and serve as a tangible bottleneck). I don't need the improved disk performance
for the current role of the Pis in the homelab, anyway. Reliability is of course on my mind, but I'm not too worried as
long as the infrastructure is reproducible and I have redundancies.

#### The Big Slice

My main server is an **11th Gen Intel NUC** named `big-slice`, which is compact and provides excellent performance. Its
specs are:

- Core™ i3-1115G4 processor
- 16 GB RAM
- 1 TB NVMe drive
- 2.5G ethernet
- Debian 12 (Bookworm)

If needed, the RAM could be upgraded to 64 GB, but so far I still have ample headroom.

#### The Box

For storage, I have a **Synology DS920+ NAS with 3x 4 TB Seagate IronWolf HDDs**. The drives are configured as a single
storage pool with Synology Hybrid RAID (SHR). With 1-drive fault tolerance, I have ~8 TB of usable storage, with one
slot free to add another drive if needed (which honestly, might be very soon).

In the M.2 slots are 2x Crucial 250 GB SSDs configured in RAID0 as a read-only cache.

### Workstation

My main machine is a **14-inch MacBook Pro (M2 Pro, 2023) with 16 GB RAM and 512 GB SSD**. I didn't feel the need to get
more storage because of the NAS and because none of my software development workloads demand much space. Plus, it forces
me to practice good disk hygiene 🧼.

Normally, it is docked to a CalDigit TS4 that gives me a proper desktop setup with monitors, DAC + amplifier for my
headphones, and other peripherals. Having a single Thunderbolt cable to connect the Mac to the dock is very convenient.
Even without a dedicated desktop machine (likely to be a Mac mini down the road), I have the same experience while also
being able to quickly throw the MacBook in my backpack to-go.

## Software

With the hardware discussion out of the way, I'll survey all of the services running across my homelab. These can be
loosely grouped into the following categories, though things are always in flux. Subsequent posts may go into more
detail on a particular area or problem I was trying to solve.

Unless otherwise noted, each service is deployed as a Docker container part of a Compose stack.

### Networking

| Service                                                           | Server(s)       | Description |
| ----------------------------------------------------------------- | --------------- | ----------- |
| [AdGuard Home](https://adguard.com/en/adguard-home/overview.html) | `small-slice-*` | Network-wide DNS filtering and ad blocking |
| [Nginx Proxy Manager](https://nginxproxymanager.com)              | `big-slice`     | Reverse proxy with SSL certificate management |
| [Tailscale](https://tailscale.com)                                | `big-slice`     | VPN for secure remote access |

After many years with Pi-hole, I switched to AdGuard Home for its extended feature set, namely built-in DNS-over-HTTPS
(DoH) support. I run the [oisd blocklist](https://oisd.nl) to block most ad, malicious, and tracking domains without
breaking day-to-day apps and websites (though I do use a more aggressive list per-browser via the AdGuard plugin).

Nginx Proxy Manager is my entrypoint to all services, providing friendly mappings to each while also handling SSL
certificates for my domain. By adding the appropriate DNS records, I can securely access any local service under the
`home.benprisby.com` subdomain and not worry about approving self-signed certificates or remembering IP addresses and
ports.

I always enable a VPN to get back home when on untrusted networks (or just want to access one of my servers). While I
just starting using it recently, I have been very impressed with Tailscale. I previously used WireGuard barebones, with
PiVPN, and through UniFi Teleport, but Tailscale abstracts away connection details while adding secure relaying
capabilities when a direct route cannot be established. Fantastic!

### Landing Page

| Service                             | Server(s)   | Description |
| ----------------------------------- | ----------- | ----------- |
| [Homepage](https://gethomepage.dev) | `big-slice` | Unified dashboard and landing page for all homelab services |

Homepage provides a simple, flexible landing page that serves as the index for all services. It also includes other
useful content like web links and weather. More significantly though, it provides high-level statuses of all Docker
containers and includes an extensive plugin list to fetch the most interesting metrics from each service. For example,
I can see query counts and block rates for my AdGuard servers directly from this page.

{{< figure src="homepage.jpg" alt="Homepage" >}}

### Monitoring

| Service                                                                       | Server(s)   | Description |
| ----------------------------------------------------------------------------- | ----------- | ----------- |
| [Prometheus](https://prometheus.io)                                           | `big-slice` | Metrics collection and time-series database |
| [Grafana](https://grafana.com)                                                | `big-slice` | Visualization and alerting for monitoring data |
| [UnPoller](https://unpoller.com)                                              | `big-slice` | UniFi device metrics exporter for Prometheus |
| [Speedtest Exporter](https://github.com/MiguelNdeCarvalho/speedtest-exporter) | `big-slice` | Periodic network speed test results collection |
| [Node Exporter](https://github.com/prometheus/node_exporter)                  | all         | Host system metrics (CPU, memory, disk, network) |
| [cAdvisor](https://github.com/google/cadvisor)                                | all         | Container resource usage and performance metrics |
| [Network UPS Tools (NUT)](https://networkupstools.org/)                       | `nas`       | UPS monitoring and alerting |

Prometheus is the centralized database where I more or less attempt to gather as many useful metrics as I can from my
servers, although I'm sure there is room for improvement. Node Exporter and cAdvisor give me loads of details about each
host and its Docker environment, enabling useful resource tracking over time. UnPoller does a similar task for all of my
UniFi equipment, offering a richer view into their data than that the UniFi apps provide.

Grafana serves as the visualization platform for Prometheus, where I have many dashboards set up to quickly look at
statistics. I have a playlist set up that cycles through these, displayed in kiosk mode on a small 7-inch touchscreen in
my office for the occasional glance.

{{< figure src="grafana.jpg" alt="Grafana dashboard" caption="Node metrics dashboard for big-slice" >}}

The Speedtest Exporter runs an Ookla speed test every 30 minutes and exposes metrics for Prometheus to scrape. This
allows me to observe my home internet connection in addition to what the UniFi gateway is already doing. Every time I
look at the ping, I am more and more depressed to be stuck with cable internet as my only option. But it does allow me
to keep my ISP honest with hard data to back up outages or slow performance if I do need to bother them.

Finally, the brilliantly-named NUT server exposes the state of my UPS to each server and allows them to safely shut down
if power is lost and the battery is almost depleted. The UPS is connected to the NAS via USB, mostly because Synology
already includes the server and provides a simple interface for configuring it.

### Smart Home

| Service                             | Server(s)   | Description |
| ----------------------------------- | ----------- | ----------- |
| [Homebridge](https://homebridge.io) | `big-slice` | HomeKit integration for non-native smart devices |
| [OctoPrint](https://octoprint.org)  | `octopi` *  | 3D printer management and monitoring interface |

<small>* — Raspberry Pi 3B+ using off-the-shelf [OctoPi image](https://octoprint.org/download/#octopi)</small>

My smart home is centered around Apple Home, using HomeKit wherever possible. This likely warrants a dedicated post, but
some devices lack native HomeKit or Matter support (e.g. Nest thermostat, Levoit air purifiers). Homebridge presents
these as native devices to Apple, bridging their underlying protocols. It works well and also allows me to add virtual
devices like dummy switches for automations.

I have a Prusa MK3S+ that I use for all of my 3D printing needs. OctoPrint adds a remote management interface that
allows uploading G-code files from a web browser and monitoring prints. It saves me the hassle of putting files on the
SD card and allows an otherwise "dumb" printer to participate in the smart home.

### Logging

| Service                        | Server(s)   | Description |
| ------------------------------ | ----------- | ----------- |
| [Graylog](https://graylog.org) | `big-slice` | Centralized log management and analysis platform |

After experimenting with other log servers, I settled on Graylog. It provides a nice interface for streaming and
filtering logs coming from my servers and other homelab equipment. Graylog exposes many inputs to ingest logs, but I
opted for syslog. All servers and UniFi devices forward their logs for centralized monitoring and troubleshooting.

On the servers, the Docker daemon is configured to use the syslog logging driver by default, so all containers
automatically have their logs forwarded (albeit there is a slight loss of data fields compared to each application
directly sending them, but it's sufficient for now).

### Backups

| Service                                           | Server(s) | Description |
| ------------------------------------------------- | --------- | ----------- |
| [Gickup](https://github.com/cooperspencer/gickup) | `nas`     | Automated Git repository backup tool |
| [Kiwix](https://www.kiwix.org)                    | `nas`     | Offline Wikipedia and content server |

As probably expected, the NAS is the backup destination for all machines. All Macs have Time Machine enabled for full,
iterative system backups over the network. Synology Cloud Sync keeps a local backup of Google Drive, even though Google
Docs are converted into *bleh* Microsoft Office counterparts. Finally, Gickup keeps an untouched backup of all of my
repositories.

Kiwix is somewhat of a wildcard and admittedly not something I use much, but having my own copy of Wikipedia was an idea
I got from Mike at The Geek Pub and for the ~100 GB is takes for a full archive, it's nice to have.

### Container Management

| Service                                                          | Server(s)              | Description |
| ---------------------------------------------------------------- | ---------------------- | ----------- |
| [Portainer Server](https://www.portainer.io)                     | `big-slice`            | Docker management and web interface |
| [Portainer Agent](https://www.portainer.io)                      | `small-slice-*`, `nas` | Remote connector for additional Docker hosts |
| [Docker Proxy](https://github.com/Tecnativa/docker-socket-proxy) | all                    | Secure Docker API access |

While the Docker Compose stacks are not managed by Portainer, it still provides a nice web interface for visibility into
the state of each server. It also allows me to see into the NAS, where I don't control the OS. Some limited controls are
available in this mode to interact with containers, but I mostly use it as a monitoring tool.

## Future Upgrades

Though I am reasonably happy with the state of my homelab today, I am always looking ahead to what could be improved.
Here are some of the ones at the top of my mind.

### Beyond Gigabit

Making the jump to 10G networking is at the top of my list. While I am currently getting by fine with gigabit, the extra
throughput would unlock more performance out of hardware I already own (UDM Pro, NUC, access point, Mac dock). Even
stepping up to 2.5G would provide tangible speedups for transfers on the local network (and most of my high-performance
devices have 2.5G NICs already).

This upgrade would start with replacing the access switch, likely with a UniFi Pro HD 24 PoE. All cable runs are already
at least Cat6, with none of them exceeding 100 feet, so 10G *should just work™*. I would also swap at least one of the
Flex Minis with their 2.5G sibling, since the U7 access point is uplinked through one of them in my current topology.

Since my current Synology only has 2x 1G ports (and aggregating them does not give throughput beyond 1G for a single
client), I would either try a USB dongle or consider moving up to a UNAS Pro. I have been keeping an eye on the UNAS as
a very compelling bang-for-the-buck, but have been waiting for more time in the field before swapping over such a
critical piece of infrastructure.

These would be the most impactful upgrades, with others like our Macs occurring naturally down the line as they age.

### Improving the Pi Cluster

I do want to revive my Kubernetes journey at some point. The 4 Pis are somewhat underutilized as-is, with AdGuard being
the most critical service they run. This, however, could be moved onto `big-slice`, perhaps using keepalived with one Pi
as a backup. The other services are monitoring agents that should be relatively straightforward to migrate into a
Kubernetes cluster.

While I don't currently host any external services out of my homelab, I do have a casual interest in high-availability
(HA) computing. It would also be nice to add redundancy to some of my existing services handling monitoring and logging.
This would mostly be done in the name of learning, but nonetheless is something I'd like to become more proficient with.

### Adding Alerting

The monitoring stack as-is does not provide real-time alerting of any issues with my servers or their services. Since I
am using Prometheus, I would likely go with Alertmanager to handle infrastructure-related alerts using the metrics being
scraped, e.g.:

- High resource (CPU/memory) usage
- Low disk space
- Docker container failures or restart loops
- Thermal throttling, where supported
- Poor internet speeds or test failures
- Host reachability issues

Beyond this, I would explore other notification integrations for services like NUT and OctoPrint to be informed
immediately if a critical issue like power loss or print failure occurs. Getting notifications via email would suffice,
but ideally push notifications or text messages would be even better. As with any of these upgrades, as long as each
iteration teaches me something new and solves a real problem, I know I'm heading in the right direction.

---

📁 **Source**: [View on GitHub](https://github.com/benprisby/homelab)
