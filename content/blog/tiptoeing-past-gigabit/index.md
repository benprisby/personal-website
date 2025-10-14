---
title: Tiptoeing Past Gigabit
date: 2025-10-13T14:10:29-04:00
draft: false
author: Ben Prisby
image: /blog/tiptoeing-past-gigabit/feature.jpg
tags:
  - networking
  - unifi
  - homelab
  - hardware
---
At the end of my most recent [homelab tour](/blog/homelab-tour-2025/), I pondered upgrading my home network capabilities
past gigabit to improve throughput and take better advantage of hardware I already own. I laid out a few ideas in that
post for avenues to take, but have since made the jump and wanted to outline my thought process for this upgrade.

## Why (Not) Upgrade?

Prior to this upgrade, gigabit networking had been serving me well. As a software engineer, most of my workflows do not
incur heavy local network traffic, if at all. Development is mainly done directly on my primary workstation.
Occasionally, I may have large transfers to and from my NAS (e.g. backups, disk images, etc.), but speed is less
critical for these cases. The backup may complete faster, but it's a background task. I may save 10-20 seconds copying a
10 GB disk image to my Mac, but my life is not nearly that hyper-optimized (a boy can dream, though).

Also as a software engineer, however, I try to maximize performance from the gear that I already own (which is one of
my guiding principles for my homelab). Over the last year, I have accumulated several devices with onboard 2.5G NICs
that I was not able to take full advantage of:

- CalDigit TS4 Mac dock
- Big Slice server
- UniFi U7 Pro Wall access point

My Synology DS920+ could also be upgraded to 2.5G with a USB-ethernet dongle, which I will
[discuss later](#25g-on-the-nas).

Leaving this extra bandwidth on the table bothered me more and more as time went on and prices dropped on 2.5G network
gear. Even if I don't regularly saturate these links, the additional headroom does not hurt and it decreases friction
for adding higher-speed devices later since I will not feel pressured to upgrade the network at the same time.

### 2.5G vs. 10G

This upgrade was primarily meant to be pragmatic. If it wasn't, I would have purchased the UniFi Pro HD 24 PoE, swapped
it in place of my current Standard 24 PoE, and called it a day. As beautiful as that new switch would be, I decided
against it for a couple of reasons.

First, I currently have no 10G devices on the network. These future devices would be a Mac Studio, UNAS, and
upgraded/additional Big Slice nodes. The Mac Studio is planned in the next year or so, but the other upgrades are not
necessary for my current needs. So assuming *maybe* only one 10G device will arrive within the next 2 years, there is
little point to buying a switch that would be severely underutilized.

Second and more practical is cost. At its current price of $999, the HD switch does not make sense when I can perform a
more modest 2.5G upgrade for less than half of that and still have [room to expand to 10G](#future-aggregation). This is
*not* the say the HD is overpriced though; I feel it's an excellent value for its specs!

## New Switches

The nail in the coffin for this upgrade was UniFi releasing their Flex 2.5G line of switches, which provided a very
cost-effective entrypoint for an upgrade past gigabit. Since I only have a few 2.5G devices, I opted for a Flex 2.5G to
add to the main cabinet and a Flex Mini 2.5G to swap out in the bedroom, which you can see below:

{{< figure src="minis.jpg" alt="Minis" caption="Old Flex Mini switch (top) vs. new Flex Mini 2.5G switch (bottom)" >}}

Back in the network cabinet, the Flex 2.5G switch sits on the shelf alongside other non-rack devices like my cable modem
and smart home hubs. Rack-mount would be cleaner, but I have an unconventional arrangement with a rack sitting inside a
hutch in my office anyway. As long as the cabling is somewhat tidy and things are labeled, I am satisfied.

The wired network topology now features the newly-added `Core Switch` to ensure all 2.5G devices have an uplink
supporting their maximum speeds:

{{< figure src="topology.jpg" alt="Topology" caption="Upgraded network backbone topology" >}}

### Future Aggregation

If down the road I do want to go full 10G, the UniFi Aggregation switch is a compelling option. It would add 8 10G SFP+
ports that I would slot in between the UDM Pro and Flex 2.5G, providing a 10G backbone for future devices. And with its
current price of $269 combined with the Flex switches already purchased, this entire upgrade still comes in at less than
half the cost of a Pro HD 24 PoE switch.

This is not quite apples-to-apples, of course. But aside from needing transceivers for RJ-45 copper connections, I do
not need the additional capabilities of the HD switch such as layer 3 routing, PoE, or Etherlighting™ (but it sure does
look slick). I am mainly comparing these options since the HD as a one-stop-shop was my "B" option for this upgrade.

## 2.5G on the NAS

As part of this upgrade, I wanted to bring my Synology DS920+ NAS in line with other higher-speed devices. Its 2 onboard
gigabit ports do support link aggregation (which I was utilizing), but this still limits throughput to gigabit for a
single client. With a media server, for example, this can be undesirable if the streaming is done by a server other than
the NAS such that the server-NAS link could be a bottleneck even if the server is 2.5G. Since this example happens to be
relevant to me, I proceeded with this low-cost upgrade.

I purchased the Pluggable 2.5G USB adapter and coupled it with the
[Realtek driver for Synology devices](https://github.com/bb-qq/r8152). This model was chosen specifically because it is
well-tested. If you opt to do something similar, stick with a tested configuration since the NAS is such an important
piece of infrastructure. Installation was as simple as downloading the Gemini Lake build of the latest release,
installing it using the DSM Package Center, and rebooting the NAS. I then transitioned the static IP from the onboard
ports to the new adapter and reclaimed those 2 ports on the gigabit switch.

With about $20 and 10 minutes of setup time, the NAS was upgraded to 2.5G! Worth every penny!

## Results

The UniFi Network application reported all supported links had negotiated 2.5G, but I wanted to quick verify the
results. Using the Container Manager (Docker) on the NAS, I pulled the `networkstatic/iperf3` image and ran it with host
networking and the `-s` flag to start a server on the default port `5201`. Then on my main server, I ran a test:

{{< figure src="iperf3.jpg" alt="iPerf3" caption="Speed test results between NAS and Big Slice" >}}

As expected, the higher speeds were displayed and consistent. I chose to also run this through the NAS to ensure there
were no immediate issues with the USB adapter, though I will keep an eye on it.

Overall, this upgrade was a cost-effective way of providing much more growing room within my home network. With the
additional bandwidth, I am less concerned about being bottlenecked by gigabit links and am able to take better advantage
of hardware I already owned. 10G will likely come eventually, but for now I am satisfied with running core parts the
network 2.5x faster!
